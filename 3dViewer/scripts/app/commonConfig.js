define(
"app/commonConfig", ['three'],
function (THREE) {
    'use strict';
    var config = {
        VERSION: "1.1",
        Options: {
            bgcolor: null,
            light: {
                directional: {
                    azimuth: 220,   // note: default light azimuth of gdaldem hillshade is 315.
                    altitude: 45    // altitude angle
                }
            },
            side: { color: 0xc7ac92, bottomZ: 0 },
            //frame: { color: 0, bottomZ: -1.5 },
            label: { visible: true, connectorColor: 0xc0c0d0, autoSize: false, minFontSize: 10 },
            qmarker: { r: 0.25, c: 0xffff00, o: 0.8 },
            debugMode: true,
            exportMode: false,
            jsonLoader: "JSONLoader"  // JSONLoader or ObjectLoader
        }
    };
    config.LayerType = { DEM: "dem", Point: "point", Line: "line", Polygon: "polygon" };
    config.MaterialType = { MeshLambert: 0, MeshPhong: 1, LineBasic: 2, Sprite: 3, Unknown: -1 };
    config.uv = { i: new THREE.Vector3(1, 0, 0), j: new THREE.Vector3(0, 1, 0), k: new THREE.Vector3(0, 0, 1) };

    return config;
});