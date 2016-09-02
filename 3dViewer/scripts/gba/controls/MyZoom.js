define('gba/controls/MyZoom',[
    "lib/leaflet/Control", "helper/dom", "helper/domEvent", "jquery", "helper/utilities", "i18n!nls/template"
], 
function (
   Control, dom, domEvent, $, util, N
) {
    var MyZoom = Control.extend({

        options: {
            position: 'topright',
            zoomInText: '+',
            zoomInTitle: 'Zoom in',
            zoomOutText: '-',
            zoomOutTitle: 'Zoom out'
        },

        onAdd: function (map) {
            var b = this._nls = util.mixin({}, N.widgets.zoom);
            //var zoomName = 'leaflet-control-zoom',
            var className = 'gba-control-zoom';
            //var container = L.DomUtil.create('div', className);
            var container = dom.createDom("div", { "class": className });

            //container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

            this._map = map;

            this._zoomInButton = this._createButton(
                    //this.options.zoomInText, this.options.zoomInTitle,
                    "", b.zoomInTitle,
                    className + '-in', container, this._zoomIn, this);
            this._zoomOutButton = this._createButton(
                    //this.options.zoomOutText, this.options.zoomOutTitle,
                    "", b.zoomOutTitle,
                    className + '-out', container, this._zoomOut, this);

            this._updateDisabled();
            //map.on('zoomend zoomlevelschange', this._updateDisabled, this);

            return container;
        },

        //onRemove: function (map) {
        //    map.off('zoomend zoomlevelschange', this._updateDisabled, this);
        //},

        _zoomIn: function (e) {
            //this._map.zoomIn(e.shiftKey ? 3 : 1);
            this._map.dollyOut();           
        },

        _zoomOut: function (e) {
            //this._map.zoomOut(e.shiftKey ? 3 : 1);
            this._map.dollyIn();
        },

        _createButton: function (html, title, className, container, fn, context) {
            //var link = L.DomUtil.create('a', className, container);
            var link = dom.createDom("span", { "class": className, innerHTML: html, title: title }, container);  

            //var stop = L.DomEvent.stopPropagation;
            //L.DomEvent
            //    .on(link, 'click', stop)
            //    .on(link, 'mousedown', stop)
            //    .on(link, 'dblclick', stop)
            //    .on(link, 'click', L.DomEvent.preventDefault)
            //    .on(link, 'click', fn, context)
            //    .on(link, 'click', this._refocusOnMap, context);

            var stop = domEvent.stopPropagation;
            domEvent
                .on(link, 'click', stop)
                .on(link, 'mousedown', stop)
                .on(link, 'dblclick', stop)
                .on(link, 'click', domEvent.preventDefault)
                .on(link, 'click', fn, this);
            //link.addEventListener("click", fn.bind(this), false);

            return link;
        },

        _updateDisabled: function () {
            var map = this._map;
            var className = 'leaflet-disabled';

            //L.DomUtil.removeClass(this._zoomInButton, className);
            $(this._zoomInButton).removeClass(className);
            //L.DomUtil.removeClass(this._zoomOutButton, className);
            $(this._zoomOutButton).removeClass(className);

            //if (map._zoom === map.getMinZoom()) {
            //    L.DomUtil.addClass(this._zoomOutButton, className);
            //}
            //if (map._zoom === map.getMaxZoom()) {
            //    L.DomUtil.addClass(this._zoomInButton, className);
            //}
        }

    });

    return MyZoom;
});