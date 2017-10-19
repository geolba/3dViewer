// Filename: Map.js 
define('gba/controls/Map', ["lib/threejs/OrbitControls", "helper/dom", "gba/controls/MyZoom", "gba/controls/HomeButton",
    "gba/controls/Coordinates", "gba/controls/SlicerControl", "gba/controls/MaptoolControl", "helper/utilities", "helper/unload",
"gba/controls/BoreholePopup", "gba/layer/GridLayer", "lib/proj4js/proj4js-amd"],
    function (OrbitControls, dom, MyZoom, HomeButton, Coordinates, SlicerControl, MaptoolControl, util, unload, BoreholePopup, GridLayer, Proj4js) {
        "use strict";

        //var test = Dataservice;

        var Map = OrbitControls.extend({

            //statics: {
            //    LAYERS: []
            //},

            options: {
                trackResize: true
            },

            datalayers: [],

            getMapX: function (x) {
                x = x / this.scale + this.origin.x;
                var dest = new Proj4js.Proj("EPSG:4326");
                var source = new Proj4js.Proj(this.crs);
                var minPoint = { x: x, spatialReference: { wkid: 31256 } };
                var point84 = Proj4js.transform(source, dest, minPoint);
                x = point84.x;
                return (Math.round(x * 100) / 100);
            },

            getMapY: function (y) {
                y = y / this.scale + this.origin.y;
                var dest = new Proj4js.Proj("EPSG:4326");
                var source = new Proj4js.Proj(this.crs);
                var minPoint = { y: y, spatialReference: { wkid: 31256 } };
                var point84 = Proj4js.transform(source, dest, minPoint);
                y = point84.y;
                return (Math.round(y * 100) / 100);
            },

            getMapZ: function (z) {
                z = z / this.zScale + this.origin.z;
                return parseInt(z, 10);
            },

            init: function (camera, scene, domElement, container, dataservice) {
                //call parent constructor
                OrbitControls.prototype.init.call(this, camera, scene, domElement);

                //initialize additional properties
                this.dataservice = dataservice;
                //Map.LAYERS = dataservice.LAYERS;
                this.origin = dataservice.origin;
                this.scale = dataservice.scale;
                this.zScale = dataservice.zScale;
                this.crs = dataservice.crs;
                this.container = container;

                this.length = dataservice.width;
                this.width = dataservice.height;

                //init the control corners
                if (this._initControlPos) {
                    this._initControlPos();
                }
                this._layers = {};
                this.initControls();
                //// Global storage for retrieving datalayers
                //this.datalayers = {};
                //this.datalayers_index = [];
                //this.dirty_datalayers = [];

                // create datalayers
                this.initDatalayers();

                ////create invisible grid layyer
                //this.gridlayer = new GridLayer().addTo(this);
                this.basemaps = {
                    "currentVersion": 10.01,
                    "services": [
                    { "name": "ogdwien:BEZIRKSGRENZEOGD", "type": "MapServer", 'image': 'base_border.jpg', 'title': 'Border' },
                    { "name": "ogdwien:ASFINAGSTRASSEOGD", "type": "MapServer", 'image': 'base_traffic.jpg', 'title': 'Traffic' },
                    { "name": "1GE_GBA_500k_Surface_Geology", "type": "MapServer", 'image': 'base_geo.jpg', 'title': 'Surface Geology' }
                    ]
                };

                //this.domElement.style.cursor = "crosshair";  

                unload.addOnWindowUnload(this, this.destroy);
            },

            destroy: function () {
                //if (this._loaded) {
                this.emit('unload');
                //}
                this._initEvents('off');

                this._controls.homeControl.removeFrom(this);
                this._controls.zoomControl.removeFrom(this);
                //this._controls.coordinates.removeFrom(this);
                //this._controls.slicer.removeFrom(this);
                this._controls.boreholePopup.removeFrom(this);

                this.eachLayer(function (layer) {
                    this.removeLayer(layer);
                }, this);

                this._clearPanes();
                if (this._clearControlPos) {
                    this._clearControlPos();
                }
            },

            //_initPanes: function () {
            //    var panes = this._panes = {};
            //    this._mapPane = panes.mapPane = this._createPane('gba-map-pane', this._container);
            //},

            //_createPane: function (className, container) {
            //    //return domUtil.create('div', className, container || this._panes.objectsPane);
            //    return _dom.createDom("div", { "class": className }, container);
            //},

            _clearPanes: function () {
                this.container.removeChild(this.domElement);
            },

            _initControlPos: function () {
                //var test = document.getElementById("webgl");

                var corners = this._controlCorners = {};
                var l = 'gba-';
                var container = this._controlContainer =
                            //util.create('div', l + 'control-container', this.domElement);
                            dom.createDom("div", { "class": l + 'control-container' }, this.container);

                function createCorner(vSide, hSide) {
                    var className = l + vSide + ' ' + l + hSide;

                    //corners[vSide + hSide] = util.create('div', className, container);
                    corners[vSide + hSide] = dom.createDom("div", { "class": className }, container);
                }

                createCorner('top', 'left');
                createCorner('top', 'right');
                createCorner('bottom', 'left');
                createCorner('bottom', 'right');
            },

            _clearControlPos: function () {
                this.container.removeChild(this._controlContainer);
            },

            initControls: function () {
                this.helpMenuActions = {};
                this._controls = this._controls || {};

                this._controls.homeControl = (new HomeButton()).addTo(this);
                //zoom in; zoom out
                this._controls.zoomControl = (new MyZoom()).addTo(this);

                if (!util.hasTouch()) {
                    //show coordinates
                    this._controls.coordinates = new Coordinates({ camera: this.object, dataservice: this.dataservice }).addTo(this);
                }

                //slice on x and y axes:
                this._controls.slicer = new SlicerControl({ dataservice: this.dataservice }).addTo(this);

                this._controls.maptoolControl = new MaptoolControl().addTo(this);

                this._controls.boreholePopup = new BoreholePopup({});
                this._controls.boreholePopup.addTo(this);

            },

            initDatalayers: function () {
                var toload = 0, datalayer, seen = 0, self = this;
            },

            addLayer: function (layer) {
                var id = util.stamp(layer);
                if (this._layers[id]) {
                    return this;
                }
                this._layers[id] = layer;

                //layer._mapToAdd = this;
                layer.index = id;

                //if (layer.beforeAdd) {
                //    layer.beforeAdd(this);
                //}
                //this.whenReady(layer._layerAdd, layer);
                layer._layerAdd(this);
                this.emit("change");
                return this;
            },

            removeLayer: function (layer) {
                var id = util.stamp(layer);

                if (!this._layers[id]) { return this; }

                //if (this._loaded) {
                //    layer.onRemove(this);
                //}
                layer.onRemove(this);
                this.emit("change");
                //if (layer.getAttribution && this.attributionControl) {
                //    this.attributionControl.removeAttribution(layer.getAttribution());
                //}

                //if (layer.getEvents) {
                //    this.off(layer.getEvents(), layer);
                //}

                delete this._layers[id];

                //if (this._loaded) {
                //    this.emit('layerremove', { layer: layer });
                //    layer.emit('remove');
                //}

                layer._map = layer._mapToAdd = null;

                return this;
            },

            hasLayer: function (layer) {
                return !!layer && (util.stamp(layer) in this._layers);
            },

            eachLayer: function (method, context) {
                for (var i in this._layers) {
                    method.call(context, this._layers[i]);
                }
                return this;
            },

            getCenter: function () { // (Boolean) -> LatLng
                //this._checkIfLoaded();

                //if (this._lastCenter && !this._moved()) {
                //    return this._lastCenter;
                //}
                return this.target;
            }


        });

        return Map;

    });
