define('gba/controls/MaptoolControl', [
    "lib/leaflet/Control", "i18n!nls/template", "helper/utilities", "helper/dom", "helper/domEvent", "gba/maptools/Boretool"
],
function (Control, N, util, dom, domEvent, Boretool) {
    'use strict';

    var MaptoolControl = Control.extend({
        //options: {
        //    position: 'topleft'
        //},

        addUnit: function (container, value, short, long, selected) {
           
            var input = dom.createDom("input", {
                type: "radio", id: value, name: "unit", value: value
            }, container);       
            if (selected) {
                input.checked = 'checked';
            }
           
            dom.createDom("label", {
                innerHTML: short, title: long, for: value
            }, container);
        },

        onAdd: function (map) {
            this.map = map;

            var b = this._nls = util.mixin({}, N.widgets.boreholetool);

            this._container = dom.createDom("div", { "class": 'gba-maptool-control gba-control' });

            //new L.Measurable(map);
            var mapTool = new Boretool(this.map);

            //var inputDiv = dom.createDom("div", { id: "radio" }, this._container);
            //this.addUnit(inputDiv, 'km', 'km', 'kilometers', true);
            //this.addUnit(inputDiv, 'mi', 'mi', 'miles');
            ////this.addUnit(inputDiv, 'nm', 'NM', 'nautical miles');

            var toggle = dom.createDom('a', { "class": "gba-maptool-toggle", href: "#", title: b.title }, this._container);
          
           //domEvent.disableClickPropagation(this._container);
            domEvent
                .on(toggle, 'click', domEvent.stop)
                .on(toggle, 'click', domEvent.preventDefault)
                .on(toggle, 'click', this.map.mapTool.toggle, mapTool);

            return this._container;
        }

    });

    return MaptoolControl;
});