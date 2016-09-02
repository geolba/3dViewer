define("gba/maptools/Boretool",
["jquery", "three", "helper/Events", "gba/layer/Marker", "gba/layer/LayerGroup", "gba/tasks/BoreholeIdentify", "helper/utilities", "helper/domUtil"],
function ($, THREE, Events, Marker, LayerGroup, BoreholeIdentify, util, domUtil) {
    "use strict";
    //return Dataservice;

    var Boretool = Events.extend({

        //statische Klassenvriablen und Methoden:
        statics: {
            FORWARD: 1,
            BACKWARD: -1,

            //makeCancellable: function (e) {
            //    e.cancel = function () {
            //        e._cancelled = true;
            //    };
            //}
        },

        options: {
            zIndex: 1000,
            //polygonClass: L.Polygon,
            //polylineClass: L.Polyline,
            markerClass: Marker,//THREE.CylinderGeometry,
            //rectangleClass: L.Rectangle,
            //circleClass: L.Circle,
            drawingCSSClass: 'gba-editable-drawing',
            drawingCursor: 'crosshair'
        },

        init: function (map, options) {
            //L.setOptions(this, options);
            util.setOptions(this, options);
            this._lastZIndex = this.options.zIndex;
            this.map = map;
            //this.editLayer = this.createEditLayer();
            this.featuresLayer = this.createFeaturesLayer();
            //this.forwardLineGuide = this.createLineGuide();
            //this.backwardLineGuide = this.createLineGuide();

            this.map.mapTool = this;
            //this.on('editable:drawing:end', function () {
            //    if (this.enabled()) this.startMarker();
            //});

            var highlightMaterial = new THREE.MeshLambertMaterial({ emissive: 0x999900, transparent: true, opacity: 0.5 });
            this.drillTask = new BoreholeIdentify({
                camera: this.map.object,
                domElement: this.map.domElement,
                //layer: layer,
                highlightMaterial: highlightMaterial,
                layers: this.map.dataservice.layers
            });

        },

        //createFeaturesLayer: function () {
        //    //return this.options.featuresLayer || new L.LayerGroup().addTo(this.map);
        //    var boreholeMarker = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5, 2),
        //                                     new THREE.MeshLambertMaterial({ color: 0x38eeff, opacity: opt.o, transparent: (opt.o < 1) }));
        //    boreholeMarker.rotation.x = THREE.Math.degToRad(-90);
        //    boreholeMarker.visible = false;
        //    this.map.scene.add(boreholeMarker);
        //},

        createEditLayer: function () {
            return new LayerGroup().addTo(this.map);
        },
        createFeaturesLayer: function () {
            return  new LayerGroup().addTo(this.map);
        },

        blockEvents: function () {
            // Hack: force map not to listen to other layers events while drawing.
            //if (!this._oldTargets) {
            //this._oldTargets = this.map._events;
            //this.map._events = {};
            //}
            if (!this._oldClickTargets) {
                this._oldClickTargets = this.map._events.clicked;
                this.map._events.clicked = [];
            }
        },

        unblockEvents: function () {
            //if (this._oldTargets) {
            //    // Reset, but keep targets created while drawing.
            //    this.map._events = util.extend(this.map._events, this._oldTargets);
            //    delete this._oldTargets;
            //}
            if (this._oldClickTargets) {
                // Reset, but keep targets created while drawing.
                this.map._events.clicked = this.map._events.clicked.concat(this._oldClickTargets);
                delete this._oldClickTargets;
            }
        },

        fireAndForward: function (type, e) {
            e = e || {};
            e.mapTool = this;
            this.emit(type, e);
            this.map.emit(type, e);
        },

        registerForDrawing: function (editor) {
            if (this._drawingEditor) {
                this.unregisterForDrawing(this._drawingEditor);
            }
            //this.map.on('mousemove touchmove', editor.onDrawingMouseMove, editor);
            this.blockEvents();
            this._drawingEditor = editor;
            this.map.on('mousedown', this.onMousedown);
            this.map.on('clicked', this.onMouseup);
            domUtil.addClass(this.map.domElement, this.options.drawingCSSClass);
            this.defaultMapCursor = this.map.domElement.style.cursor;
            //this.map.domElement.style.cursor = this.options.drawingCursor;
            this.map.domElement.style.cursor = "crosshair";
            this.map.domElement.style.cursor = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAdCAMAAABRwYYcAAABPlBMVEUAAAC7u7vQ0NCTk5PU1NTr6+u6urpVVVXR0dEhISG8vLxISEjS0tL09PTo6OiEhISlpaX39/cAAABNTU2mpqZRUVH4+Phzc3NOTk75+fmBgYHu7u7CwsKdnZ1cXFzQ0NAvLy8FBQXb29v9/f0rKysJCQmFhYVlZWUyMjLa2tr///96enoMDAyJiYkXFxcZGRkLCwtZWVl/f38aGhqrq6vV1dXj4+N5eXnb29vd3d1FRUXR0dG5ubnQ0NCCgoKVlZWNjY1BQUHt7e0GBgYAAAC3t7ctLS2/v783NzcfHx/r6+uUlJSkpKQCAgKoqKh8fHyAgIAsLCynp6cHBwddXV0yMjIXFxfOzs4+Pj7g4OCioqITExOfn58BAQEbGxsxMTGTk5PPz8+QkJAICAi4uLjf39+zs7O+vr5LS0uLi4svZJaIAAAATHRSTlMA7uD+DN/YA9/Y/tjfye4Z9Mn+/vTuydj+yfTmFRULC+7+38nY/hUZ/uDJ2P7+C/7Y2BT+/tjJFeD8C+AL3/702O7f/gPu/hTY7uDuXbwlLQAAAKxJREFUeF6VzWVyAmEMBuCwuLu7lsW9uBWqK7i7tb3/BcjHDciPPJPJmwnUBb8KCQBQ/OXWtAOUTVLtSg9Qe8JNCdW5jiEACHDLYTSGDhZvSpyrHTZhRen1mCuoAcS7nwi5oxy9l38L+Zfj3zGvYk4GOeY8ZjacRb+nW2MbFc98bpJv/GleiXTrY24LAshG13wG993D3v+Jpr7YdPxxd2aSmPP2J8IiYIkqTux3Y8Yeb6YtyDkAAAAASUVORK5CYII=') 3 31, crosshair";
            //background-image:url(/content/img/drill.png);
        },

        unregisterForDrawing: function (editor) {
            this.unblockEvents();
            domUtil.removeClass(this.map.domElement, this.options.drawingCSSClass);
            this.map.domElement.style.cursor = this.defaultMapCursor;
            editor = editor || this._drawingEditor;
            if (!editor) return;
            //this.map.off('mousemove touchmove', editor.onDrawingMouseMove, editor);
            this.map.off('mousedown', this.onMousedown);
            this.map.off('clicked', this.onMouseup);
            if (editor !== this._drawingEditor) return;
            delete this._drawingEditor;
            //if (editor._drawing) {
            //    editor.cancelDrawing();
            //}
        },

        onMousedown: function (e) {
            //var canvasOffset = $(this.domElement).offset();
            //var xClickedOnCanvas = e.clientX - canvasOffset.left;
            //var yClickedonCanvas = e.clientY - canvasOffset.top;
            //var event = { x: xClickedOnCanvas, y: yClickedonCanvas };
            this.mapTool._mouseDown = e;
            this.mapTool._drawingEditor.onDrawingMouseDown(e);
        },

        onMouseup: function (e) {
            if (this.mapTool._mouseDown) {
                //var originPoint = new Point(this.mapTool._mouseDown.clientX, this.mapTool._mouseDown.clientY);
                //var endPoint = new Point(e.clientX, e.clientY);
                //var distance = endPoint.distanceTo(originPoint);
                //if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) this.mapTool._drawingEditor.onDrawingClick(e);
                //else this._drawingEditor.onDrawingMouseUp(e);
                this.mapTool._drawingEditor.onDrawingClick(this.mapTool._mouseDown);
            }
            this.mapTool._mouseDown = null;
        },

        connectCreatedToMap: function (layer) {
            return this.featuresLayer.addLayer(layer);
        },

        startMarker: function (latlng, options) {
            latlng = latlng || this.map.getCenter().clone();
            var marker = this.createMarker(latlng, options);//.addTo(this.map);
            //this.map.addLayer(marker);
            //marker.enableEdit(this.map).startDrawing(); //editor.startDrawing() -> registerForDrawing
            var editor = marker.enableEdit(this.map);
            editor.startDrawing();
            return marker;
        },
        createLayer: function (klass, latlngs, options) {
            options = util.extend({ editOptions: { mapTool: this } }, options);
            var layer = new klass(latlngs, options);
            //this.fireAndForward('editable:created', { layer: layer });
            return layer;
        },
        createMarker: function (latlng, options) {
            return this.createLayer(options && options.markerClass || this.options.markerClass, latlng, options);
        },


        toggle: function () {
            if (this.enabled()) {
                this.disable();
            }
            else {
                this.enable();
            }
        },

        enable: function () {
            //if (this.map.mapTool) this.map.mapTool.on('editable:drawing:start', this.disable.bind(this));
            domUtil.addClass(this.map.container, 'measure-enabled');
            //this.fireAndForward('showmeasure');
            this.startMarker();
        },

        disable: function () {
            //if (this.map.mapTool) this.map.mapTool.off('editable:drawing:start', this.disable.bind(this));
            domUtil.removeClass(this.map.container, 'measure-enabled');
            this.featuresLayer.clearLayers();
            //this.fireAndForward('hidemeasure');
            if (this._drawingEditor){
                this._drawingEditor.cancelDrawing();
            }
        },

        enabled: function () {
            return domUtil.hasClass(this.map.container, 'measure-enabled');
        },

        getMeasureUnit: function () {
            return document.querySelector('input[name=unit]:checked').value;
        }


    });

    return Boretool;


});