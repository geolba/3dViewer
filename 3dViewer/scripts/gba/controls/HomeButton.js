define('gba/controls/HomeButton', [
    "lib/leaflet/Control", "jquery", "helper/logger", "i18n!nls/template", "helper/utilities", "helper/dom", "helper/domEvent"
],
function (Control, $, logger, N, util, dom, domEvent) {
    'use strict';
    var HomeButton = Control.extend({

        // default options
        options: {
            position: 'topright',
            homeText: '+',
            //homeTitle: 'Home Extent',
            visible: true
        },

        //constructor:
        init: function (options) {
            // mix in settings and defaults
            //util.mixin(this.options, options);
            util.setOptions(this, options);

            // properties     
            this.map = {};
            this.visible = this.options.visible;
            this.home = this.options.home;
        },

        // happens after added to map
        onAdd: function (map) {
            if (!this.map) {
                //self.destroy();
                logger.warning('HomeButton::map required', true);
                return;
            }
            this.map = map;
            //this.options.home.initialZoom = map.options.zoom;
            //this.options.home.initialCenter = map.options.center;
            var b = this._nls = util.mixin({}, N.widgets.home);

            var className = 'gba-control-home';
            // Create sidebar container
            //var container = this._container = L.DomUtil.create('div', className);
            var container = this._container = dom.createDom("div", { "class": className });
            //if (this.options.home) {
            this._homeButton = this._createButton(
                    //this.options.zoomInText, this.options.zoomInTitle,
                    "", b.title,
                    className + '-do', container, this._goHome, this);
            this._init();
            //}

            //this._updateDisabled();
            //map.on('zoomend zoomlevelschange', this._updateDisabled, this);
            return container;
        },

        _init: function () {
            // show or hide widget
            this._visible();

            ////// if no extent set, set extent to map extent
            //if (!this.home) {
            //    this.home = this.map.getBounds();
            //}

            //// widget is now loaded
            this.loaded = true;
        },

        _visible: function () {
            if (this.visible === true) {
                //domStyle.set(self.domNode, 'display', 'block');
                $(this._container).css('display', 'block');
                //$('#test55').show();
            }
            else {
                //domStyle.set(self.domNode, 'display', 'none');
                $(this._container).css('display', 'none');
                //$('#test55').hide();
            }
        },

        _goHome: function () {
            //this._map.zoomIn(e.shiftKey ? 3 : 1);
            this._exitFired = false;
          
                //var bounds = L.latLngBounds(this.options.home._southWest, this.options.home._northEast);
            //this.map.fitBounds(bounds);
            this.map.reset();          
        },


        _createButton: function (html, title, className, container, fn, context) {
            //var link = L.DomUtil.create('a', className, container);
            var link = dom.createDom("span", { "class": className, innerHTML: html, title: title }, container);    

            var stop = domEvent.stopPropagation;
            domEvent
                .on(link, 'click', stop)
                .on(link, 'mousedown', stop)
                .on(link, 'dblclick', stop)
                .on(link, 'click', domEvent.preventDefault)
                //.on(link, 'click', fn.bind(this));
                .on(link, 'click', fn, context);
            //link.addEventListener("click", fn.bind(this), false);

            return link;
        }

    });

    return HomeButton;
});