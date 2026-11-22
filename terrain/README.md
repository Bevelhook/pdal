# Terrain field map: LiDAR to a phone map in one command

`pdal-pipeline.py` turns LiDAR into a terrain map you can use in the field on an iPhone. You can give it a DOGAMI tile zip, a LAS/LAZ file, a DEM, or a spot to download. The map shows elevation, slope, contours, streams and a watershed. It also measures distance, area, elevation profiles and State Plane coordinates, and it works offline. A built-in **PNW landowner field guide** (toxic plant and mushroom ID key, invasive removal, a local-only field journal and walk mode) shares the app: journal finds show up on the map as colour-coded pins.

Live demo (public sample only, Molalla River State Park): https://bevelhook.github.io/pdal/

## Safe for real property data vs. touches the public repo

| Command | Leaves this computer? | Runs git? | Safe for your own property data? |
|---|---|---|---|
| `python pdal-pipeline.py my_tile.zip` (or `.laz`, `.las`, `.tif`) | **No.** Writes only to `terrain/local-output/<name>/` | Never | **Yes** |
| `python pdal-pipeline.py my_tile.zip --local` | **No.** Same as above; `--local` just makes it explicit | Never | **Yes** |
| `... --serve` | **No.** Serves the viewer on `http://127.0.0.1:8000` (this computer only) | Never | **Yes** |
| `... --serve --lan` | Only to devices on **your own Wi-Fi** (prints `http://<your-ip>:8000`) | Never | Yes, on a trusted home network |
| Opening `local-output/<name>/index.html` directly (file://) | Map tiles come from OpenStreetMap; your data stays in the file | Never | **Yes** |
| `python pdal-pipeline.py --latlon LAT,LON` or `--bbox ...` | Downloads **public** USGS lidar from AWS. Your box goes to AWS as the download request. The first run also fetches a coverage index from raw.githubusercontent.com. Nothing is uploaded. | Never | Yes. The results stay local. |
| `python pdal-pipeline.py --publish` | **YES: public internet.** Rebuilds the built-in **sample** and `git push`es it to GitHub Pages | Yes | **No.** Refuses anything but the sample |
| `... --publish --i-understand-this-is-public` | **YES: public.** Needs you to type the dataset name at a prompt | Yes | Only if you *want* it public |

Guardrails built into `--publish`:
- It refuses any input that is not the built-in sample (`molalla-river-sp-2019-v1`) unless you add `--i-understand-this-is-public` and type the dataset name.
- It can't be combined with `--local` or `--out`.
- Before committing, it scans the staged files and aborts if it finds any LAS/LAZ/zip, any raster or image file, any `local-output/` path, or any GeoJSON or `data.js` with coordinates outside the sample area, and any field-journal export (by name or by its `"app":"pnw-field-guide"` header). It also aborts if `git ls-files` contains a point cloud that is not part of upstream PDAL's own `test/` data.
- `.gitignore` covers `local-output/`, `.work/`, `data/private/`, `*.las`, `*.laz`, `*.zip` and raster formats.

**Credentials:** the script never reads, stores, prints or embeds a token. `--publish` just runs `git push`, so it uses whatever login git already has on your computer (GitHub Desktop, the git credential helper, or an SSH key). You don't need a personal access token. If you ever make one for git, make it a fine-grained token limited to `Bevelhook/pdal` with *Contents: read and write* only.

## Install (once)

```bash
conda env create -f environment.yml && conda activate terrain
```
(Or as a one-liner: `conda create -n terrain -c conda-forge pdal python-pdal gdal numpy pyproj pillow whitebox git && conda activate terrain`.) The first run downloads the small WhiteboxTools engine from whiteboxgeo.com. No data is sent.

Get the code (the site and the tool live on the `gh-pages` branch):
```bash
git clone -b gh-pages https://github.com/Bevelhook/pdal.git
cd pdal/terrain
```

## Use it

```bash
python pdal-pipeline.py                              # built-in public sample -> local-output/molalla-river-sp-2019-v1/
python pdal-pipeline.py ~/Downloads/dogami_tile.zip  # your tile, stays local
python pdal-pipeline.py ~/Downloads/dogami_tile.zip --serve --lan   # then open the printed URL on your iPhone
python pdal-pipeline.py points.laz --use-existing-ground            # trust the vendor's ground class instead of SMRF
python pdal-pipeline.py bare_earth.tif --contour-interval 1
python pdal-pipeline.py --latlon 45.29,-122.70 --radius 400         # download public 3DEP lidar for a spot
python pdal-pipeline.py --publish                    # PUBLIC: refresh the demo site (sample only)
```

**Where to get DOGAMI tiles:** use the [DOGAMI Lidar Viewer](https://gis.dogami.oregon.gov/maps/lidarviewer/) and download the tile zip. The script unzips it and finds the point cloud. If there's no point cloud, it uses the bare-earth DEM inside (GeoTIFF, .img or ESRI grid folder; it prefers names with "be" or "bare").

### Flags

| Flag | Meaning (default) |
|---|---|
| `input` | DOGAMI `.zip`, `.las/.laz`, or DEM raster. Omit it for the public sample |
| `--latlon LAT,LON --radius M` | Download from USGS 3DEP (EPT) around a point (radius 300 m) |
| `--bbox minlon,minlat,maxlon,maxlat` | Download a box from USGS 3DEP |
| `--ept URL` | Force a specific 3DEP collection (default: newest one that covers the spot) |
| `--res FT` | DEM cell size in feet (1.5) |
| `--use-existing-ground` | Skip SMRF and use the provider's class 2 ground points |
| `--z-units auto/m/ft` | Vertical units of the input (auto: read from the file's CRS) |
| `--contour-interval FT` | Contour spacing (2 ft; every 5th is drawn thicker) |
| `--min-contour-ft FT` | Drop tiny contour pieces shorter than this (60) |
| `--stream-threshold CELLS` | Cells that must drain to a spot before it counts as a stream (auto, about 1 acre) |
| `--pour-point LAT,LON` | Watershed outlet (default: the max-flow cell, snapped to the nearest stream) |
| `--snap-distance FT` | How far to snap the outlet to a stream (30) |
| `--local` | Local only. This is already the default |
| `--serve` / `--lan` / `--port` | Preview on 127.0.0.1, or on your Wi-Fi with `--lan` (port 8000) |
| `--skip-build` | Reuse the last build (with `--serve` or `--publish`) |
| `--refresh-site` | No PDAL/GDAL: re-wrap the existing `data.js` with the current `app.js`, field guide and page template (after a code or `plants.data.js` update) |
| `--publish` | PUBLIC demo refresh: commit and push the site, then wait for the live URL to show the new build |
| `--site-url URL`, `--remote`, `--branch` | Publish target overrides (origin, gh-pages) |

## What it does

1. **PDAL:** drops points the vendor flagged as noise and reprojects to **NAD83 / Oregon North (ft), EPSG:2269**. It converts heights to feet, then removes low pits (ELM) and statistical outliers. Next it finds the ground with **SMRF** (or uses the existing class 2) and writes the bare-earth DEM with `writers.gdal`.
2. **GDAL:** multidirectional hillshade, slope, and contours (`gdal_contour`). It also makes web overlays in Web Mercator, simplified contour GeoJSON, and a compact elevation grid that the phone samples itself.
3. **WhiteboxTools:** breaches depressions, then computes D8 flow direction, flow accumulation and streams. It also outlines the watershed above the outlet.
4. **Viewer:** writes `index.html` + `data.js` + `sw.js` + `manifest.webmanifest`. Everything is embedded as text, so the viewer opens from a web server or directly from the file.

## Layers

| Layer | What it shows |
|---|---|
| Elevation | Bare-earth relief tinted low (green) to high (white), with the elevation scale in the legend |
| Hillshade | Plain grey relief, easiest to read in direct sun |
| Slope | Steepness in degrees: green flat, yellow 10°, red 30°, purple 45°+ |
| Flow accum. | Where water collects. Darker blue means more land drains through that spot |
| Contours | Lines of equal elevation every 2 ft (thicker every 10 ft) |
| Streams | Modeled flow paths from the DEM. Ditches and swales show up too, not just mapped creeks |
| Watershed | All ground that drains to the pink outlet dot, with its acreage |

## Field tools on the phone

- **Point:** tap anywhere to get elevation (ft), slope (degrees and %), lat/long, and State Plane easting and northing.
  - State Plane defaults to the **Oregon NORTH zone (EPSG:2269)**, which covers Molalla and all of Clackamas County. A switch shows the South zone (EPSG:2270). It's labeled plainly and warns that this area is North.
  - GPS (WGS84) is shifted to NAD83 with the same transformation `pyproj` uses, and readouts match pyproj within 1 ft.
- **GPS:** shows where you're standing and reads the terrain at that spot. It needs the https link or 127.0.0.1.
- **Measure:** tap points for distance (ft, mi, m), area (sq ft, acres), or an elevation **profile** chart. The profile shows min, max, gain and loss, plus average and steepest grade.
- **Export:** GeoJSON of everything you measured (lengths, areas and profile stats included), and a PNG of the current map.
- **Offline:** after one visit, the page, libraries, terrain data and the field guide (with `plants.data.js`) are cached, and so are the map tiles you've looked at (up to 1,500; no bulk downloading, per OpenStreetMap's tile policy). Use *Share > Add to Home Screen* to get an app icon.
- **SUN / DARK:** a high-contrast bright theme for direct sunlight. Every button is at least 56 px.

## Field guide (GUIDE button)

The top bar's **GUIDE** button opens the field guide over the map; its **Map** tab brings the map back. Links like `index.html#toxic` open a guide section directly.

- **Tabs:** This month (date-reactive dashboard), Toxic ID key (lookalike comparisons, poison hemlock protocol, toxic species cards with confidence flags and citations), Invasive removal (incl. the garlic mustard deep dive), Natives, Calendar, Journal, Fact-check.
- **Log a find from the map:** long-press anywhere on the map (right-click on a computer), or tap a spot and press **+ Log a find here** in the Point panel. The journal opens with lat/long, elevation and slope from the terrain already filled in. Save, and you are back on the map with the new pin dropping in and a confirmation.
- **Pins:** toxic = restrained red, invasive = muted clay, native = cool silver, other = olive grey. Tap a pin to see the entry (photo, date, coordinates, elevation/slope, notes; toxic finds also show the toxicity note). **Edit in journal** and **Guide card** are one tap away. While a Measure tool is active, tapping a pin adds a measure point instead.
- **Walk mode:** big buttons, camera capture, typo-tolerant search and a live GPS fix with elevation and slope. **Show map** shows where you are and your pins; **Back to walk** returns without losing what you typed. Saving drops a pin at your position.
- **Private by design:** journal entries, pins and photos live only in this browser's IndexedDB (`pnw-field-guide`) on this device. They are never uploaded, synced, put in `data.js`, or published with the map, and `--publish` refuses journal exports. Use Journal > Export to back them up (and Import to restore or move them to another browser).
- **Data:** `terrain/web/plants.data.js` is the separately versioned plant data (`dataVersion` inside; 30 species, lookalike comparisons, protocols, sources). Edit it, then rebuild with `--refresh-site` (or a normal build) so the cache picks it up.
- Identification and safety reference only, not an edibility or medical guide. Suspected poisoning: Oregon Poison Center 1-800-222-1222, emergency 911.

## Limits, honestly

- **Resolution.** DOGAMI/3DEP lidar here averages about 9 points per square meter in the sample. The DEM is 1.5 ft cells, but under dense trees ground hits are sparse and filled by interpolation. The map overlay is about 1.4 ft per pixel, and tap and profile readouts sample an elevation grid of about 5.5 ft (both printed in the Layers footer). The Oregon statewide bare-earth mosaic is coarser (3 ft). Small features under about 3 ft across, like a single fence post hole, won't show.
- **Surface only.** Lidar sees the ground surface. It can't see buried objects; that takes ground-penetrating radar.
- **Property lines are not in lidar.** Get parcel lines from [Clackamas County CMap](https://maps.clackamas.us/cmap/), not from this map.
- **Streams are modeled.** They show where water *would* flow on bare earth. Culverts under roads aren't in the DEM, so modeled streams can stop at road fills.
- **Heights:** feet, in the lidar's vertical datum (NAVD88 for DOGAMI and 3DEP Oregon).

## Files

```
index.html  data.js  sw.js  manifest.webmanifest  icon.svg  .nojekyll   <- the public demo site (generated)
terrain/pdal-pipeline.py   the one entry point
terrain/web/app.js         viewer logic
terrain/web/vendor.js      Leaflet 1.9.4 + proj4js 2.12.1, self-hosted so the viewer works offline
terrain/web/guide.js       field guide: toxic ID key, invasives, dashboard, journal, walk mode, map pins
terrain/web/plants.data.js field-guide plant data (window.FIELD_GUIDE_DATA, versioned separately)
terrain/environment.yml    conda environment
terrain/local-output/      your local builds (gitignored, never published)
```
Data credit: USGS 3D Elevation Program, OR_OLCMetro_2019 (Oregon Lidar Consortium / DOGAMI). Base map © OpenStreetMap contributors.
