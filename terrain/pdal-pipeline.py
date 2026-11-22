#!/usr/bin/env python3
"""
pdal-pipeline.py - one command from LiDAR to a phone-friendly terrain field map.

  python pdal-pipeline.py                      # built-in public sample (Molalla River State Park)
  python pdal-pipeline.py my_tile.zip          # DOGAMI tile zip (LAS/LAZ or bare-earth DEM inside)
  python pdal-pipeline.py points.laz           # any LAS/LAZ
  python pdal-pipeline.py dem.tif              # an existing bare-earth DEM (GeoTIFF / ESRI grid / .img)
  python pdal-pipeline.py --latlon 45.29,-122.70 --radius 300     # download from USGS 3DEP (EPT)
  python pdal-pipeline.py --bbox -122.71,45.287,-122.70,45.294

LOCAL BY DEFAULT. Every run above writes only to ./local-output/<name>/ next to this script and
never runs git or talks to GitHub. Add --serve to preview it (127.0.0.1 only; --lan for your
phone on the same Wi-Fi). Opening local-output/<name>/index.html directly (file://) also works.

--publish is ONLY for the built-in public demo sample. It rebuilds the sample into the repo's
GitHub Pages folder, refuses anything else unless you pass --i-understand-this-is-public AND
type the dataset name, scans what is about to be committed, then commits and pushes with YOUR
existing git login (credential helper or SSH key). This script never reads, stores or prints
a token.
"""
import argparse
import base64
import hashlib
import http.server
import json
import math
import os
import re
import shutil
import socket
import socketserver
import subprocess
import sys
import time
import zipfile
from functools import partial
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent                 # the gh-pages branch root = the public Pages site
WEB_SRC = HERE / "web"                  # app.js + vendor.js (committed)
LOCAL_OUT = HERE / "local-output"       # gitignored; real/private data lands here
WORK = HERE / ".work"                   # gitignored scratch (downloads, rasters)

FT_PER_M = 1.0 / 0.3048                 # international foot (EPSG:2269 uses the international foot)
TARGET_SRS = "EPSG:2269"                # NAD83 / Oregon North (ft). Molalla + Clackamas County are in the NORTH zone.
NODATA = -9999.0

# The one public demo sample. --publish only accepts this unless explicitly overridden.
SAMPLE = {
    "id": "molalla-river-sp-2019-v1",
    "name": "Molalla River State Park (public sample)",
    "lat": 45.2905, "lon": -122.7080, "radius_m": 300.0,
    "ept": "https://s3-us-west-2.amazonaws.com/usgs-lidar-public/OR_OLCMetro_2019/ept.json",
    "dataset": "USGS 3DEP OR_OLCMetro_2019 (Oregon Lidar Consortium / DOGAMI, 2019)",
}
USGS_BOUNDARIES = "https://raw.githubusercontent.com/hobuinc/usgs-lidar/master/boundaries/resources.geojson"
SITE_FILES = ["index.html", "data.js", "sw.js", "manifest.webmanifest", "icon.svg", ".nojekyll"]
POINTCLOUD_EXT = {".las", ".laz", ".zip", ".e57", ".ply", ".bpf", ".copc"}
RASTER_EXT = {".tif", ".tiff", ".img", ".adf", ".asc", ".vrt", ".dem", ".flt", ".bil", ".nc", ".jp2",
              ".png", ".jpg", ".jpeg", ".webp", ".gif"}


def log(msg):
    print(msg, flush=True)


