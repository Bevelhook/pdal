/* Terrain field viewer - app logic. Data comes from data.js (window.TERRAIN), written by pdal-pipeline.py. */
(function () {
  "use strict";
  var T = window.TERRAIN, R = 6378137, RE = 6371008.8, FT = 1 / 0.3048;
  var $ = function (id) { return document.getElementById(id); };

  // ---------------------------------------------------------------- coordinate systems (verified vs epsg.io)
  proj4.defs("EPSG:4269", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs");
  proj4.defs("EPSG:2269", "+proj=lcc +lat_0=43.6666666666667 +lon_0=-120.5 +lat_1=46 +lat_2=44.3333333333333 +x_0=2500000.0001424 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs");
  proj4.defs("EPSG:2270", "+proj=lcc +lat_0=41.6666666666667 +lon_0=-120.5 +lat_1=44 +lat_2=42.3333333333333 +x_0=1500000.0001464 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=ft +no_defs +type=crs");
  var zone = "N";
  function stateplane(lat, lng, z) {
    var code = (z || zone) === "S" ? "EPSG:2270" : "EPSG:2269";
    var ds = T.datum_shift || { dlat: 0, dlon: 0 };   // WGS84 -> NAD83 (see pdal-pipeline.py)
    var p = proj4("EPSG:4269", code, [lng + ds.dlon, lat + ds.dlat]);
    return { e: p[0], n: p[1], code: code };
  }

  // ---------------------------------------------------------------- elevation grid (decifeet, delta coded)
  var G = T.grid, M = T.merc, elev = new Float32Array(G.w * G.h);
  (function decode() {
    var bin = atob(G.b64), n = G.w * G.h, buf = new ArrayBuffer(n * 2), u8 = new Uint8Array(buf);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    var dv = new DataView(buf), acc = 0;
    for (var k = 0; k < n; k++) {
      var d = dv.getInt16(k * 2, true);
      if (d === -32768) { elev[k] = NaN; } else { acc += d; elev[k] = G.zmin_ft + acc * G.step_ft; }
    }
  })();
  function merc(lat, lng) {
    return [lng * Math.PI / 180 * R, Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * R];
  }
  function cell(c, r) {
    if (c < 0 || r < 0 || c >= G.w || r >= G.h) return NaN;
    return elev[r * G.w + c];
  }
  function sampleElev(lat, lng) {
    var m = merc(lat, lng);
    var fx = (m[0] - M[0]) / (M[2] - M[0]) * G.w - 0.5, fy = (M[3] - m[1]) / (M[3] - M[1]) * G.h - 0.5;
    if (fx < -0.5 || fy < -0.5 || fx > G.w - 0.5 || fy > G.h - 0.5) return NaN;
    var c0 = Math.floor(fx), r0 = Math.floor(fy), tx = fx - c0, ty = fy - r0;
    var v = [cell(c0, r0), cell(c0 + 1, r0), cell(c0, r0 + 1), cell(c0 + 1, r0 + 1)];
    var wts = [(1 - tx) * (1 - ty), tx * (1 - ty), (1 - tx) * ty, tx * ty], s = 0, ws = 0;
    for (var i = 0; i < 4; i++) if (!isNaN(v[i])) { s += v[i] * wts[i]; ws += wts[i]; }
    return ws > 0.25 ? s / ws : NaN;   // bilinear; tolerate one missing corner
  }
  var cellGroundM = (M[2] - M[0]) / G.w * Math.cos(((T.bounds[0][0] + T.bounds[1][0]) / 2) * Math.PI / 180);
  function sampleSlope(lat, lng) {
    var d = cellGroundM, dLat = d / 111320, dLng = d / (111320 * Math.cos(lat * Math.PI / 180));
    var e = sampleElev(lat, lng + dLng), w = sampleElev(lat, lng - dLng), n = sampleElev(lat + dLat, lng), s = sampleElev(lat - dLat, lng);
    if ([e, w, n, s].some(isNaN)) return NaN;
    var dzdx = (e - w) / (2 * d * FT), dzdy = (n - s) / (2 * d * FT);
    return Math.atan(Math.hypot(dzdx, dzdy)) * 180 / Math.PI;
  }

  // ---------------------------------------------------------------- geodesy
  function hav(a, b) {
    var p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180, dp = p2 - p1, dl = (b.lng - a.lng) * Math.PI / 180;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * RE * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function lengthM(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += hav(pts[i - 1], pts[i]); return s; }
  function areaM2(pts) {            // spherical polygon area (same formula as Leaflet.draw's geodesicArea)
    var a = 0, n = pts.length;
    if (n < 3) return 0;
    for (var i = 0; i < n; i++) {
      var p1 = pts[i], p2 = pts[(i + 1) % n];
      a += (p2.lng - p1.lng) * Math.PI / 180 * (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
    }
    return Math.abs(a * RE * RE / 2);
  }
  function fmtLen(m) {
    var ft = m * FT;
    return ft.toFixed(ft < 1000 ? 1 : 0) + " ft  |  " + (ft / 5280).toFixed(3) + " mi  |  " + m.toFixed(1) + " m";
  }
  function fmtArea(m2) {
    var sqft = m2 * FT * FT;
    return Math.round(sqft).toLocaleString() + " sq ft  |  " + (sqft / 43560).toFixed(3) + " acres";
  }

  // ---------------------------------------------------------------- map + layers
  var bounds = L.latLngBounds(T.bounds);
  var map = L.map("map", { preferCanvas: true, zoomControl: true, maxZoom: 21, tap: false, attributionControl: true });
  var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 21, maxNativeZoom: 19, crossOrigin: "anonymous",
    attribution: "\u00a9 OpenStreetMap contributors"
  }).addTo(map);
  map.fitBounds(bounds);
  var opacity = 0.85;
  function img(key) { return L.imageOverlay("data:image/webp;base64," + T.layers[key], bounds, { opacity: opacity, interactive: false }); }
  var accent = function () { return getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#ffb000"; };
  var LAYERS = [
    { id: "elevation", label: "Elevation", raster: true, layer: img("elevation"), on: true },
    { id: "hillshade", label: "Hillshade", raster: true, layer: img("hillshade"), on: false },
    { id: "slope", label: "Slope", raster: true, layer: img("slope"), on: false },
    { id: "flowacc", label: "Flow accum.", raster: true, layer: img("flowacc"), on: false },
    { id: "contours", label: "Contours", layer: L.geoJSON(T.contours, { interactive: false, style: function (f) {
        var major = Math.abs((f.properties.elev_ft / (T.contour_interval_ft * 5)) % 1) < 1e-6;
        return { color: "#3b2a14", weight: major ? 1.6 : 0.7, opacity: 0.9 }; } }), on: false },
    { id: "streams", label: "Streams", layer: L.geoJSON(T.streams, { interactive: false, style: { color: "#00b7ff", weight: 2.5 } }), on: true },
    { id: "watershed", label: "Watershed", layer: L.layerGroup([
        L.geoJSON(T.watershed, { interactive: false, style: { color: "#ff2fd6", weight: 3, dashArray: "8 6", fill: true, fillOpacity: 0.06 } }),
        L.geoJSON(T.pour_snap, { interactive: false, pointToLayer: function (f, ll) { return L.circleMarker(ll, { radius: 7, color: "#fff", weight: 2, fillColor: "#ff2fd6", fillOpacity: 1 }); } })
      ]), on: true }
  ];
  var lb = $("layerBtns");
  LAYERS.forEach(function (L1) {
    var b = document.createElement("button");
    b.textContent = L1.label; b.id = "lyr-" + L1.id; b.setAttribute("aria-pressed", "false");
    b.onclick = function () { setLayer(L1, !L1.on); };
    lb.appendChild(b); L1.btn = b;
    setLayer(L1, L1.on);
  });
  function setLayer(L1, on) {
    L1.on = on;
    if (on) L1.layer.addTo(map); else map.removeLayer(L1.layer);
    L1.btn.classList.toggle("on", on); L1.btn.setAttribute("aria-pressed", String(on));
    if (L1.raster && on) L1.layer.bringToFront();
    LAYERS.forEach(function (x) { if (!x.raster && x.on) { x.layer.eachLayer ? null : null; } });
    legend();
  }
  $("opacity").oninput = function () {
    opacity = this.value / 100;
    LAYERS.forEach(function (x) { if (x.raster) x.layer.setOpacity(opacity); });
  };
  function grad(stops, max) {
    return "linear-gradient(90deg," + stops.map(function (s) {
      return "rgb(" + s[1].join(",") + ") " + (s[0] / max * 100).toFixed(1) + "%"; }).join(",") + ")";
  }
  function legend() {
    var h = "", on = {};
    LAYERS.forEach(function (x) { on[x.id] = x.on; });
    if (on.elevation) h += '<div class="lg"><b>Elevation (ft, NAVD88)</b><div class="ramp" style="background:' + grad(T.elev_stops, 1) + '"></div><div class="ends"><span>' + T.elev_ft[0] + '</span><span>' + ((T.elev_ft[0] + T.elev_ft[1]) / 2).toFixed(1) + '</span><span>' + T.elev_ft[1] + '</span></div></div>';
    if (on.hillshade) h += '<div class="lg"><b>Hillshade</b>: grey relief lit from several directions (best in bright sun)</div>';
    if (on.slope) h += '<div class="lg"><b>Slope (degrees)</b><div class="ramp" style="background:' + grad(T.slope_stops, 45) + '"></div><div class="ends"><span>0</span><span>5</span><span>10</span><span>20</span><span>30</span><span>45+</span></div></div>';
    if (on.flowacc) h += '<div class="lg"><b>Flow accumulation</b>: where water collects; darker blue = more uphill area drains through</div>';
    if (on.contours) h += '<div class="lg"><span class="sw" style="background:#3b2a14"></span><b>Contours</b> every ' + T.contour_interval_ft + ' ft (thick every ' + (T.contour_interval_ft * 5) + ' ft)</div>';
    if (on.streams) h += '<div class="lg"><span class="sw" style="background:#00b7ff"></span><b>Streams</b>: modeled flow paths (over ' + T.hydrology.stream_threshold_cells.toLocaleString() + ' cells drain here)</div>';
    if (on.watershed) h += '<div class="lg"><span class="sw" style="background:#ff2fd6"></span><b>Watershed</b>: ' + T.hydrology.watershed_acres + ' acres drain to the pink outlet dot</div>';
    $("legend").innerHTML = h || '<div class="lg">No layers on.</div>';
  }
  $("sub").textContent = T.elev_ft[0] + "-" + T.elev_ft[1] + " ft  |  DEM " + T.dem_res_ft + " ft";
  var srcTxt = "Data: " + T.source + ". Bare earth by " + T.ground + ", reprojected to " + T.srs + ". DEM " + T.dem_res_ft + " ft cells; map overlay ~" + T.web_px_ft + " ft per pixel; tap readouts sample a ~" + T.grid_px_ft + " ft grid. Built " + T.built + ", build " + window.TERRAIN_BUILD + ". Lidar shows the ground surface only; property lines come from Clackamas County CMap, not lidar.";
  $("srcNote").textContent = srcTxt; $("aboutNote").textContent = srcTxt;

  // ---------------------------------------------------------------- sheets / toolbar
  // Every .sheet gets a header with a title (tap = minimize/expand), a minimize button and a close button,
  // built here from its first <h3>, so any panel added to the template later gets the same controls.
  var openSheet = null, infoPrefMin = false;
  var SHEETS = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  SHEETS.forEach(function (s) {
    var h = s.querySelector("h3"), title = h ? h.textContent : s.id;
    var body = document.createElement("div"); body.className = "sh-body";
    while (s.firstChild) body.appendChild(s.firstChild);
    if (h) h.remove();
    var head = document.createElement("div"); head.className = "sh-head";
    head.innerHTML = '<button class="sh-title" type="button" aria-expanded="true"><span class="sh-name"></span><span class="sh-sum"></span></button>' +
      '<button class="sh-min" type="button" aria-label="Minimize panel" title="Minimize">\u25be</button>' +
      '<button class="sh-x" type="button" aria-label="Close panel" title="Close (Esc)">\u2715</button>';
    head.querySelector(".sh-name").textContent = title;
    s.appendChild(head); s.appendChild(body);
    s.setAttribute("role", "dialog"); s.setAttribute("aria-label", title);
    head.querySelector(".sh-title").onclick = function () { setMin(s.id, !s.classList.contains("min")); };
    head.querySelector(".sh-min").onclick = function () { setMin(s.id, !s.classList.contains("min")); };
    head.querySelector(".sh-x").onclick = function () { closeSheet(); };
  });
  function sheetSummary(id, txt) { var e = document.querySelector("#" + id + " .sh-sum"); if (e) e.textContent = txt ? "  " + txt : ""; }
  function syncBar() {
    document.querySelectorAll("#bar button[data-sheet]").forEach(function (b) {
      var on = b.dataset.sheet === openSheet; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function setMin(id, min) {
    var s = $(id); if (!s) return;
    s.classList.toggle("min", !!min);
    s.querySelector(".sh-title").setAttribute("aria-expanded", min ? "false" : "true");
    var m = s.querySelector(".sh-min"); m.innerHTML = min ? "\u25b4" : "\u25be";
    m.setAttribute("aria-label", min ? "Expand panel" : "Minimize panel"); m.title = min ? "Expand" : "Minimize";
    if (id === "infoSheet") infoPrefMin = !!min;
    if (!min && id === "measureSheet" && $("prof").style.display === "block" && lastProfile) drawProfile(lastProfile);
  }
  function openSheetId(id, min) {
    // leaving the measure panel for another panel ends the active tool (a finished shape is kept)
    if (openSheet === "measureSheet" && id !== "measureSheet" && tool) finish();
    openSheet = id;
    SHEETS.forEach(function (s) { s.classList.toggle("open", s.id === id); });
    if (id) setMin(id, !!min);
    syncBar();
  }
  function closeSheet() { openSheetId(null); }
  function show(id) {             // bottom-bar tab: open; tap again to close (or to expand if it was minimized)
    if (openSheet === id) { if ($(id).classList.contains("min")) setMin(id, false); else closeSheet(); }
    else openSheetId(id);
  }
  document.querySelectorAll("#bar button[data-sheet]").forEach(function (b) { b.onclick = function () { show(b.dataset.sheet); }; });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    if (openSheet) { e.preventDefault(); closeSheet(); }
    else if (tool) { e.preventDefault(); finish(); }
  });
  $("fitBtn").onclick = function () { map.fitBounds(bounds); };
  function hint(t) { var h = $("hint"); h.textContent = t || ""; h.style.display = t ? "block" : "none"; }
  $("hint").onclick = function () { hint(); };   // tap the banner to dismiss it

  // iPhone Safari: keep the toolbar above browser chrome that overlays the page bottom (visual viewport shorter
  // than the layout viewport). Zero on desktop and when Safari reports no overlap.
  function vvFix() {
    var vv = window.visualViewport, gap = 0;
    if (vv && Math.abs((vv.scale || 1) - 1) < 0.01) gap = Math.max(0, Math.min(160, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    document.documentElement.style.setProperty("--vvb", gap + "px");
  }
  if (window.visualViewport) { visualViewport.addEventListener("resize", vvFix); visualViewport.addEventListener("scroll", vvFix); }
  window.addEventListener("resize", vvFix); vvFix();

  // ---------------------------------------------------------------- tap readout
  var tapMarker = null;
  function readout(lat, lng, label) {
    var z = sampleElev(lat, lng), s = sampleSlope(lat, lng), sp = stateplane(lat, lng);
    var zn = zone === "S" ? "Oregon SOUTH zone (EPSG:2270)" : "Oregon NORTH zone (EPSG:2269)";
    $("info").innerHTML = '<div class="kv">' +
      (label ? '<div>Source</div><div>' + label + '</div>' : '') +
      '<div>Elevation</div><div class="big">' + (isNaN(z) ? "outside data" : z.toFixed(1) + " ft") + '</div>' +
      '<div>Slope</div><div class="big">' + (isNaN(s) ? "-" : s.toFixed(1) + "\u00b0  (" + (Math.tan(s * Math.PI / 180) * 100).toFixed(0) + "%)") + '</div>' +
      '<div>Lat, Long</div><div id="ro-ll">' + lat.toFixed(6) + ", " + lng.toFixed(6) + '</div>' +
      '<div>State Plane</div><div>' + zn + ', NAD83, international ft' + (zone === "S" ? ' <b style="color:var(--bad)">(Molalla is in the NORTH zone)</b>' : '') + '</div>' +
      '<div>Datum</div><div>' + ((T.datum_shift && T.datum_shift.op) || "WGS84 = NAD83") + '</div>' + '<div>Easting</div><div id="ro-e">' + sp.e.toFixed(1) + ' ft</div><div>Northing</div><div id="ro-n">' + sp.n.toFixed(1) + ' ft</div></div>';
    if (tapMarker) map.removeLayer(tapMarker);
    tapMarker = L.circleMarker([lat, lng], { radius: 9, color: "#000", weight: 3, fillColor: accent(), fillOpacity: 1 }).addTo(map);
    last = { lat: lat, lng: lng, label: label };
    sheetSummary("infoSheet", (isNaN(z) ? "no data" : z.toFixed(0) + " ft") + (isNaN(s) ? "" : ", " + s.toFixed(0) + "\u00b0"));
    return { elev_ft: z, slope_deg: s, e: sp.e, n: sp.n, code: sp.code };
  }
  var last = null;
  function setZone(z) {
    zone = z; $("zoneN").classList.toggle("on", z === "N"); $("zoneS").classList.toggle("on", z === "S");
    if (last) readout(last.lat, last.lng, last.label);
  }
  $("zoneN").onclick = function () { setZone("N"); };
  $("zoneS").onclick = function () { setZone("S"); };

  // ---------------------------------------------------------------- GPS
  var gpsLayer = null;
  $("gpsBtn").onclick = function () {
    if (!navigator.geolocation) { hint("This browser has no GPS access."); return; }
    if (!window.isSecureContext) { hint("GPS needs https (works on the public link or 127.0.0.1)."); setTimeout(hint, 4000); return; }
    hint("Getting GPS fix...");
    navigator.geolocation.getCurrentPosition(function (p) {
      hint();
      var ll = [p.coords.latitude, p.coords.longitude];
      if (gpsLayer) map.removeLayer(gpsLayer);
      gpsLayer = L.layerGroup([L.circle(ll, { radius: p.coords.accuracy, color: "#00b7ff", weight: 1, fillOpacity: 0.1 }),
        L.circleMarker(ll, { radius: 8, color: "#fff", weight: 3, fillColor: "#00b7ff", fillOpacity: 1 })]).addTo(map);
      map.setView(ll, Math.max(map.getZoom(), 17));
      if (openSheet !== "infoSheet") openSheetId("infoSheet", infoPrefMin);
      readout(ll[0], ll[1], "GPS (\u00b1" + Math.round(p.coords.accuracy * FT) + " ft)");
    }, function (e) { hint("GPS unavailable: " + e.message); setTimeout(hint, 4000); }, { enableHighAccuracy: true, timeout: 20000 });
  };

  // ---------------------------------------------------------------- measuring
  var tool = null, pts = [], temp = L.layerGroup().addTo(map), saved = L.layerGroup().addTo(map), features = [];
  function setTool(t) {
    if (t && t === tool) { finish(); return; }   // tapping the active tool again turns it off (keeps a finished shape)
    if (tool) finish();
    tool = t; pts = [];
    ["mDist", "mArea", "mProf"].forEach(function (id) { $(id).classList.toggle("on", ("m" + { dist: "Dist", area: "Area", prof: "Prof" }[t]) === id); });
    hint(t ? { dist: "Tap points for distance, then Finish", area: "Tap corners for area, then Finish", prof: "Tap points along the profile line, then Finish" }[t] : "");
    if (t !== "prof") $("prof").style.display = "none";
    ["mDist", "mArea", "mProf"].forEach(function (id) { $(id).setAttribute("aria-pressed", $(id).classList.contains("on") ? "true" : "false"); });
    sheetSummary("measureSheet", t ? shortText() : "");
  }
  $("mDist").onclick = function () { setTool("dist"); };
  $("mArea").onclick = function () { setTool("area"); };
  $("mProf").onclick = function () { setTool("prof"); };
  function redrawTemp() {
    temp.clearLayers();
    var col = accent();
    if (pts.length > 1) (tool === "area" ? L.polygon(pts, { color: col, weight: 4, fillOpacity: 0.15 }) : L.polyline(pts, { color: col, weight: 4 })).addTo(temp);
    pts.forEach(function (p) { L.circleMarker(p, { radius: 7, color: "#000", weight: 2, fillColor: col, fillOpacity: 1 }).addTo(temp); });
    $("mOut").innerHTML = liveText(); sheetSummary("measureSheet", shortText());
  }
  function shortText() {
    if (!tool) return "";
    var nm = { dist: "Distance", area: "Area", prof: "Profile" }[tool];
    if (tool === "area") return nm + " " + (pts.length > 2 ? fmtArea(areaM2(pts)).split("  |")[0] : "") + " (" + pts.length + " pts)";
    return nm + " " + (pts.length > 1 ? fmtLen(lengthM(pts)).split("  |")[0] : "") + " (" + pts.length + " pts)";
  }
  function liveText() {
    if (!tool) return "Pick a tool, then tap points on the map.";
    if (tool === "area") return "<b>Area</b>: " + fmtArea(areaM2(pts)) + "<br>Perimeter: " + fmtLen(pts.length > 2 ? lengthM(pts.concat([pts[0]])) : lengthM(pts)) + "<br>" + pts.length + " corners";
    return "<b>" + (tool === "prof" ? "Profile" : "Distance") + "</b>: " + fmtLen(lengthM(pts)) + "<br>" + pts.length + " points";
  }
  function addPoint(ll) { pts.push(L.latLng(ll.lat, ll.lng)); redrawTemp(); }
  $("mUndo").onclick = function () { pts.pop(); redrawTemp(); };
  $("mClear").onclick = function () { lastProfile = null; sheetSummary("measureSheet", ""); pts = []; features = []; saved.clearLayers(); temp.clearLayers(); $("prof").style.display = "none"; $("mOut").innerHTML = liveText(); };
  $("mDone").onclick = function () { finish(); };
  function profile(p, n) {
    n = n || 240;
    var segs = [], total = 0;
    for (var i = 1; i < p.length; i++) { var d = hav(p[i - 1], p[i]); segs.push(d); total += d; }
    var out = [];
    for (var k = 0; k <= n; k++) {
      var t = total * k / n, j = 0, acc = 0;
      while (j < segs.length - 1 && acc + segs[j] < t) { acc += segs[j]; j++; }
      var f = segs[j] ? (t - acc) / segs[j] : 0;
      var lat = p[j].lat + (p[j + 1].lat - p[j].lat) * f, lng = p[j].lng + (p[j + 1].lng - p[j].lng) * f;
      out.push({ d_ft: t * FT, z: sampleElev(lat, lng) });
    }
    var v = out.filter(function (o) { return !isNaN(o.z); });
    if (v.length < 2) return { samples: out, stats: null };
    var zs = v.map(function (o) { return o.z; }), gain = 0, loss = 0, maxg = 0;
    var win = Math.max(cellGroundM * FT * 2, total * FT / n);  // grade over >= 2 grid cells
    for (var a = 1; a < v.length; a++) { var dz = v[a].z - v[a - 1].z; if (dz > 0) gain += dz; else loss -= dz; }
    for (var b = 0; b < v.length; b++) {
      for (var c = b + 1; c < v.length; c++) if (v[c].d_ft - v[b].d_ft >= win) { maxg = Math.max(maxg, Math.abs(v[c].z - v[b].z) / (v[c].d_ft - v[b].d_ft)); break; }
    }
    var st = { length_ft: +(total * FT).toFixed(1), min_ft: +Math.min.apply(null, zs).toFixed(1), max_ft: +Math.max.apply(null, zs).toFixed(1),
      start_ft: +v[0].z.toFixed(1), end_ft: +v[v.length - 1].z.toFixed(1), gain_ft: +gain.toFixed(1), loss_ft: +loss.toFixed(1),
      avg_grade_pct: +((v[v.length - 1].z - v[0].z) / (v[v.length - 1].d_ft - v[0].d_ft) * 100).toFixed(2), max_grade_pct: +(maxg * 100).toFixed(1) };
    return { samples: out, stats: st };
  }
  var lastProfile = null;
  function drawProfile(pr) {
    var cv = $("prof"); cv.style.display = "block"; lastProfile = pr;
    var dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    var g = cv.getContext("2d"); g.scale(dpr, dpr);
    var cs = getComputedStyle(document.body), fg = cs.getPropertyValue("--fg").trim(), mu = cs.getPropertyValue("--muted").trim(), ac = cs.getPropertyValue("--accent").trim();
    g.clearRect(0, 0, W, H);
    var st = pr.stats; if (!st) { g.fillStyle = fg; g.fillText("No elevation data under this line", 10, 20); return; }
    var padL = 46, padB = 22, padT = 10, padR = 8, z0 = st.min_ft, z1 = st.max_ft;
    if (z1 - z0 < 2) { z0 -= 1; z1 += 1; }
    var X = function (d) { return padL + d / st.length_ft * (W - padL - padR); }, Y = function (z) { return padT + (z1 - z) / (z1 - z0) * (H - padT - padB); };
    g.strokeStyle = mu; g.lineWidth = 1; g.fillStyle = fg; g.font = "12px sans-serif";
    for (var i = 0; i <= 4; i++) { var z = z0 + (z1 - z0) * i / 4, y = Y(z); g.globalAlpha = 0.3; g.beginPath(); g.moveTo(padL, y); g.lineTo(W - padR, y); g.stroke(); g.globalAlpha = 1; g.fillText(z.toFixed(0), 4, y + 4); }
    g.fillText("0 ft", padL, H - 6); var lt = st.length_ft.toFixed(0) + " ft"; g.fillText(lt, W - padR - g.measureText(lt).width, H - 6);
    g.beginPath(); var first = true;
    pr.samples.forEach(function (s) { if (isNaN(s.z)) { first = true; return; } if (first) { g.moveTo(X(s.d_ft), Y(s.z)); first = false; } else g.lineTo(X(s.d_ft), Y(s.z)); });
    g.strokeStyle = ac; g.lineWidth = 2.5; g.stroke();
  }
  function finish() {
    var t = tool;
    if (!t) return null;
    var need = t === "area" ? 3 : 2, feat = null;
    if (pts.length >= need) {
      var coords = pts.map(function (p) { return [+p.lng.toFixed(7), +p.lat.toFixed(7)]; });
      var props = { kind: { dist: "distance", area: "area", prof: "profile" }[t] };
      if (t === "area") {
        var a = areaM2(pts), per = lengthM(pts.concat([pts[0]]));
        props.area_sqft = +(a * FT * FT).toFixed(1); props.area_acres = +(a * FT * FT / 43560).toFixed(4); props.area_m2 = +a.toFixed(2);
        props.perimeter_ft = +(per * FT).toFixed(1);
        feat = { type: "Feature", properties: props, geometry: { type: "Polygon", coordinates: [coords.concat([coords[0]])] } };
        L.polygon(pts, { color: accent(), weight: 3, fillOpacity: 0.12 }).addTo(saved);
        $("mOut").innerHTML = "<b>Area</b>: " + fmtArea(a) + "<br>Perimeter: " + fmtLen(per);
      } else {
        var m = lengthM(pts);
        props.length_ft = +(m * FT).toFixed(2); props.length_mi = +(m * FT / 5280).toFixed(5); props.length_m = +m.toFixed(2);
        L.polyline(pts, { color: accent(), weight: 3 }).addTo(saved);
        $("mOut").innerHTML = "<b>Distance</b>: " + fmtLen(m);
        if (t === "prof") {
          var pr = profile(pts); props.profile = pr.stats;
          if (pr.stats) $("mOut").innerHTML += "<br>Min " + pr.stats.min_ft + " ft, max " + pr.stats.max_ft + " ft, gain " + pr.stats.gain_ft + " ft, loss " + pr.stats.loss_ft + " ft<br>Average grade " + pr.stats.avg_grade_pct + "%, steepest " + pr.stats.max_grade_pct + "%";
          drawProfile(pr);
        }
        feat = { type: "Feature", properties: props, geometry: { type: "LineString", coordinates: coords } };
      }
      features.push(feat);
      sheetSummary("measureSheet", "saved " + features.length);
    } else {
      $("mOut").innerHTML = pts.length ? "Not enough points for " + props0(t) + " (needs " + need + "); nothing saved." : liveText0();
      sheetSummary("measureSheet", "");
    }
    tool = null; pts = []; temp.clearLayers(); hint("");
    ["mDist", "mArea", "mProf"].forEach(function (id) { $(id).classList.remove("on"); $(id).setAttribute("aria-pressed", "false"); });
    return feat;
  }
  function props0(t) { return { dist: "a distance", area: "an area", prof: "a profile" }[t]; }
  function liveText0() { return "Pick a tool, then tap points on the map."; }
  map.on("click", function (e) {
    if (tool) { addPoint(e.latlng); return; }    // measuring: map taps add points, panels stay as they are
    if (openSheet !== "infoSheet") openSheetId("infoSheet", infoPrefMin);
    readout(e.latlng.lat, e.latlng.lng);
  });

  // ---------------------------------------------------------------- export
  function download(blob, name) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  function geojson() {
    return { type: "FeatureCollection", name: "terrain-measurements", crs_note: "WGS84 lon/lat; lengths and areas are geodesic",
      source: T.source, build: window.TERRAIN_BUILD, features: features };
  }
  $("exGeo").onclick = function () {
    if (tool) finish();
    if (!features.length) { $("exOut").textContent = "Nothing measured yet. Use Measure first."; return; }
    download(new Blob([JSON.stringify(geojson(), null, 1)], { type: "application/geo+json" }), "terrain-measurements.geojson");
    $("exOut").textContent = "Saved " + features.length + " measurement(s) as GeoJSON.";
  };
  function snapshot() {     // composite tiles + overlays + vector canvas into one PNG
    var box = map.getContainer().getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement("canvas"); cv.width = Math.round(box.width * dpr); cv.height = Math.round(box.height * dpr);
    var g = cv.getContext("2d"); g.scale(dpr, dpr); g.fillStyle = "#222"; g.fillRect(0, 0, box.width, box.height);
    function op(el) { var o = 1; while (el && el !== document.body) { var v = parseFloat(getComputedStyle(el).opacity); if (!isNaN(v)) o *= v; el = el.parentElement; } return o; }
    function draw(el) {
      var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      if (el.tagName === "IMG" && !(el.complete && el.naturalWidth)) return;
      g.globalAlpha = op(el); g.drawImage(el, r.left - box.left, r.top - box.top, r.width, r.height);
    }
    map.getPane("tilePane").querySelectorAll("img").forEach(draw);
    map.getPane("overlayPane").querySelectorAll("img, canvas").forEach(draw);
    map.getPane("markerPane").querySelectorAll("img").forEach(draw);
    g.globalAlpha = 1; g.font = "12px sans-serif";
    var txt = "\u00a9 OpenStreetMap contributors | " + T.source + " | build " + window.TERRAIN_BUILD;
    g.fillStyle = "rgba(0,0,0,.65)"; g.fillRect(0, box.height - 20, box.width, 20); g.fillStyle = "#fff"; g.fillText(txt, 6, box.height - 6);
    return cv;
  }
  $("exPng").onclick = function () {
    try {
      var cv = snapshot();
      cv.toBlob(function (b) {
        if (!b) { $("exOut").textContent = "PNG export failed in this browser."; return; }
        download(b, "terrain-map.png"); $("exOut").textContent = "Saved the current map view as PNG.";
      }, "image/png");
    } catch (e) { $("exOut").textContent = "PNG export failed: " + e.message; }
  };

  // ---------------------------------------------------------------- theme, network, service worker
  function setTheme(bright) {
    document.body.classList.toggle("bright", bright);
    $("themeBtn").textContent = bright ? "DARK" : "SUN";
    $("themeBtn").setAttribute("aria-label", bright ? "dark mode" : "bright mode");
    document.querySelector('meta[name="theme-color"]').content = bright ? "#ffffff" : "#0b0b0c";
    try { localStorage.setItem("terrain-theme", bright ? "bright" : "dark"); } catch (e) {}
    redrawTemp();
  }
  $("themeBtn").onclick = function () { setTheme(!document.body.classList.contains("bright")); };
  try { if (localStorage.getItem("terrain-theme") === "bright") setTheme(true); } catch (e) {}
  // online/offline: the browser flag plus a tiny no-cache probe (the service worker lets probes through)
  var probeOk = true;
  function net() { var on = navigator.onLine && probeOk, n = $("net"); n.textContent = on ? "ONLINE" : "OFFLINE"; n.className = on ? "on" : "off"; }
  function probe() {
    if (!navigator.onLine) { probeOk = false; net(); return; }
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    fetch("https://tile.openstreetmap.org/0/0/0.png?probe=" + Date.now(), { mode: "no-cors", cache: "no-store", signal: ctl ? ctl.signal : undefined })
      .then(function () { probeOk = true; }, function () { probeOk = false; })
      .then(function () { clearTimeout(to); net(); });
  }
  window.addEventListener("online", probe); window.addEventListener("offline", probe);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) probe(); });
  setInterval(function () { if (!document.hidden) probe(); }, 60000);
  net(); probe();
  window.__sw = "unsupported";
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.__sw = "registering";
    var hadController = !!navigator.serviceWorker.controller, reloading = false;
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (r) {
      window.__sw = "registered";
      document.addEventListener("visibilitychange", function () { if (!document.hidden) r.update().catch(function () {}); });
      return navigator.serviceWorker.ready;
    }).then(function () { window.__sw = "ready"; }).catch(function (e) { window.__sw = "failed: " + e.message; });
    // A new build took over (sw.js changed): reload once so the phone runs it, unless work would be lost.
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || reloading) { hadController = true; return; }
      if (tool || pts.length || features.length || (window.FieldGuide && FieldGuide.busy && FieldGuide.busy())) {
        hint("App updated. Save your work (measurements or the find you are logging), then reload to use the new version."); return;
      }
      reloading = true; location.reload();
    });
  } else if (location.protocol === "file:") { window.__sw = "skipped (file://)"; }

  // test / automation hooks
  window.TerrainApp = { map: map, sampleElev: sampleElev, sampleSlope: sampleSlope, stateplane: stateplane, lengthM: lengthM, areaM2: areaM2,
    setTool: setTool, addPoint: addPoint, finish: finish, readout: readout, setZone: setZone, layers: LAYERS, setLayer: setLayer,
    geojson: geojson, snapshot: snapshot, profile: profile, show: show, closeSheet: closeSheet, setMin: setMin, openSheet: function () { return openSheet; }, tool: function () { return tool; }, last: function () { return last; } };
})();
