
define('gba/layer/Layer', ["helper/Events", "gba/controls/BoreholePopup",  "helper/utilities",], function (Events, BoreholePopup, util) {
    "use strict"; 
   
    


    var Layer = Events.extend({

        options: {
            pane: 'overlayPane',
            nonBubblingEvents: []  // Array of events that should not be bubbled to DOM parents (like the map)
        },

        addTo: function (map) {
            map.addLayer(this);
            return this;
        },

        remove: function () {
            return this.removeFrom(this._map || this._mapToAdd);
        },

        removeFrom: function (obj) {
            if (obj) {
                obj.removeLayer(this);
            }
            return this;
        },

        getPane: function () {
            return this._map.scene;
        },

        _layerAdd: function (e) {
            var map = e;//.target;

            // check in case layer gets added and then removed before the map is ready
            if (!map.hasLayer(this)) { return; }

            this._map = map;
            //this._zoomAnimated = map._zoomAnimated;

            //if (this.getEvents) {
            //    map.on(this.getEvents(), this);
            //}

            this.onAdd(map);

            //if (this.getAttribution && this._map.attributionControl) {
            //    this._map.attributionControl.addAttribution(this.getAttribution());
            //}
            //this.fire('add');
            //map.fire('layeradd', { layer: this });
        },

        
        // @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
        // Binds a popup to the layer with the passed `content` and sets up the
        // neccessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindPopup: function (content) {

            if (content instanceof BoreholePopup) {
                //util.setOptions(content, options);
                this._popup = content;
                content._source = this;
            }         

                if (!this._popup) {
                    //this._popup = new L.Popup(options, this);
                    this._popup = new BoreholePopup({ }, this);
                    this._popup.addTo(this._map);
                    this._popup.setChartContent(content);
                }
               
            

            if (!this._popupHandlersAdded) {
                this.on("click", this.openPopup, this); //remove: this.closePopup  //move: this._movePopup
                this.on('remove', this.closePopup, this);
                this._popupHandlersAdded = true;
            }

            //// save the originally passed offset
            //this._originalPopupOffset = this._popup.options.offset;

            return this;
        },
        setPopupChartData: function(content){
            this._popup.setChartContent(content);
        },
        openPopup: function () {
            this._popup.show();
        },
        // @method closePopup(): this
        // Closes the popup bound to this layer if it is open.
        closePopup: function () {
            if (this._popup) {
                this._popup._close();
                //this._popup.removeFrom(this._map);
            }
            return this;
        },

    });
    return Layer;


});