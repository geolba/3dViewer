define('gba/controls/BorderControl', [
    "lib/leaflet/Control", "i18n!nls/template", "helper/utilities", "helper/dom", "helper/domEvent", "helper/domUtil"
],
function (Control, N, util, dom, domEvent, domUtil) {
    'use strict';

    var BorderControl = Control.extend({

        // default options
        options: {            
            position: 'topright'
        },

        //constructor:
        init: function (layers, options) {
            // mix in settings and default options           
            util.setOptions(this, options);

            this._layers = {};
            this.border = false;
            //for (var i in layers) {
            //    this._addLayer(layers[i], layers[i].name);
            //}
            
        },

        // happens after added to map
        onAdd: function (map) {           
            this.map = map;
            //this.options.home.initialZoom = map.options.zoom;
            //this.options.home.initialCenter = map.options.center;
            var b = this._nls = util.mixin({}, N.widgets.border);

            var className = 'gba-control-border';
            // Create sidebar container
            //var container = this._container = L.DomUtil.create('div', className);
            var container = this._container = dom.createDom("div", { "class": className + " gba-border-show" });
            //if (this.options.home) {
            this._schowBorderButton = this._createButton("", b.showBorder, 'gba-control-showborder', container, this._showBorder, this);

            this._hideBorderButton = this._createButton("", b.hideBorder, 'gba-control-hideborder', container, this._hideBorder, this);
         
            var lastDxfLayerIndex = this.map.dataservice.layers.length - 2;//BasementLayer
            this.map.dataservice.layers[lastDxfLayerIndex].on('border-change', this.toggle, this);
            return container;
        },

        _showBorder: function () {
                     
            //this.map.dataservice.layers[1].toggleBorderVisible(true);
            //this.map.dataservice.layers[2].toggleBorderVisible(true);
            //this.map.dataservice.layers[3].toggleBorderVisible(true);
            //this.map.dataservice.layers[4].toggleBorderVisible(true);
            //this.map.dataservice.layers[5].toggleBorderVisible(true);
            //this.map.dataservice.layers[6].toggleBorderVisible(true);
            for (var j = 1; j < this.map.dataservice.layers.length - 1; j++) {
                var layer = this.map.dataservice.layers[j];
                layer.toggleBorderVisible(true);
            }           
            this.map.update();
           

            //if (this.border === false) {
              
            //    var loadingDiv = util.setLoading("webgl");
            //    var self = this;

            //    if (typeof (Worker) !== "undefined") { //build the border asynchron
            //        var work1 = self.map.dataservice.layers[1].asyncBuildBorder(true);
            //        var work2 = self.map.dataservice.layers[2].asyncBuildBorder(true);
            //        var work3 = self.map.dataservice.layers[3].asyncBuildBorder(true);
            //        var work4 = self.map.dataservice.layers[4].asyncBuildBorder(true);
            //        var work5 = self.map.dataservice.layers[5].asyncBuildBorder(true);
            //        var work6 = self.map.dataservice.layers[6].asyncBuildBorder(false);

            //        $.when(work1, work2, work3, work4, work5, work6).then(function (result1, result2, result3, result4, result5, result6) {
            //            //success - do something with result1 and result2
            //            self.border = true;
            //            util.unsetLoading("webgl");
            //            self.toggle();
            //            self.map.update();
            //        }).fail(function (event) {
            //            //exception occurred! look at the event argument.
            //            util.unsetLoading("webgl");
            //        });
            //    }
            //    else { //build the border sychron
            //        setTimeout(function () {
            //            self.map.dataservice.layers[1].buildTriangleBorder();
            //            self.map.dataservice.layers[2].buildTriangleBorder();
            //            self.map.dataservice.layers[3].buildTriangleBorder();
            //            self.map.dataservice.layers[4].buildTriangleBorder();
            //            self.map.dataservice.layers[5].buildTriangleBorder();
            //            self.map.dataservice.layers[6].buildTriangleBorder2();

            //            util.unsetLoading("webgl");    
            //            self.toggle();
            //            self.map.update();
            //        },1000) ;
            //    }
            //}
            //else { //if border is already built
            //    this.map.dataservice.layers[1].toggleBorderVisible(true);
            //    this.map.dataservice.layers[2].toggleBorderVisible(true);
            //    this.map.dataservice.layers[3].toggleBorderVisible(true);
            //    this.map.dataservice.layers[4].toggleBorderVisible(true);
            //    this.map.dataservice.layers[5].toggleBorderVisible(true);
            //    this.map.dataservice.layers[6].toggleBorderVisible(true);

            //    this.toggle();
            //    this.map.update();
            //}
           
        },

        _hideBorder: function () {

            //this.map.dataservice.layers[1].toggleBorderVisible(false);
            //this.map.dataservice.layers[2].toggleBorderVisible(false);
            //this.map.dataservice.layers[3].toggleBorderVisible(false);
            //this.map.dataservice.layers[4].toggleBorderVisible(false);
            //this.map.dataservice.layers[5].toggleBorderVisible(false);
            //this.map.dataservice.layers[6].toggleBorderVisible(false);

            for (var j = 1; j < this.map.dataservice.layers.length - 1; j++) {
                var layer = this.map.dataservice.layers[j];
                layer.toggleBorderVisible(false);
            }
            this.map.update();
        },

        toggle: function (event) {
            //var pos = this.getPosition();
            //var corner = this._map._controlCorners[pos];
            var className = 'gba-border-show';          
            if (domUtil.hasClass(this._container, className) && event.visible === false) {
                domUtil.removeClass(this._container, className);              

            }
            else {
                domUtil.addClass(this._container, className);
                //corner.classList.add(className);
            }
            //this.map.emit("border-change");
        },

        //_addLayer: function (layer, name) {
        //    var id = util.stamp(layer);

        //    this._layers[id] = {
        //        layer: layer,
        //        name: layer.name               
        //    };            
        //},

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

    return BorderControl;
});