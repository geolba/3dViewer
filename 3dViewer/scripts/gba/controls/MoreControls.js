// Filename: MoreControls.js 
define('gba/controls/MoreControls', [     
    "lib/leaflet/Control",
    "helper/utilities",
    "helper/dom",
    "i18n!nls/template",
    "helper/domEvent",
    "helper/domUtil"
], function (Control, util, dom, N, domEvent, domUtil) {
    "use strict";
   


    var MoreControls = Control.extend({

        options: {
            position: 'topright'
        },

        onAdd: function () {
            var b = this._nls = util.mixin({}, N.widgets.more);

            var container = dom.createDom("div", { });//L.DomUtil.create('div', '');
            //var more = L.DomUtil.create('a', 'gba-control-more gba-control-text', container);
            var more = dom.createDom("a",
                { "class": "gba-control-more gba-control-text", innerHTML: b.moreButton, title: b.moreInfo }, container);
            more.href = '#';               
            domEvent
                .on(more, 'click', domEvent.stop)
                .on(more, 'click', this.toggle, this);


            //var less = L.DomUtil.create('a', 'gba-control-less gba-control-text', container);
            var less = dom.createDom("a",
              { "class": "gba-control-less gba-control-text", innerHTML: b.lessButton, title: b.lessInfo }, container);
            less.href = '#';           

            domEvent
                .on(less, 'click', domEvent.stop)
                .on(less, 'click', this.toggle, this);

            return container;
        },

        toggle: function () {
            var pos = this.getPosition();
            var corner = this._map._controlCorners[pos];
            var className = 'gba-more-controls';
            if (domUtil.hasClass(corner, className)) {
                domUtil.removeClass(corner, className);
                //corner.classList.remove(className);
            } else {
                domUtil.addClass(corner, className);
                //corner.classList.add(className);
            }
        }

    });
    return MoreControls;

});