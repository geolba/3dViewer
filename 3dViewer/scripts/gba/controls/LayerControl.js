define('gba/controls/LayerControl', [
    "lib/leaflet/Control", "jquery", "helper/logger", "i18n!nls/template", "helper/utilities", "helper/dom", "helper/domEvent"
],
function (Control, $, logger, N, util, dom, domEvent) {
    'use strict';

    var LayerControl = Control.extend({

        // default options
        options: {
            collapsed: true,
            position: 'topright',
            autoZIndex: true
        },

        //constructor:
        init: function (baseLayers,overlays, options) {
            // mix in settings and default options           
            util.setOptions(this, options);

            this._layers = {};
            this._lastZIndex = 0;
            this._handlingClick = false;
            //for (var i in baseLayers) {
            //    this._addLayer(baseLayers[i], i);
            //}
            for (var i in overlays) {
                this._addLayer(overlays[i], overlays[i].name, true);
            }
        },

        onAdd: function (map) {
            this._initLayout();
            this._update();

            //map
            //    .on('layeradd', this._onLayerChange, this)
            //    .on('layerremove', this._onLayerChange, this);

            return this._container;
        },

        onRemove: function (map) {
            //map
            //    .off('layeradd', this._onLayerChange, this)
            //    .off('layerremove', this._onLayerChange, this);
        },

        _addLayer: function (layer, name, overlay) {
            var id = util.stamp(layer);

            this._layers[id] = {
                layer: layer,
                name: layer.name,
                overlay: overlay
            };
            //if (this.options.autoZIndex && layer.setZIndex) {
            //    this._lastZIndex++;
            //    layer.setZIndex(this._lastZIndex);
            //}
        },        

        _initLayout: function () {
            var className = 'gba-controllayers';
            var container = this._container = dom.createDom("div", { "class": className });
           
            domEvent.on(container, 'click', domEvent.stopPropagation);

            var layerContainer = this._layerContainer = dom.createDom('div', { "class": className + '-container' }, this._container);

            if (this.options.collapsed) {              
                domEvent
                     .on(this._container, 'mouseenter', this._expand, this)
                     .on(this._container, 'mouseleave', this._collapse, this);

                ///////////////// der eigentliche Button
                this._layersLink = dom.createDom("span", { "class": className + "-toggle", title: 'Layers' }, this._container);

                domEvent.on(this._layersLink, 'focus', this._expand, this);
            }
            else {
                this._expand();
            }

            this._baseLayersList = dom.createDom('div', { "class": className + '-base' }, layerContainer);
            this._separator = dom.createDom('div', { "class": className + '-separator' }, layerContainer);
            //this._overlaysList = dom.createDom('div', { "class": className + '-overlays' }, layerContainer);
            var overlayTable = dom.createDom("table", { cellpadding: 0, cellspacing: 0, width: "95%", "class": className + '-overlays' }, layerContainer);
            this._overlaysList = dom.createDom("tbody", {}, overlayTable);

        },

        _update: function () {
            if (!this._container) {
                return;
            }

            this._baseLayersList.innerHTML = '';
            this._overlaysList.innerHTML = '';

            var baseLayersPresent = false;
            var overlaysPresent = false;
            var i, obj;

            for (i in this._layers) {
                obj = this._layers[i];
                this._addItem2(obj);
                //this._addOpacitySlider(obj);
                overlaysPresent = overlaysPresent || obj.overlay;
                baseLayersPresent = baseLayersPresent || !obj.overlay;
            }
            this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
        },

        _addItem2: function (obj) {
            var checked = obj.layer.visible;//this._map.hasLayer(obj.layer);
            var container = obj.overlay ? this._overlaysList : this._baseLayersList;
            //container.appendChild(legendEntryRow);

            var legendEntryRow = dom.createDom("tr", { style: "display: row-table; height: 20px;" }, container);
            //domStyle.set(legendEntryRow, 'display', rowVisibility);
            //dom.setProperties(legendEntryRow, { style: "display: row-table;" });
            var chkDataCell = dom.createDom("td", { "class": "checkboxFive" }, legendEntryRow);
            var lblDataCell = dom.createDom("td", {}, legendEntryRow);
         

            var input = dom.createDom("input", { type: 'checkbox', checked: checked, id: util.stamp(obj.layer) }, chkDataCell);
            input.layerId = util.stamp(obj.layer);
            domEvent.on(input, 'click', function () { this._onInputClick(util.stamp(obj.layer)); }, this);
            var chkLabel = dom.createDom("label", { for: util.stamp(obj.layer) }, chkDataCell);

            //var span = dom.createDom("span", { innerHTML: " " + obj.name }, lblDataCell);
            //legend entry label
            var _table = dom.createDom("table", { width: "95%", dir: "ltr" }, lblDataCell);
            var _tbody = dom.createDom("tbody", {}, _table);
            var _tr = dom.createDom("tr", {}, _tbody);           
            var _td = dom.createDom("td", { innerHTML: obj.name, align: this.alignRight ? "right" : "left" }, _tr);



          
            return legendEntryRow;

        },

        //_addOpacitySlider: function (obj) {
         
        //    var container = obj.overlay ? this._overlaysList : this._baseLayersList;
        //    //container.appendChild(legendEntryRow);

        //    var legendEntryRow = dom.createDom("tr", { style: "display: row-table; height: 20px;" }, container);          
        //    var sliderDataCell = dom.createDom("td", {}, legendEntryRow);

          
        //    var slider = dom.createDom('input', { "class": 'gba-slider' }, sliderDataCell);
        //    //if (this.options.orientation === 'vertical') { this.slider.setAttribute("orient", "vertical"); }
        //    //this.slider.setAttribute("title", this.options.title);
        //    slider.setAttribute("id", util.stamp(obj.layer));
        //    slider.layerId = util.stamp(obj.layer);
        //    slider.setAttribute("type", "range");
        //    slider.setAttribute("min", 0);
        //    slider.setAttribute("max",1);
        //    slider.setAttribute("step", 0.1);
        //    slider.setAttribute("value", obj.layer.opacity);



          
        //    return legendEntryRow;

        //},

        _addItem: function (obj) {
            //var label = document.createElement('label');
            //label.htmlFor = util.stamp(obj.layer);

            var chkLabel = dom.createDom("label", { for: util.stamp(obj.layer) });           
         
            var input;
            var checked = obj.layer.visible;//this._map.hasLayer(obj.layer);

            if (obj.overlay) {             
                input = dom.createDom("input", { type: 'checkbox', checked: checked, id: util.stamp(obj.layer), 'className': 'gba-controllayers-selector' }, chkLabel);
                input.layerId = util.stamp(obj.layer);
            }
            else {
                input = util.createRadioElement('gba-base-layers', checked);
            }
           

            //input.layerId = util.stamp(obj.layer);
            domEvent.on(input, 'click', this._onInputClick, this);

            var name = document.createElement('span');
            name.innerHTML = ' ' + obj.name;

            //label.appendChild(input);
            chkLabel.appendChild(name);

            var container = obj.overlay ? this._overlaysList : this._baseLayersList;
            container.appendChild(chkLabel);

            return chkLabel;
        },

        _onInputClick: function (layerId) {
            var i, input, obj,
                inputs = this._layerContainer.getElementsByTagName('input'),
                inputsLen = inputs.length;

            this._handlingClick = true;

            for (i = 0; i < inputsLen; i++) {
                input = inputs[i];
                if (input.type == 'checkbox' && layerId === input.layerId) {
                    obj = this._layers[input.layerId];
                    var isChecked = input.checked;
                    obj.layer.setVisible(isChecked);                  
                }
            }
          

            this._handlingClick = false;
            this._map.update();
            //this._refocusOnMap();
        },

        _expand: function () {          
            this._container.classList.add("gba-controllayers-expanded");
        },

        _collapse: function () {          
            this._container.classList.remove("gba-controllayers-expanded");
        }


    });

    return LayerControl;
});