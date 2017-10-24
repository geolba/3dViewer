// Filename: BaseEditor.js 
define('gba/layer/BaseEditor', ["lib/leaflet/Class", "gba/layer/LayerGroup", "helper/utilities"],
    function (Class, LayerGroup, util) {
        "use strict";

        var Editable = {

            makeCancellable: function (e) {
                e.cancel = function () {
                    e._cancelled = true;
                };
            }
        };
        var BaseEditor = Class.extend({

            init: function (map, feature, options) {
                util.setOptions(this, options);
                this.map = map;
                this.marker = feature;
                this.marker.editor = this;
                //this.editLayer = new LayerGroup();
                this.mapTool = map.mapTool; //this.options.editTools || map.mapTool;

                this.marker.bindPopup(map._controls.boreholePopup);
            },
            enable: function () {
                if (this._enabled) return this;
                //if (this.isConnected() == true) {
                //    this.mapTool.editLayer.addLayer(this.editLayer);
                //}
                this.onEnable();
                this._enabled = true;
                this.marker.on('remove', this.disable.bind(this));
                return this;
            },

            disable: function () {
                this.marker.off('remove', this.disable.bind(this));
                //this.editLayer.clearLayers();
                //this.mapTool.editLayer.removeLayer(this.editLayer);
                this.onDisable();
                delete this._enabled;
                if (this._drawing) this.cancelDrawing();
                return this;
            },
            isConnected: function () {
                return this.map.hasLayer(this.marker);
            },

            drawing: function () {
                return !!this._drawing;
            },

            fireAndForward: function (type, e) {
                e = e || {};
                e.layer = this.marker;
                this.marker.emit(type, e);
                this.mapTool.fireAndForward(type, e);
            },

            onEnable: function () {
                this.fireAndForward('editable:enable');
            },

            onDisable: function () {
                this.fireAndForward('editable:disable');
            },

            onEditing: function () {
                this.fireAndForward('editable:editing');
            },




            onDrawingMouseDown: function (e) {
                this.fireAndForward('editable:drawing:mousedown', e);
            },

            onDrawingMouseUp: function (e) {
                this.fireAndForward('editable:drawing:mouseup', e);
            },

            startDrawing: function () {
                if (!this._drawing) {
                    this._drawing = 1;// L.Editable.FORWARD;
                }
                this.mapTool.registerForDrawing(this);
                this.onStartDrawing();
            },

            onStartDrawing: function () {
                this.fireAndForward('editable:drawing:start');
            },

            onDrawingClick: function (e) {
                if (!this.drawing) return;
                Editable.makeCancellable(e);
                this.fireAndForward('editable:drawing:click', e);
                if (e._cancelled) return;
                //if (!this.isConnected()) {
                //    this.connect(e);
                //}
                var dxfIdentifyParams = {};
                dxfIdentifyParams.clientX = e.clientX;
                dxfIdentifyParams.clientY = e.clientY;
                dxfIdentifyParams.width = this.map.container.clientWidth;
                dxfIdentifyParams.height = this.map.container.clientHeight;
                var deferred = this.mapTool.drillTask.execute(dxfIdentifyParams);
                deferred.then(this.handleQueryResults3.bind(this));

                this.processDrawingClick(e);
            },
            handleQueryResults3: function () {
                var results = arguments;
                //var content = [];
                var features = results[0].features;
                var aufschlag = results[0].aufschlag;
                if (!this.isConnected()) {
                    this.connect(aufschlag);
                }
                else {
                    this.marker.setLatLng(aufschlag);
                }
                //// query marker
                //app.boreholeMarker.position.set(aufschlag.x, aufschlag.y, aufschlag.z);
                //app.boreholeMarker.visible = true;
                //app.boreholeMarker.updateMatrixWorld();
                var data = [];
                for (var j = features.length - 1; j >= 0; j--) {
                    var feature = features[j];
                    var point = feature.point;
                    // clicked coordinates: skalierung wieder wegrechnen:
                    var pt = this.map.dataservice.toMapCoordinates(point.x, point.y, point.z);

                    var layerId = feature.layerId;
                    //var layer = this.map.dataservice.layers[layerId];
                    var layer = this.map._layers[layerId];
                    var nextPoint;
                    if (j !== features.length - 1) {
                        var previousPoint = { x: features[j + 1].point.x, y: features[j + 1].point.y, z: features[j + 1].point.z };
                        var previousPt = this.map.dataservice.toMapCoordinates(previousPoint.x, previousPoint.y, previousPoint.z);

                        //var barHeight = point.z - previousPoint.z;

                        var realHeight = pt.z - previousPt.z;
                        //var dist = parseInt((300 / 6000) * realHeight);

                        data.push({
                            dist: realHeight,//dist,
                            max: pt.z,
                            min: previousPt.z,
                            color: layer.materialParameter[0].color,
                            name: layer.name
                        });
                        //app.barChart.addBar(dist, layer.materialParameter[0].color, layer.name);
                    }
                }
                //this.marker.bindPopup(data);
                this.marker.setPopupChartData(data);
                this.marker.openPopup();




            },

            connect: function (e) {
                // On touch, the latlng has not been updated because there is
                // no mousemove.
                if (e) this.marker._latlng = { x: e.x, y: e.y, z: e.z }; //e.latlng;
                //this.marker.update();

                //L.Editable.BaseEditor.prototype.connect.call(this, e);
                this.mapTool.connectCreatedToMap(this.marker);
                //this.mapTool.editLayer.addLayer(this.editLayer);
            },
            processDrawingClick: function (e) {
                this.fireAndForward('editable:drawing:clicked', e);
                this.commitDrawing(e);
            },
            commitDrawing: function (e) {
                this.onCommitDrawing(e);
                //this.endDrawing();
            },
            onCommitDrawing: function (e) {
                this.fireAndForward('editable:drawing:commit', e);
            },
            endDrawing: function () {
                this._drawing = false;
                this.mapTool.unregisterForDrawing(this);
                this.onEndDrawing();
            },
            onEndDrawing: function () {
                this.fireAndForward('editable:drawing:end');
            },


            cancelDrawing: function () {
                this.onCancelDrawing();
                this.endDrawing();
            },
            onCancelDrawing: function () {
                this.fireAndForward('editable:drawing:cancel');
            }


        });

        return BaseEditor;

    });