def die(msg, code=2):
    print(f"\nERROR: {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


def need(mod):
    try:
        return __import__(mod)
    except ImportError:
        die(f"Python package '{mod}' is missing. Install the environment first:\n"
            f"  conda env create -f {HERE / 'environment.yml'} && conda activate terrain")


def sample_bbox():
    s = SAMPLE
    dlat = s["radius_m"] / 111320.0
    dlon = s["radius_m"] / (111320.0 * math.cos(math.radians(s["lat"])))
    return (s["lon"] - dlon, s["lat"] - dlat, s["lon"] + dlon, s["lat"] + dlat)


# ------------------------------------------------------------------ input resolution

def resolve_input(a):
    """Return dict(kind='points'|'raster'|'ept', path=..., name=..., is_sample=bool, ...)."""
    if a.input:
        p = Path(a.input).expanduser().resolve()
        if not p.exists():
            die(f"Input not found: {p}")
        name = re.sub(r"[^A-Za-z0-9_.-]+", "_", p.stem if p.is_file() else p.name)
        if p.suffix.lower() == ".zip":
            if a.skip_build and not a.publish:   # only serving the existing build; no need to unzip
                return {"kind": "zip", "path": str(p), "name": name, "is_sample": False}
            return unzip_and_find(p, name)
        if p.suffix.lower() in (".las", ".laz"):
            return {"kind": "points", "path": str(p), "name": name, "is_sample": False}
        return {"kind": "raster", "path": str(p), "name": name, "is_sample": False}
    if a.bbox:
        try:
            minx, miny, maxx, maxy = [float(v) for v in a.bbox.split(",")]
        except ValueError:
            die("--bbox must be minlon,minlat,maxlon,maxlat")
        bbox, name = (minx, miny, maxx, maxy), f"bbox_{miny:.4f}_{minx:.4f}"
    elif a.latlon:
        try:
            lat, lon = [float(v) for v in a.latlon.split(",")]
        except ValueError:
            die("--latlon must be lat,lon (for example 45.29,-122.70)")
        r = a.radius
        dlat, dlon = r / 111320.0, r / (111320.0 * math.cos(math.radians(lat)))
        bbox, name = (lon - dlon, lat - dlat, lon + dlon, lat + dlat), f"pt_{lat:.4f}_{lon:.4f}_r{int(r)}"
    else:
        return {"kind": "ept", "bbox": sample_bbox(), "ept": SAMPLE["ept"], "name": SAMPLE["id"],
                "is_sample": True, "dataset": SAMPLE["dataset"]}
    ept, dataset = (a.ept, a.ept) if a.ept else pick_ept(bbox)
    is_sample = (ept == SAMPLE["ept"] and all(abs(x - y) < 1e-6 for x, y in zip(bbox, sample_bbox())))
    return {"kind": "ept", "bbox": bbox, "ept": ept, "name": SAMPLE["id"] if is_sample else name,
            "is_sample": is_sample, "dataset": dataset}


def unzip_and_find(zpath, name):
    dest = WORK / "unzipped" / name
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    log(f"Unzipping {zpath.name} -> {dest}")
    with zipfile.ZipFile(zpath) as z:
        for m in z.infolist():                      # guard against ../ paths in the zip
            target = (dest / m.filename).resolve()
            if not str(target).startswith(str(dest.resolve())):
                die(f"Unsafe path in zip: {m.filename}")
        z.extractall(dest)
    files = [f for f in dest.rglob("*") if f.is_file()]
    pts = sorted([f for f in files if f.suffix.lower() in (".laz", ".las")], key=lambda f: -f.stat().st_size)
    if pts:
        if len(pts) > 1:
            log(f"  {len(pts)} point files found; merging all of them")
        return {"kind": "points", "path": [str(f) for f in pts], "name": name, "is_sample": False}

    def bare_first(c):  # DOGAMI names bare-earth products be_*, BE*, *bare*; highest-hit first
        n = str(c).lower()
        return (0 if re.search(r"(^|[\\/_ -])be|bare", n) else 1, -sum(f.stat().st_size for f in Path(c).rglob("*") if f.is_file()) if Path(c).is_dir() else -Path(c).stat().st_size)
    rasters = [f for f in files if f.suffix.lower() in (".tif", ".tiff", ".img", ".asc", ".flt", ".dem")]
    grids = sorted({f.parent for f in files if f.name.lower() == "hdr.adf"}, key=bare_first)
    if rasters:
        rasters.sort(key=bare_first)
        log(f"  using raster {rasters[0].relative_to(dest)}")
        return {"kind": "raster", "path": str(rasters[0]), "name": name, "is_sample": False}
    if grids:
        log(f"  using ESRI grid {grids[0].relative_to(dest)}")
        return {"kind": "raster", "path": str(grids[0]), "name": name, "is_sample": False}
    die("The zip has no LAS/LAZ point cloud and no DEM raster (GeoTIFF, .img or ESRI grid).")


def pick_ept(bbox):
    """Pick the USGS 3DEP EPT dataset covering the bbox centre (newest name wins)."""
    cache = WORK / "usgs-boundaries.geojson"
    if not cache.exists():
        log("Looking up which USGS 3DEP lidar collection covers this spot ...")
        import urllib.request
        cache.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(USGS_BOUNDARIES, cache)
    d = json.loads(cache.read_text())
    x, y = (bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2

    def inside(ring):
        c = False
        for i in range(len(ring)):
            x1, y1 = ring[i][:2]
            x2, y2 = ring[i - 1][:2]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                c = not c
        return c
    hits = []
    for f in d["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        if any(inside(p[0]) and not any(inside(h) for h in p[1:]) for p in polys):
            hits.append(f["properties"])
    if not hits:
        die("No USGS 3DEP EPT lidar covers that spot. Download a DOGAMI tile zip from "
            "https://gis.dogami.oregon.gov/maps/lidarviewer/ and pass the zip instead.")
    yr = lambda p: int((re.findall(r"(20\d\d)", p["name"]) or ["0"])[-1])
    best = sorted(hits, key=yr)[-1]
    log(f"  using {best['name']} ({len(hits)} collection(s) cover this spot)")
    return best["url"], f"USGS 3DEP {best['name']}"


# ------------------------------------------------------------------ PDAL: points -> DEM

def z_factor_for(srs_wkt, override):
    if override == "ft":
        return 1.0
    if override == "m":
        return FT_PER_M
    pyproj = need("pyproj")
    try:
        crs = pyproj.CRS.from_user_input(srs_wkt)
    except Exception:
        log("  WARNING: input has no readable CRS; assuming meters. Use --z-units to override.")
        return FT_PER_M
    axes = crs.axis_info
    unit = (axes[-1].unit_name if len(axes) == 3 else (axes[0].unit_name if axes else "metre")).lower()
    return 1.0 if ("foot" in unit or "feet" in unit) else FT_PER_M


def points_to_dem(src, a, dem_path):
    pdal = need("pdal")
    if src["kind"] == "ept":
        minx, miny, maxx, maxy = src["bbox"]
        r = 6378137.0
        mx = lambda lon: math.radians(lon) * r
        my = lambda lat: math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * r
        reader = [{"type": "readers.ept", "filename": src["ept"],
                   "bounds": f"([{mx(minx):.2f},{mx(maxx):.2f}],[{my(miny):.2f},{my(maxy):.2f}])"}]
        in_srs, zf = "EPSG:3857", (1.0 if a.z_units == "ft" else FT_PER_M)
        log(f"[PDAL] downloading 3DEP points for bbox {', '.join(f'{v:.5f}' for v in src['bbox'])}")
    else:
        paths = src["path"] if isinstance(src["path"], list) else [src["path"]]
        reader = [{"type": "readers.las", "filename": p} for p in paths]
        if len(paths) > 1:
            reader.append({"type": "filters.merge"})
        q = pdal.Pipeline(json.dumps({"pipeline": [dict(reader[0], count=0)]}))
        q.execute()
        md = q.metadata["metadata"].get("readers.las", {})
        if isinstance(md, list):
            md = md[0]
        in_srs = md.get("comp_spatialreference") or md.get("spatialreference") or ""
        zf = z_factor_for(in_srs, a.z_units) if in_srs else (1.0 if a.z_units == "ft" else FT_PER_M)
        log(f"[PDAL] reading {len(paths)} point file(s); Z unit factor to feet = {zf:.5f}")
    s = FT_PER_M  # SMRF/ELM/PMF parameters below are tuned in meters, scaled to feet
    stages = list(reader)
    stages += [
        {"type": "filters.expression", "expression": "Classification != 7 && Classification != 18"},
        {"type": "filters.reprojection", "out_srs": TARGET_SRS},
    ]
    if abs(zf - 1.0) > 1e-9:
        stages.append({"type": "filters.assign", "value": f"Z = Z * {zf:.10f}"})
    if a.use_existing_ground:
        log("[PDAL] using the provider's existing ground class (2)")
    else:
        stages += [
            {"type": "filters.assign", "value": "Classification = 0"},
            {"type": "filters.elm", "cell": 10 * s, "threshold": 1.0 * s},
            {"type": "filters.outlier", "method": "statistical", "mean_k": 8, "multiplier": 2.5},
            {"type": "filters.range", "limits": "Classification![7:7],ReturnNumber[1:],NumberOfReturns[1:]"},
            {"type": "filters.smrf", "slope": 0.15, "window": 18 * s, "threshold": 0.5 * s,
             "scalar": 1.25, "cell": 1.0 * s},
        ]
    stages += [
        {"type": "filters.range", "limits": "Classification[2:2]"},
        {"type": "writers.gdal", "filename": str(dem_path), "resolution": a.res, "output_type": "idw",
         "window_size": 6, "nodata": NODATA, "data_type": "float32", "gdaldriver": "GTiff",
         "gdalopts": "COMPRESS=DEFLATE,PREDICTOR=3", "override_srs": TARGET_SRS},
    ]
    log("[PDAL] noise removal -> " + ("existing ground" if a.use_existing_ground else "SMRF ground classification")
        + f" -> {a.res} ft DEM")
    n = pdal.Pipeline(json.dumps({"pipeline": stages})).execute()
    if n == 0:
        die("No ground points survived. Try --use-existing-ground or check the input.")
    log(f"       {n:,} ground points")


def raster_to_dem(src, a, dem_path):
    gdal = need("osgeo.gdal") and __import__("osgeo.gdal", fromlist=["gdal"])
    gdal.UseExceptions()
    ds = gdal.Open(src["path"])
    zf = z_factor_for(ds.GetProjection(), a.z_units) if ds.GetProjection() else (1.0 if a.z_units == "ft" else FT_PER_M)
    log(f"[GDAL] warping DEM {Path(src['path']).name} to {TARGET_SRS} at {a.res} ft (Z factor {zf:.5f})")
    tmp = dem_path.with_suffix(".warp.tif")
    gdal.Warp(str(tmp), ds, dstSRS=TARGET_SRS, xRes=a.res, yRes=a.res, resampleAlg="bilinear",
              dstNodata=NODATA, outputType=gdal.GDT_Float32, creationOptions=["COMPRESS=DEFLATE"])
    np = need("numpy")
    t = gdal.Open(str(tmp))
    arr = t.GetRasterBand(1).ReadAsArray().astype("float32")
    arr = np.where(arr == NODATA, NODATA, arr * zf).astype("float32")
    write_like(t, arr, dem_path, NODATA)
    t = None
    tmp.unlink()


# ------------------------------------------------------------------ GDAL + numpy helpers

def gd():
    from osgeo import gdal, ogr, osr
    gdal.UseExceptions()
    return gdal, ogr, osr


def read(path):
    gdal, _, _ = gd()
    ds = gdal.Open(str(path))
    b = ds.GetRasterBand(1)
    return ds, b.ReadAsArray().astype("float64"), b.GetNoDataValue()


def write_like(ref, arr, path, nodata, dtype=None):
    gdal, _, _ = gd()
    dtype = dtype or gdal.GDT_Float32
    out = gdal.GetDriverByName("GTiff").Create(str(path), ref.RasterXSize, ref.RasterYSize, 1, dtype,
                                               ["COMPRESS=DEFLATE"])
    out.SetGeoTransform(ref.GetGeoTransform())
    out.SetProjection(ref.GetProjection())
    b = out.GetRasterBand(1)
    if nodata is not None:
        b.SetNoDataValue(nodata)
    b.WriteArray(arr)
    out.FlushCache()
    out = None


def gdal_terrain(dem, w, a):
    gdal, _, _ = gd()
    log("[GDAL] multidirectional hillshade, slope, contours")
    gdal.DEMProcessing(str(w / "hillshade.tif"), str(dem), "hillshade", multiDirectional=True,
                       computeEdges=True, zFactor=1.0, creationOptions=["COMPRESS=DEFLATE"])
    gdal.DEMProcessing(str(w / "slope.tif"), str(dem), "slope", computeEdges=True,
                       creationOptions=["COMPRESS=DEFLATE"])
    for f in ("contours_2269.geojson", "contours.geojson"):
        if (w / f).exists():
            (w / f).unlink()
    if not shutil.which("gdal_contour"):
        die("gdal_contour is missing (it ships with GDAL; conda install -c conda-forge gdal)")
    # contour a lightly smoothed copy (cell >= 3 ft) so ground noise doesn't make thousands of tiny rings
    cres = max(a.res * 2, 3.0)
    gdal.Warp(str(w / "dem_contour.tif"), str(dem), xRes=cres, yRes=cres, resampleAlg="average")
    subprocess.run(["gdal_contour", "-q", "-a", "elev_ft", "-i", str(a.contour_interval), "-f", "GeoJSON",
                    str(w / "dem_contour.tif"), str(w / "contours_2269.geojson")], check=True)
    cj = json.loads((w / "contours_2269.geojson").read_text())
    def plen(c):
        return sum(math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]) for i in range(1, len(c)))
    keep = []
    for f in cj["features"]:
        g = f.get("geometry") or {}
        lines = [g["coordinates"]] if g.get("type") == "LineString" else g.get("coordinates", [])
        if sum(plen(l) for l in lines) >= a.min_contour_ft:
            keep.append(f)
    log(f"       {len(keep)} of {len(cj['features'])} contour lines kept (dropped pieces shorter than {a.min_contour_ft:g} ft)")
    cj["features"] = keep
    (w / "contours_2269.geojson").write_text(json.dumps(cj))
    simplify = max(a.res, 2.0)
    gdal.VectorTranslate(str(w / "contours.geojson"), str(w / "contours_2269.geojson"), format="GeoJSON",
                         dstSRS="EPSG:4326", simplifyTolerance=simplify, layerCreationOptions=["COORDINATE_PRECISION=6"])


# ------------------------------------------------------------------ WhiteboxTools hydrology

def hydrology(dem, w, a):
    whitebox = need("whitebox")
    gdal, ogr, osr = gd()
    np = need("numpy")
    wbt = whitebox.WhiteboxTools()
    wbt.set_verbose_mode(False)
    wbt.set_working_dir(str(w))
    # fill no-data holes (water, buildings) for hydrology only
    ds, arr, nd = read(dem)
    filled = gdal.GetDriverByName("GTiff").CreateCopy(str(w / "dem_filled.tif"), ds)
    gdal.FillNodata(filled.GetRasterBand(1), None, 200, 0, callback=None)
    filled = None
    log("[Whitebox] breach depressions, D8 pointer, flow accumulation, streams")
    for tool, args in [
        (wbt.breach_depressions_least_cost, dict(dem="dem_filled.tif", output="dem_breached.tif", dist=int(200 / a.res) or 1, fill=True)),
        (wbt.d8_pointer, dict(dem="dem_breached.tif", output="d8.tif")),
        (wbt.d8_flow_accumulation, dict(i="dem_breached.tif", output="flowacc.tif", out_type="cells")),
    ]:
        if tool(**args) != 0:
            die(f"WhiteboxTools {tool.__name__} failed")
    _, acc, _ = read(w / "flowacc.tif")
    thr = a.stream_threshold
    if thr <= 0:  # auto: about 1 acre of contributing area
        thr = max(50, int(43560.0 / (a.res * a.res)))
    if wbt.extract_streams(flow_accum="flowacc.tif", output="streams.tif", threshold=thr) != 0:
        die("WhiteboxTools extract_streams failed")
    for f in ("streams.shp", "pour.shp", "pour_snap.shp", "watershed.shp"):
        for ext in (".shp", ".shx", ".dbf", ".prj", ".cpg"):
            p = w / (Path(f).stem + ext)
            if p.exists():
                p.unlink()
    if wbt.raster_streams_to_vector(streams="streams.tif", d8_pntr="d8.tif", output="streams.shp") != 0:
        die("WhiteboxTools raster_streams_to_vector failed")
    # pour point: user lat,lon or the max-accumulation cell
    fds = gdal.Open(str(w / "flowacc.tif"))
    gt = fds.GetGeoTransform()
    if a.pour_point:
        lat, lon = [float(v) for v in a.pour_point.split(",")]
        tr = osr.CoordinateTransformation(srs4326(), srs_of(fds))
        x, y, _ = tr.TransformPoint(lat, lon)
        how = "user pour point"
    else:
        r, c = np.unravel_index(np.nanargmax(np.where(np.isfinite(acc), acc, -1)), acc.shape)
        x, y = gt[0] + (c + 0.5) * gt[1], gt[3] + (r + 0.5) * gt[5]
        how = "max flow accumulation cell"
    drv = ogr.GetDriverByName("ESRI Shapefile")
    shp = drv.CreateDataSource(str(w / "pour.shp"))
    lyr = shp.CreateLayer("pour", srs_of(fds), ogr.wkbPoint)
    lyr.CreateField(ogr.FieldDefn("FID", ogr.OFTInteger))
    f = ogr.Feature(lyr.GetLayerDefn())
    f.SetField("FID", 1)
    f.SetGeometry(ogr.CreateGeometryFromWkt(f"POINT ({x} {y})"))
    lyr.CreateFeature(f)
    shp = None
    log(f"[Whitebox] watershed from {how} (snapped to the stream within {a.snap_distance} ft)")
    if wbt.jenson_snap_pour_points(pour_pts="pour.shp", streams="streams.tif", output="pour_snap.shp",
                                   snap_dist=a.snap_distance) != 0:
        die("WhiteboxTools jenson_snap_pour_points failed")
    if wbt.watershed(d8_pntr="d8.tif", pour_pts="pour_snap.shp", output="watershed.tif") != 0:
        die("WhiteboxTools watershed failed")
    if wbt.raster_to_vector_polygons(i="watershed.tif", output="watershed.shp") != 0:
        die("WhiteboxTools raster_to_vector_polygons failed")
    for name in ("streams", "watershed", "pour_snap"):
        out = w / f"{name}.geojson"
        if out.exists():
            out.unlink()
        gdal.VectorTranslate(str(out), str(w / f"{name}.shp"), format="GeoJSON", dstSRS="EPSG:4326",
                             srcSRS=TARGET_SRS, simplifyTolerance=(a.res if name != "pour_snap" else 0),
                             layerCreationOptions=["COORDINATE_PRECISION=6"])
    _, ws, _ = read(w / "watershed.tif")
    area_acres = float(np.sum(ws > 0)) * a.res * a.res / 43560.0
    return {"stream_threshold_cells": int(thr), "pour_point_method": how,
            "watershed_acres": round(area_acres, 2)}


def srs_of(ds):
    _, _, osr = gd()
    s = osr.SpatialReference()
    s.ImportFromWkt(ds.GetProjection())
    s.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
    return s


def srs4326():
    _, _, osr = gd()
    s = osr.SpatialReference()
    s.ImportFromEPSG(4326)
    return s


# ------------------------------------------------------------------ web outputs

def ramp(values, stops):
    """values in 0..1 -> uint8 RGB via linear color stops [(pos,(r,g,b)),...]."""
    np = need("numpy")
    out = np.zeros(values.shape + (3,), dtype="float64")
    pos = [s[0] for s in stops]
    for ch in range(3):
        out[..., ch] = np.interp(values, pos, [s[1][ch] for s in stops])
    return out


ELEV_STOPS = [(0.0, (38, 115, 77)), (0.25, (120, 170, 80)), (0.5, (225, 210, 130)),
              (0.75, (190, 130, 70)), (1.0, (245, 245, 245))]
SLOPE_STOPS = [(0.0, (26, 152, 80)), (5 / 45, (145, 207, 96)), (10 / 45, (254, 224, 139)),
               (20 / 45, (252, 141, 89)), (30 / 45, (215, 48, 39)), (1.0, (118, 42, 131))]


def web_outputs(dem, w, a, meta):
    gdal, ogr, osr = gd()
    np = need("numpy")
    Image = need("PIL.Image") and __import__("PIL.Image", fromlist=["Image"])
    log("[GDAL] web overlays in Web Mercator + quantized DEM grid")
    src = gdal.Open(str(dem))
    gt = src.GetGeoTransform()
    w_ft, h_ft = src.RasterXSize * gt[1], src.RasterYSize * -gt[5]
    max_side = a.max_px
    px_ft = max(w_ft, h_ft) / max_side
    lat_c = 45.0
    # warp everything onto one EPSG:3857 grid so Leaflet image overlays line up exactly
    base = dict(dstSRS="EPSG:3857", resampleAlg="bilinear", dstNodata=NODATA, outputType=gdal.GDT_Float32)
    gdal.Warp(str(w / "dem_3857.tif"), str(dem), **base)
    ref = gdal.Open(str(w / "dem_3857.tif"))
    rgt = ref.GetGeoTransform()
    minx, maxy = rgt[0], rgt[3]
    maxx, miny = minx + ref.RasterXSize * rgt[1], maxy + ref.RasterYSize * rgt[5]
    lat_c = math.degrees(2 * math.atan(math.exp(((miny + maxy) / 2) / 6378137.0)) - math.pi / 2)
    scale = 1 / math.cos(math.radians(lat_c))          # mercator meters per ground meter
    px_merc = px_ft * 0.3048 * scale
    W, H = int(round((maxx - minx) / px_merc)), int(round((maxy - miny) / px_merc))
    grid = dict(outputBounds=(minx, miny, maxx, maxy), width=W, height=H)

    def warp(name, alg="bilinear", nd=NODATA):
        o = w / f"{name}_web.tif"
        gdal.Warp(str(o), str(w / f"{name}.tif"), dstSRS="EPSG:3857", resampleAlg=alg, dstNodata=nd,
                  outputType=gdal.GDT_Float32, **grid)
        return read(o)[1]
    shutil.copy(dem, w / "demw.tif")
    z = warp("demw")
    hs = warp("hillshade", nd=0)
    sl = warp("slope", alg="average")
    acc = warp("flowacc", alg="max", nd=NODATA)
    valid = z != NODATA
    zmin, zmax = float(z[valid].min()), float(z[valid].max())

    def webp(rgb, alpha, quality=80, shrink=1):
        im = Image.fromarray(np.dstack([rgb, alpha]).clip(0, 255).astype("uint8"), "RGBA")
        if shrink > 1:
            im = im.resize((max(1, im.width // shrink), max(1, im.height // shrink)), Image.LANCZOS)
        import io
        b = io.BytesIO()
        im.save(b, "WEBP", quality=quality, method=6)
        return base64.b64encode(b.getvalue()).decode()
    # elevation-tinted hillshade (multiply blend)
    t = (np.where(valid, z, zmin) - zmin) / max(zmax - zmin, 1e-6)
    tint = ramp(t, ELEV_STOPS)
    shade = (np.where(valid, hs, 180) / 255.0)[..., None]
    rgb = tint * (0.35 + 0.65 * shade)
    layers = {"elevation": webp(rgb, np.where(valid, 255, 0), 78)}
    # plain grey hillshade for bright sun
    g = np.where(valid, hs, 0)
    layers["hillshade"] = webp(np.dstack([g, g, g]), np.where(valid, 255, 0), 75)
    # slope 0..45+ degrees
    slv = valid & (sl >= 0)
    slope_rgba = webp(ramp(np.clip(np.where(slv, sl, 0) / 45.0, 0, 1), SLOPE_STOPS), np.where(slv, 215, 0), 72, shrink=2)
    layers["slope"] = slope_rgba
    # flow accumulation (log)
    la = np.log10(np.where(acc > 0, acc, 1))
    lo = math.log10(max(meta["hydrology"]["stream_threshold_cells"] / 20.0, 2))
    hi = max(float(la.max()), lo + 1)
    v = np.clip((la - lo) / (hi - lo), 0, 1)
    rgbf = ramp(v, [(0, (120, 200, 255)), (0.5, (30, 120, 255)), (1, (10, 40, 200))])
    layers["flowacc"] = webp(rgbf, np.where((la > lo) & valid, 90 + 165 * v, 0), 82)

    # quantized DEM for client-side sampling (decifeet, delta coded, Int16 little-endian)
    gscale = max(1, int(math.ceil(max(W, H) / a.grid_px)))
    gw, gh = int(math.ceil(W / gscale)), int(math.ceil(H / gscale))
    gdal.Warp(str(w / "dem_grid.tif"), str(dem), dstSRS="EPSG:3857", resampleAlg="average", dstNodata=NODATA,
              outputType=gdal.GDT_Float32, outputBounds=(minx, miny, maxx, maxy), width=gw, height=gh)
    gz = read(w / "dem_grid.tif")[1]
    q = np.where(gz == NODATA, -32768, np.round((gz - zmin) * 10)).astype("int64")
    if q.max() > 32767:
        die("Elevation range too large for the decifoot grid (over 3,276 ft). Use a smaller area.")
    flat = q.ravel()
    prev, out = 0, np.empty_like(flat)
    validq = flat != -32768
    d = flat.copy()
    # delta code valid cells against the previous valid cell; keep -32768 as the no-data marker
    last = 0
    vals = flat[validq]
    deltas = np.diff(np.concatenate([[0], vals]))
    if np.any(np.abs(deltas) > 32000):
        die("Unexpected elevation jump in DEM grid")
    d[validq] = deltas
    grid_b64 = base64.b64encode(d.astype("<i2").tobytes()).decode()

    def lonlat(x, y):
        return [math.degrees(2 * math.atan(math.exp(y / 6378137.0)) - math.pi / 2), math.degrees(x / 6378137.0)]
    bounds = [lonlat(minx, miny), lonlat(maxx, maxy)]
    for k in ("contours", "streams", "watershed", "pour_snap"):
        meta[k] = json.loads((w / f"{k}.geojson").read_text())
        for f in meta[k].get("features", []):  # keep only what the viewer uses
            p = f.get("properties") or {}
            f["properties"] = {kk: (round(vv, 1) if isinstance(vv, float) else vv)
                               for kk, vv in p.items() if kk in ("elev_ft",)}
    # WGS84 (GPS) -> NAD83 datum shift at the data centre, using the same transformation pyproj picks
    # (in Oregon that is the NOAA HARN grid, EPSG "NAD83 to WGS 84 (41)"). Constant over the map area
    # to well under 1 ft; the viewer applies it before proj4js projects to State Plane.
    pyproj = need("pyproj")
    clat, clon = (bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2
    tdat = pyproj.Transformer.from_crs(4326, 4269, always_xy=True)
    lon83, lat83 = tdat.transform(clon, clat)
    op = "WGS84 = NAD83 (no shift)"
    for cand in pyproj.transformer.TransformerGroup(4326, 4269, always_xy=True).transformers:
        cx, cy = cand.transform(clon, clat)
        if abs(cx - lon83) < 1e-12 and abs(cy - lat83) < 1e-12:
            op = "GPS/WGS84 to NAD83: " + cand.description.replace("Inverse of ", "")
            break
    meta["datum_shift"] = {"dlat": lat83 - clat, "dlon": lon83 - clon, "op": op}
    meta.update({
        "bounds": bounds, "merc": [minx, miny, maxx, maxy], "img_px": [W, H],
        "grid": {"w": gw, "h": gh, "b64": grid_b64, "zmin_ft": round(zmin, 1), "step_ft": 0.1},
        "elev_ft": [round(zmin, 1), round(zmax, 1)], "layers": layers,
        "elev_stops": ELEV_STOPS, "slope_stops": [[p * 45, c] for p, c in SLOPE_STOPS],
        "dem_res_ft": a.res, "web_px_ft": round(px_ft, 2), "grid_px_ft": round(px_ft * gscale, 2),
    })
    return meta


# ------------------------------------------------------------------ site writer

def write_site(meta, out_dir, lib_prefix, title, sample):
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(meta, separators=(",", ":"))
    data_js = "/* generated by pdal-pipeline.py - do not edit */\nwindow.TERRAIN=" + payload + ";\n"
    build = hashlib.sha256((data_js + (WEB_SRC / "app.js").read_text() + (WEB_SRC / "vendor.js").read_text()
                            + TEMPLATE + SW_TEMPLATE).encode()).hexdigest()[:12]
    data_js = data_js.replace("window.TERRAIN=", f"window.TERRAIN_BUILD=\"{build}\";window.TERRAIN=", 1)
    if lib_prefix == "lib/":
        (out_dir / "lib").mkdir(exist_ok=True)
        shutil.copy(WEB_SRC / "vendor.js", out_dir / "lib" / "vendor.js")
        shutil.copy(WEB_SRC / "app.js", out_dir / "lib" / "app.js")
    v = f"?v={build}"
    assets = ["./", "index.html", f"{lib_prefix}vendor.js{v}", f"{lib_prefix}app.js{v}", f"data.js{v}",
              "manifest.webmanifest", "icon.svg"]
    files = {
        "index.html": TEMPLATE.replace("__TITLE__", title).replace("__BUILD__", build)
                              .replace("__LIB__", lib_prefix).replace("__V__", v)
                              .replace("__APPLE_ICON__", apple_icon_data_uri()),
        "data.js": data_js,
        "sw.js": SW_TEMPLATE.replace("__BUILD__", build).replace("__ASSETS__", json.dumps(assets)),
        "manifest.webmanifest": json.dumps({
            "name": title, "short_name": "Terrain", "start_url": "./", "scope": "./", "display": "standalone",
            "background_color": "#0b0b0c", "theme_color": "#0b0b0c",
            "icons": [{"src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"},
                      {"src": apple_icon_data_uri(192), "sizes": "192x192", "type": "image/png"},
                      {"src": apple_icon_data_uri(512), "sizes": "512x512", "type": "image/png"}]}, indent=1) + "\n",
        "icon.svg": ICON_SVG,
        ".nojekyll": "",
    }
    for k, v2 in files.items():
        (out_dir / k).write_text(v2, encoding="utf-8")
    return build


_icon_cache = {}


def apple_icon_data_uri(size=180):
    """Render the app icon as PNG (text data URI, so the site stays text-only)."""
    if size in _icon_cache:
        return _icon_cache[size]
    from PIL import Image, ImageDraw
    import io
    im = Image.new("RGB", (size, size), (11, 11, 12))
    d = ImageDraw.Draw(im)
    s = size / 180.0
    d.polygon([(20 * s, 140 * s), (75 * s, 55 * s), (100 * s, 95 * s), (120 * s, 70 * s), (160 * s, 140 * s)],
              fill=(255, 176, 0))
    for i, yy in enumerate((150, 160)):
        d.line([(20 * s, yy * s), (160 * s, yy * s)], fill=(255, 255, 255), width=max(1, int(4 * s)))
    b = io.BytesIO()
    im.save(b, "PNG", optimize=True)
    _icon_cache[size] = "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()
    return _icon_cache[size]


# ------------------------------------------------------------------ serve

def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))   # no packet is sent; just picks the LAN interface
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def serve(folder, port, lan):
    host = "0.0.0.0" if lan else "127.0.0.1"
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(folder))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer((host, port), handler) as httpd:
        log(f"\nServing {folder}")
        log(f"  on this computer:  http://127.0.0.1:{port}/")
        if lan:
            log(f"  on your phone (same Wi-Fi):  http://{lan_ip()}:{port}/")
        log("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


# ------------------------------------------------------------------ publish (demo sample only)

def git(*args, check=True, capture=True):
    r = subprocess.run(["git", "-C", str(REPO_ROOT), *args], capture_output=capture, text=True)
    if check and r.returncode != 0:
        die(f"git {' '.join(args)} failed:\n{(r.stderr or r.stdout).strip()}\n\n"
            "Publishing uses your normal git login (credential helper or SSH key). Check that\n"
            "  git -C " + str(REPO_ROOT) + " push --dry-run\n"
            "works on its own. No personal access token is needed by this script.")
    return (r.stdout or "").strip()


def site_url_from_remote(url):
    m = re.search(r"github\.com[:/]+([^/]+)/([^/]+?)(?:\.git)?/?$", url or "")
    if not m:
        return None
    owner, repo = m.group(1), m.group(2)
    return f"https://{owner.lower()}.github.io/" if repo.lower() == f"{owner.lower()}.github.io" \
        else f"https://{owner.lower()}.github.io/{repo}/"


def staged_audit(allowed_bounds, base_ref):
    """Abort if anything staged (or tracked and new vs upstream) could be private data."""
    problems = []
    staged = [s for s in git("diff", "--cached", "--name-only").splitlines() if s]
    for f in staged:
        ext = Path(f).suffix.lower()
        if ext in POINTCLOUD_EXT:
            problems.append(f"point cloud / archive staged: {f}")
        elif ext in RASTER_EXT:
            problems.append(f"raster/image file staged (the site embeds images in data.js only): {f}")
        elif "local-output/" in f or "/.work/" in f or f.startswith("data/private/"):
            problems.append(f"private/local path staged: {f}")
        elif ext in (".geojson", ".json") or f.endswith("data.js"):
            path = REPO_ROOT / f
            if path.exists() and not bounds_ok(path, allowed_bounds):
                problems.append(f"geodata outside the public sample area: {f}")
    # tracked point clouds that are not part of upstream PDAL's own test data
    tracked = [t for t in git("ls-files").splitlines() if Path(t).suffix.lower() in POINTCLOUD_EXT]
    upstream = set()
    if base_ref and subprocess.run(["git", "-C", str(REPO_ROOT), "rev-parse", "--verify", "-q", base_ref],
                                   capture_output=True).returncode == 0:
        upstream = set(git("ls-tree", "-r", "--name-only", base_ref).splitlines())
    extra = [t for t in tracked if t not in upstream]
    if not upstream:
        extra = [t for t in tracked if not t.startswith("test/")]
    for t in extra:
        problems.append(f"tracked point cloud not in upstream PDAL ({base_ref}): {t}")
    return staged, problems


def bounds_ok(path, allowed, tol=0.002):
    minlon, minlat, maxlon, maxlat = allowed
    txt = path.read_text(errors="ignore")
    nums = re.findall(r"\[(-1[0-9]{2}\.\d+),\s*(4[0-9]\.\d+)\]", txt)          # GeoJSON [lon,lat]
    nums += [(b, a2) for a2, b in re.findall(r"\[(4[0-9]\.\d+),\s*(-1[0-9]{2}\.\d+)\]", txt)]  # [lat,lon]
    for lon, lat in nums:
        lon, lat = float(lon), float(lat)
        if not (minlon - tol <= lon <= maxlon + tol and minlat - tol <= lat <= maxlat + tol):
            return False
    return True


def publish(a, build, src):
    if not shutil.which("git"):
        die("git is not installed. Install git, sign in to GitHub once (credential helper or SSH key), retry.")
    if git("rev-parse", "--is-inside-work-tree", check=False) != "true":
        die(f"{REPO_ROOT} is not a git checkout. Clone the fork first:\n"
            "  git clone -b gh-pages https://github.com/Bevelhook/pdal.git && cd pdal/terrain")
    remote_url = git("remote", "get-url", a.remote, check=False)
    if not remote_url:
        die(f"git remote '{a.remote}' is not set up in {REPO_ROOT}.")
    branch = a.branch
    allowed = sample_bbox() if src["is_sample"] else None
    if allowed is None:
        allowed = tuple(src.get("bbox") or (-180, -90, 180, 90))
    git("add", "--", *SITE_FILES)
    staged, problems = staged_audit(allowed, a.upstream_ref)
    if problems:
        git("reset", "-q", "--", *SITE_FILES, check=False)
        die("Publish aborted by the privacy check:\n  - " + "\n  - ".join(problems))
    log(f"[publish] privacy check passed for {len(staged)} staged file(s): {', '.join(staged) or '(none)'}")
    if staged:
        git("-c", "commit.gpgsign=false", "commit", "-q", "-m", f"Terrain viewer build {build} ({src['name']})")
    else:
        log("[publish] nothing changed since the last commit")
    log(f"[publish] git push {a.remote} HEAD:{branch}  (uses your existing git login)")
    r = subprocess.run(["git", "-C", str(REPO_ROOT), "push", a.remote, f"HEAD:{branch}"], text=True)
    if r.returncode != 0:
        die("git push failed. Make sure `git push` works in this folder with your normal login\n"
            "(GitHub Desktop, the git credential helper, or an SSH key). This script never asks for a token.")
    url = a.site_url or site_url_from_remote(remote_url)
    if not url:
        log("[publish] pushed. Could not work out the Pages URL from the remote; pass --site-url to poll it.")
        return
    log(f"[publish] waiting for {url} to serve build {build} (up to {a.poll_timeout}s) ...")
    import urllib.request
    t0 = time.time()
    while time.time() - t0 < a.poll_timeout:
        try:
            req = urllib.request.Request(f"{url}?b={build}&t={int(time.time())}", headers={"Cache-Control": "no-cache"})
            body = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")
            if build in body:
                log(f"\nLIVE: {url}  (build {build})")
                return
        except Exception:
            pass
        time.sleep(a.poll_every)
    log(f"\nPushed, but {url} did not show build {build} within {a.poll_timeout}s. "
        "GitHub Pages can take a few minutes; check Settings > Pages for the fork.")


def confirm_public(src):
    name = src["name"]
    if not sys.stdin.isatty():
        die("--i-understand-this-is-public needs an interactive terminal for the typed confirmation.")
    log("\n*** This dataset is NOT the built-in public sample. Publishing puts it on the public internet. ***")
    typed = input(f"Type the dataset name exactly to publish it ({name}): ").strip()
    if typed != name:
        die("Name did not match. Nothing was published.")


# ------------------------------------------------------------------ main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", nargs="?", help="DOGAMI tile .zip, LAS/LAZ, or DEM raster (default: public sample)")
    ap.add_argument("--bbox", help="minlon,minlat,maxlon,maxlat to download from USGS 3DEP (EPT)")
    ap.add_argument("--latlon", help="lat,lon centre to download from USGS 3DEP (EPT)")
    ap.add_argument("--radius", type=float, default=300.0, help="half-width in meters for --latlon (default 300)")
    ap.add_argument("--ept", help="specific ept.json URL (default: auto-pick the newest collection)")
    ap.add_argument("--res", type=float, default=1.5, help="DEM cell size in feet (default 1.5)")
    ap.add_argument("--use-existing-ground", action="store_true", help="skip SMRF; use class 2 from the provider")
    ap.add_argument("--z-units", choices=["auto", "m", "ft"], default="auto", help="vertical units of the input")
    ap.add_argument("--contour-interval", type=float, default=2.0, help="contour interval in feet (default 2)")
    ap.add_argument("--min-contour-ft", type=float, default=60.0, help="drop contour pieces shorter than this (ft)")
    ap.add_argument("--stream-threshold", type=int, default=0,
                    help="flow accumulation cells to start a stream (default: about 1 acre)")
    ap.add_argument("--pour-point", help="lat,lon for the watershed outlet (default: max flow accumulation)")
    ap.add_argument("--snap-distance", type=float, default=30.0, help="pour point snap distance in feet")
    ap.add_argument("--max-px", type=int, default=1400, help="max overlay image side in pixels")
    ap.add_argument("--grid-px", type=int, default=360, help="max side of the embedded elevation grid")
    ap.add_argument("--title", help="viewer title")
    ap.add_argument("--out", help="local output folder (default: local-output/<name>/)")
    ap.add_argument("--local", action="store_true", help="local only (this is already the default)")
    ap.add_argument("--serve", action="store_true", help="preview the output on http://127.0.0.1:PORT")
    ap.add_argument("--lan", action="store_true", help="with --serve: listen on your Wi-Fi so a phone can open it")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--publish", action="store_true", help="PUBLIC: rebuild the demo sample site and git push it")
    ap.add_argument("--i-understand-this-is-public", dest="force_public", action="store_true")
    ap.add_argument("--skip-build", action="store_true", help="reuse the existing build (with --serve or --publish)")
    ap.add_argument("--remote", default="origin")
    ap.add_argument("--branch", default="gh-pages")
    ap.add_argument("--upstream-ref", default="origin/master",
                    help="ref holding upstream PDAL's own test data, for the point-cloud check")
    ap.add_argument("--site-url", help="Pages URL to poll after pushing (default: from the git remote)")
    ap.add_argument("--poll-timeout", type=int, default=600)
    ap.add_argument("--poll-every", type=int, default=20)
    a = ap.parse_args()

    if a.publish and a.local:
        die("--publish and --local cannot be combined. --local never leaves this computer.")
    if a.publish and a.out:
        die("--publish always writes the public site to the repo root; drop --out.")
    if a.lan and not a.serve:
        die("--lan only makes sense with --serve")

    src = resolve_input(a)
    if a.publish:
        if not src["is_sample"]:
            if not a.force_public:
                die("--publish only accepts the built-in public sample. Your data stays local: run without\n"
                    "--publish and open local-output/. (To publish other data on purpose, add\n"
                    "--i-understand-this-is-public and type the dataset name when asked.)")
            confirm_public(src)
        if a.skip_build:
            idx = (REPO_ROOT / "index.html").read_text()
            build = re.search(r'name="terrain-build" content="([0-9a-f]+)"', idx).group(1)
            return publish(a, build, src)

    out_dir = REPO_ROOT if a.publish else Path(a.out).resolve() if a.out else LOCAL_OUT / src["name"]
    if a.skip_build and not a.publish:
        if not (out_dir / "index.html").exists():
            die(f"Nothing built yet in {out_dir}. Run without --skip-build first.")
        return serve(out_dir, a.port, a.lan) if a.serve else log(f"Existing viewer: {out_dir / 'index.html'}")
    w = WORK / src["name"]
    w.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    dem = w / "dem.tif"
    if src["kind"] in ("points", "ept"):
        points_to_dem(src, a, dem)
    else:
        raster_to_dem(src, a, dem)
    gdal_terrain(dem, w, a)
    hyd = hydrology(dem, w, a)
    meta = {"title": a.title or (SAMPLE["name"] if src["is_sample"] else src["name"]),
            "source": src.get("dataset") or Path(src["path"][0] if isinstance(src["path"], list) else src["path"]).name,
            "sample": bool(src["is_sample"]), "sample_id": SAMPLE["id"] if src["is_sample"] else None,
            "srs": "NAD83 / Oregon North (ft) EPSG:2269", "contour_interval_ft": a.contour_interval,
            "ground": "provider class 2" if a.use_existing_ground else "PDAL SMRF",
            "hydrology": hyd, "built": time.strftime("%Y-%m-%d %H:%M %Z")}
    meta = web_outputs(dem, w, a, meta)
    lib = "terrain/web/" if a.publish else "lib/"
    build = write_site(meta, out_dir, lib, meta["title"], src["is_sample"])
    size = sum((out_dir / f).stat().st_size for f in SITE_FILES)
    log(f"\nDone in {time.time() - t0:.0f}s. Build {build}. Viewer: {out_dir / 'index.html'} "
        f"(site files {size / 1e6:.2f} MB)")
    log(f"  elevation {meta['elev_ft'][0]}-{meta['elev_ft'][1]} ft, watershed {hyd['watershed_acres']} acres")
    if a.publish:
        publish(a, build, src)
    else:
        log("  Local only: nothing was committed or uploaded.")
        if a.serve:
            serve(out_dir, a.port, a.lan)
        else:
            log(f"  Preview:  python {Path(__file__).name} {a.input or ''} --serve   (or open index.html directly)")


# ------------------------------------------------------------------ templates (filled in below)
ICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" rx="36" fill="#0b0b0c"/><path d="M20 140 75 55 100 95 120 70 160 140Z" fill="#ffb000"/><path d="M20 150H160M20 160H160" stroke="#fff" stroke-width="4"/></svg>
"""

SW_TEMPLATE = r"""/* Terrain viewer service worker - build __BUILD__ (generated by pdal-pipeline.py) */
const BUILD = "__BUILD__";
const SW_VERSION = 2;   // bump when the caching logic changes; the cache name also changes with every build
const APP_CACHE = "terrain-app-v" + SW_VERSION + "-" + BUILD;
const TILE_CACHE = "terrain-osm-tiles";
const MAX_TILES = 1500;
const ASSETS = __ASSETS__;
self.addEventListener("install", e => {
  e.waitUntil(caches.open(APP_CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("terrain-app-") && k !== APP_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function trimTiles() {
  const c = await caches.open(TILE_CACHE);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - MAX_TILES; i++) await c.delete(keys[i]);
}
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname === "tile.openstreetmap.org" && url.searchParams.has("probe")) return;  // connectivity probe: always network
  if (url.hostname === "tile.openstreetmap.org") {
    // cache-first for tiles the user has actually viewed (no bulk prefetching, per OSM tile policy)
    e.respondWith(caches.open(TILE_CACHE).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) { c.put(e.request, res.clone()).then(trimTiles); }
      return res;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (e.request.mode === "navigate") {
    // network first (4 s), so a new build shows up on the next open; cached page when offline or slow
    e.respondWith(caches.open(APP_CACHE).then(async c => {
      try {
        const res = await Promise.race([fetch(e.request, { cache: "no-store" }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000))]);
        if (res && res.ok) return res;
        throw new Error("bad response");
      } catch (err) {
        return (await c.match(e.request, { ignoreSearch: true })) || (await c.match("index.html")) || (await c.match("./")) || Response.error();
      }
    }));
    return;
  }
  e.respondWith(caches.open(APP_CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: false }) || (e.request.mode === "navigate" ? await c.match("index.html") : null);
    if (hit) return hit;
    try { return await fetch(e.request); } catch (err) { return (await c.match("index.html")) || Response.error(); }
  }));
});
"""

TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="terrain-build" content="__BUILD__">
<meta name="theme-color" content="#0b0b0c">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Terrain">
<title>__TITLE__</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="__APPLE_ICON__">
<style>
:root{--vvb:0px;--bar:calc(72px + env(safe-area-inset-bottom) + var(--vvb));--top:calc(72px + env(safe-area-inset-top));--bg:#0b0b0c;--panel:#141416;--panel2:#1d1d21;--fg:#fff;--muted:#c9c9cf;--accent:#ffb000;--accent-fg:#000;--line:#3a3a40;--ok:#35d07f;--bad:#ff5a5a}
body.bright{--bg:#fff;--panel:#fff;--panel2:#f0f0f0;--fg:#000;--muted:#222;--accent:#0047ff;--accent-fg:#fff;--line:#000;--ok:#006b2d;--bad:#b00000}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font:16px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
#map{position:fixed;inset:0;bottom:var(--bar);background:#222}
body.bright #map{background:#ddd}
#top{position:fixed;top:0;left:0;right:0;padding:calc(6px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) 6px calc(8px + env(safe-area-inset-left));display:flex;gap:8px;align-items:center;z-index:1000;pointer-events:none}
#top>*{pointer-events:auto}
#title{flex:1;min-width:0;background:var(--panel);border:2px solid var(--line);border-radius:12px;padding:6px 10px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#title small{display:block;font-weight:400;color:var(--muted);font-size:12px}
#net{min-width:56px;height:56px;border-radius:12px;border:2px solid var(--line);background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
#net.on{color:var(--ok)}#net.off{color:var(--bad)}
button,.btn{min-width:56px;min-height:56px;border-radius:12px;border:2px solid var(--line);background:var(--panel2);color:var(--fg);font:600 15px/1.1 inherit;padding:6px 10px;cursor:pointer;touch-action:manipulation}
button.on{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}
button:active{transform:scale(.97)}
#bar{position:fixed;left:0;right:0;bottom:var(--vvb);height:calc(72px + env(safe-area-inset-bottom));padding:8px calc(6px + env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) calc(6px + env(safe-area-inset-left));background:var(--panel);border-top:2px solid var(--line);display:flex;gap:6px;z-index:1001;overflow-x:auto}
#bar button{flex:1 0 56px;font-size:13px;padding:4px}
#bar button b{display:block;font-size:20px;line-height:1}
/* panels: always above the bottom toolbar, never taller than the space between the top bar and the toolbar,
   own scroll area, header with title (tap = minimize), minimize and close (built by app.js for every .sheet) */
.sheet{position:fixed;left:calc(6px + env(safe-area-inset-left));right:calc(6px + env(safe-area-inset-right));bottom:calc(var(--bar) + 8px);max-height:min(60vh,calc(100vh - var(--bar) - var(--top) - 16px));max-height:min(60dvh,calc(100dvh - var(--bar) - var(--top) - 16px));overflow:hidden;background:var(--panel);border:2px solid var(--line);border-radius:14px;padding:0;z-index:1000;display:none;flex-direction:column;box-shadow:0 6px 24px rgba(0,0,0,.5)}
.sheet.open{display:flex}
.sheet h3{margin:2px 0 8px;font-size:17px}
.sh-head{display:flex;align-items:center;gap:6px;padding:4px;flex:none;border-bottom:2px solid var(--line)}
.sh-head button{flex:none;width:56px;font-size:22px;padding:0}
.sh-head .sh-title{flex:1;width:auto;min-width:0;text-align:left;font-size:17px;font-weight:700;background:transparent;border-color:transparent;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-sum{font-weight:600;color:var(--accent);font-size:15px}
.sh-body{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:8px 10px 10px;min-height:0;flex:1 1 auto}
.sheet.min{left:auto;max-width:calc(100% - 12px - env(safe-area-inset-left) - env(safe-area-inset-right))}
.sheet.min .sh-head{border-bottom:0}
.sheet.min .sh-body{display:none}
.sheet:not(.min) .sh-sum{display:none}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.row>button{flex:1}
.kv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-variant-numeric:tabular-nums}
.kv div:nth-child(odd){color:var(--muted)}
.big{font-size:22px;font-weight:800}
.ramp{height:16px;border-radius:4px;border:1px solid var(--line)}
.lg{margin:8px 0}.lg .ends{display:flex;justify-content:space-between;font-size:13px;color:var(--muted)}
.sw{display:inline-block;width:22px;height:4px;vertical-align:middle;margin-right:6px}
input[type=range]{width:100%;height:56px;accent-color:var(--accent)}
canvas#prof{width:100%;height:170px;background:var(--panel2);border-radius:8px}
#hint{cursor:pointer;position:fixed;left:50%;transform:translateX(-50%);top:calc(70px + env(safe-area-inset-top));background:var(--accent);color:var(--accent-fg);padding:8px 14px;border-radius:12px;font-weight:700;z-index:1003;display:none;max-width:92vw;text-align:center}
.foot{font-size:12px;color:var(--muted);margin-top:8px}
.leaflet-container{font:inherit}
.leaflet-control-attribution{font-size:11px}
#map .leaflet-bar a,#map.leaflet-touch .leaflet-bar a{width:56px;height:56px;line-height:56px;font-size:26px}
.leaflet-top.leaflet-left{top:calc(70px + env(safe-area-inset-top))}
</style>
</head>
<body>
<div id="map" aria-label="map"></div>
<div id="top"><div id="title">__TITLE__<small id="sub"></small></div><div id="net" class="on" role="status">ONLINE</div><button id="themeBtn" aria-label="bright mode">SUN</button></div>
<div id="hint"></div>
<div class="sheet" id="layersSheet"><h3>Layers</h3><div id="layerBtns" class="row"></div>
<div>Overlay opacity</div><input type="range" id="opacity" min="10" max="100" value="85" aria-label="overlay opacity">
<div id="legend"></div><div class="foot" id="srcNote"></div></div>
<div class="sheet" id="infoSheet"><h3>Point readout</h3><div id="info">Tap the map to read elevation, slope and coordinates.</div>
<div class="row"><button id="zoneN" class="on">State Plane NORTH</button><button id="zoneS">State Plane SOUTH</button></div></div>
<div class="sheet" id="measureSheet"><h3 id="mTitle">Measure</h3><div class="row"><button id="mDist">Distance</button><button id="mArea">Area</button><button id="mProf">Profile</button></div>
<div id="mOut">Pick a tool, then tap points on the map.</div><canvas id="prof" style="display:none"></canvas>
<div class="row"><button id="mUndo">Undo</button><button id="mDone">Finish</button><button id="mClear">Clear all</button></div></div>
<div class="sheet" id="exportSheet"><h3>Export</h3><div class="row"><button id="exGeo">GeoJSON of measurements</button><button id="exPng">PNG of map</button></div><div id="exOut" class="foot"></div>
<div class="foot" id="aboutNote"></div></div>
<nav id="bar"><button data-sheet="layersSheet"><b>L</b>Layers</button><button data-sheet="infoSheet" id="infoTab"><b>i</b>Point</button><button data-sheet="measureSheet"><b>M</b>Measure</button><button id="fitBtn"><b>F</b>Fit</button><button id="gpsBtn"><b>G</b>GPS</button><button data-sheet="exportSheet"><b>E</b>Export</button></nav>
<script src="__LIB__vendor.js__V__"></script>
<script src="data.js__V__"></script>
<script src="__LIB__app.js__V__"></script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
