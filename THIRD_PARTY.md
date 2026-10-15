# Third-party assets

## Local real-road map edition (V3)

Static map images in assets/maps were exported for this personal travel report from [Esri World Topographic Map](https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer), following [Esri static-map terms](https://doc.arcgis.com/en/arcgis-online/reference/static-maps.htm). No tile sets were harvested. Map image is the intellectual property of Esri and is used herein under license. Copyright © 2026 Esri and its licensors. All rights reserved. Service credits: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), © OpenStreetMap contributors, and the GIS User Community. Full credits are available in the expandable attribution beneath every map. Export URLs and actual returned extents are preserved in adjacent JSON files.

Additional routes use the OSRM driving profile with OSM data under ODbL. The viewpoint is [OSM node 10567130317](https://www.openstreetmap.org/node/10567130317). Other endpoint source URLs are preserved in assets/maps/real-map-data.js. The routing model is not a certified bus track or motorcycle-access survey.

Additional photography, all retaining original ownership and used for this personal plan:

- `homestay-riverside.jpg`, `homestay-room.jpg`, `homestay-terrace.jpg`: สดชื่น กัญชนะ, [TripNiceDay สส โฮมสเตย์](https://www.tripniceday.com/place/สส-โฮมสเตย์-1744002127365). Files are named for development; visible captions identify the actual pictured house or riverside scene.
- `fang-hot-springs-park.jpg`: park imagery credited on [TripNiceDay น้ำพุร้อนฝาง](https://www.tripniceday.com/place/น้ำพุร้อนฝาง).
- `hinoki-coffee.jpg`, `hinoki-torii.png`: [Hinoki Land](https://hinokiland.com/), images in the matching activity sections of the official site.
- `chiangmai-fang-bus.jpg`: [ยานยนต์นครเชียงใหม่](https://www.yanyonnakornchiangmai.co.th/), official bus photograph.
- `hug-sheep-restaurant.jpg`, `hug-sheep-fang.jpg`: [Wongnai ฮักแกะ@ฝาง](https://www.wongnai.com/restaurants/230497ij), food and menu from historical reviews, not a promise of current menu or pricing.
- `ban-yang-village.jpg`: [อบต.แม่งอน](https://www.maengon.go.th/catalog/travels/196), museum scene in Ban Yang.
- `mae-mao-landscape.jpg`, `mae-mao-view.jpg`: additional images from the same [Trip.com review](https://www.trip.com/moments/detail/chiang-mai-province-23189-146980920/) credited below. Not used as substitute photographs for other locations.

Attribution does not transfer copyright or grant permission for unrelated commercial redistribution.

Libraries are stored locally so the planner opens directly from disk. Their upstream license notices are preserved in the distributed JavaScript/CSS files.

| Library | Version | License | Source |
| --- | --- | --- | --- |
| Leaflet | 1.9.4 | BSD-2-Clause | https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE |
| Chart.js | 4.4.8 | MIT | https://github.com/chartjs/Chart.js/blob/v4.4.8/LICENSE.md |
| Lucide | 0.468.0 | ISC, with some icons derived from Feather under MIT | https://github.com/lucide-icons/lucide/blob/0.468.0/LICENSE |

V2 uses local SVG route infographics and external Google Maps links. No map iframe, tile requests or runtime routing requests are made. Leaflet assets remain from the original version but are not loaded by the current page.

Two local GeoJSON routes were generated on 2026-10-15 with the OSRM public demo driving profile. These are approximate car-model routes, not verified bus routes. OSRM software: BSD-2-Clause, https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT . Road data: © OpenStreetMap contributors, ODbL 1.0, https://www.openstreetmap.org/copyright . Files in assets/maps preserve sources and attribution; the infographic displays attribution links. Decorative SVG illustrations are original artwork, not surveyed geography.

Mali and Prompt font files are stored locally, distributed under the SIL Open Font License. Full licenses are in assets/fonts/mali-OFL.txt and assets/fonts/prompt-OFL.txt. Sources: https://github.com/google/fonts/tree/main/ofl/mali and https://github.com/google/fonts/tree/main/ofl/prompt .

Hinoki Land photography belongs to its original owner and is included for this personal trip plan with a source link. The Fang Hot Springs photo source is PublicDomainPictures.net. See README.md for exact image sources. The mountain-journal SVG is an original schematic illustration for this project.

Additional personal trip-plan photography: Mae Mao Reservoir by เรา ไป แล้ว on Trip.com; Ban Yang community photographs by Mae Ngon Subdistrict Administrative Organization; SS Homestay review cover by ผมม้าพาเที่ยว on Lemon8. Exact source links and historical-price notes are in README.md and on the cards.
