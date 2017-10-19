define('gba/controls/ControlButton', [
    'helper/Events', "jquery", "helper/utilities", "helper/dom", "helper/domEvent"
],
function (Events, $, util, dom, domEvent) {
    'use strict';
    var ControlButton = Events.extend({

        options: {
            position: 'topright',
        },

        getPosition: function () {
            return this.options.position;
        },

        //constructor:
        init: function (params) {
            // mix in settings and defaults
            //util.mixin(this.options, params);    
            //for (var k in params) {
            //    this.options[k] = params[k];
            //}
            util.setOptions(this, params);
            //var test = "test";
        },

        addTo: function (map) {
            this._map = map;

            var container = this._container = this.onAdd(map);
            var pos = this.getPosition();//"topright"
            var corner = map._controlCorners[pos];

            $(container).addClass('gba-control');

            if (pos.indexOf('bottom') !== -1) {
                corner.insertBefore(container, corner.firstChild);
            }
            else {
                corner.appendChild(container);
            }

            return this;
        },

        onAdd: function (map) {
            //this._map = map;
            var className = this.options.className;

            var container = this._container = dom.createDom("div", { "class": className });
            this._button = this._createButton(
                    //this.options.zoomInText, this.options.zoomInTitle,
                    this.options.innerHtml ? this.options.innerHtml : "", this.options.zoomInTitle,
                    className + '-in', container, this._zoomIn, this);

            return this._container;
        },

        _createButton: function (html, title, className, container, fn, context) {

            var link = dom.createDom("span", { "class": className, innerHTML: html, title: title }, container);
            var stop = domEvent.stopPropagation;
            domEvent
                .on(link, 'click', stop)
                .on(link, 'mousedown', stop)
                .on(link, 'dblclick', stop)
                .on(link, 'click', domEvent.preventDefault)
                .on(link, 'click', this._fireClick, this);
            //link.addEventListener("click", fn.bind(this), false);
            return link;
        },

        _fireClick: function (e) {
            this.emit('click');
        },


    });


    return ControlButton;
});