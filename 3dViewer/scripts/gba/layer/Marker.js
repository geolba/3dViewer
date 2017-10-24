//robert.cibula@geology.sk
define('gba/layer/Marker', ['three',
    "gba/layer/Layer",
    "gba/layer/BaseEditor",
    "helper/utilities"], function (THREE, Layer, BaseEditor, util) {
        "use strict";



        var Marker = Layer.extend({

            createEditor: function (map) {
                map = map || this._map;
                var Klass = this.options.editorClass || this.getEditorClass(map);
                return new Klass(map, this, this.options.editOptions);
            },
            enableEdit: function (map) {
                if (!this.editor) {
                    this.createEditor(map);
                }
                return this.editor.enable();
            },
            getEditorClass: function (map) {
                return BaseEditor;
            },

            options: {
                pane: 'markerPane',
                nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],
                //icon: new L.Icon.Default(),         
                opacity: 1,
                clickable: true,
            },

            init: function (latlng, options) {
                util.setOptions(this, options);
                this._latlng = latlng;

            },
            onAdd: function (map) {
                //this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

                this._initIcon();
                this.update();
                this.emit('add');
            },
            onRemove: function () {
                //if (this.dragging && this.dragging.enabled()) {
                //    this.options.draggable = true;
                //    this.dragging.removeHooks();
                //}

                this._removeIcon();
                //this._removeShadow();
                this.emit('remove');
                this._map = null;
            },

            update: function () {

                if (this._icon) {
                    var pos = this._latlng;
                    this._setPos(pos);
                }
                this._map.emit("change");
                return this;
            },
            getElement: function () {
                return this._icon;
            },

            _initIcon: function () {

                //create default icon
                var opt = { r: 0.25, c: 0xffff00, o: 0.8 };
                var icon = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5, 2),
                                                 new THREE.MeshLambertMaterial({ color: 0x38eeff, opacity: opt.o, transparent: (opt.o < 1) }));
                icon.rotation.x = THREE.Math.degToRad(-90);
                icon.visible = true;
                //app.scene.add(app.boreholeMarker);
                var addIcon = false;

                // if we're not reusing the icon, remove the old one and init new one
                if (icon !== this._icon) {
                    if (this._icon) {
                        this._removeIcon();
                    }
                    addIcon = true;

                    //if (options.title) {
                    //    icon.title = options.title;
                    //}
                    //if (options.alt) {
                    //    icon.alt = options.alt;
                    //}
                }
                this._icon = icon;

                //this._initInteraction();

                if (addIcon === true) {
                    this.getPane().add(this._icon);
                }
            },

            _removeIcon: function () {
                //if (this.options.riseOnHover) {
                //    this.off({
                //        mouseover: this._bringToFront,
                //        mouseout: this._resetZIndex
                //    });
                //}

                //L.DomUtil.remove(this._icon);
                this.getPane().remove(this._icon);
                //this.removeInteractiveTarget(this._icon);

                this._icon = null;
            },

            _setPos: function (pos) {
                //L.DomUtil.setPosition(this._icon, pos);
                this._icon.position.set(pos.x, pos.y, pos.z);

            },
            setLatLng: function (latlng) {
                this._latlng = latlng;

                this.update();
            }

            //_initInteraction: function () {
            //    var icon = this._icon;
            ////events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

            //    //domUtil.addClass(icon, 'leaflet-clickable');
            //    domEvent.on(icon, 'click', this._onMouseClick, this);
            //},
            //_onMouseClick: function (e) {         

            //    this.emit(e.type, {
            //        originalEvent: e,
            //        latlng: this._latlng
            //    });
            //},


        });
        return Marker;


    });