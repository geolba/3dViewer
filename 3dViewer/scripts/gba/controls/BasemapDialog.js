// Filename: MobileDialog.js 
define('gba/controls/BasemapDialog', ["jquery", "gba/controls/MobileDialog", "helper/dom", "helper/domEvent", 'helper/utilities'
], function ($, MobileDialog, dom, domEvent, util) {
    "use strict";
    /**
   * @class BasemapDialog
   *
   * Dialog
   *
   */

    var BasemapDialog = MobileDialog.extend({

        init: function (title, options) {
            //call parent constructor
            MobileDialog.prototype.init.call(this, title, options);
            this.pageinfo.style.display = "none";
            var map = this.map = options.map;
            var basemaps = this.basemaps = map.basemaps.services;

            this.popupcontent.id = "basemapList";
            this.popuptitle.innerHTML = this.title;

            this._initBasemapHtml(map.basemaps.services);

            ////domEvent.on(popup_close, 'click', this.hide, this);
            //$("#basemapList").on('click', 'a', null, function (e) {
            //    e.preventDefault();
            //    var name = this.getAttribute('data-name');
            //    this.setBasemap(name);
            //    //$(".fm_basemap_list").toggle();
            //    this.close();
            //    //fm.setActiveTab(null);
            //    return false;
            //});



        },

        //overwrite show function from parent class
        show: function () {


            //$(".fm_overlay").toggle();
            //$('.' + this.options.klass).toggle();
            $(this.dialogDiv).fadeToggle(2000);
        },

        setBasemap: function (name) {
            for (var i = 0; i < this.basemaps.length; i++) {
                if (this.basemaps[i].name === name) {
                    var basemap = this.basemaps[i];
                    if (this.map.currentBasemap) {
                        //this.map.removeLayer(this.map.currentBasemap);
                        this.map.currentBasemap.changeImage(i);
                    }
                    //var curentBaseMap = this.map.currentBasemap = new esri.layers.ArcGISTiledMapServiceLayer(getBasemapUrl(basemaps.services[i]), {
                    //    id: 'basemap'
                    //});
                    //this.map.addLayer(currentBasemap);
                    return true;
                }
            }
        },

        _initBasemapHtml: function (basemaps) {

            var code = '';
            for (var i = 0; i < basemaps.length; i++) {
                var basemap = basemaps[i];
                if (basemap.type === 'MapServer') {
                    //code += "<a href='#' data-name='" + basemap.name + "' class='fm_basemap_option' >"
                    //        + "<img src='images/basemap/" + basemap.image + "' class='fm_basemap_image' />"
                    //        + "<label>" + basemap.title + "</label>";
                    //+ "</a>"; 
                    var btnLink = dom.createDom('a', {
                        'class': 'gba_basemap_option'
                    }, this.popupcontent);
                    btnLink.dataset.name = basemap.name;

                    var image = dom.createDom('img', {
                        'class': 'gba_basemap_img',
                    }, btnLink);
                    //image.setAttribute('src', "images/basemap/" + basemap.image);
                    var imagePath = util.rootFolder() + "images/";
                    image.setAttribute('src', imagePath + "basemap/" + basemap.image);

                    var label = dom.createDom('label', { innerHTML: basemap.title }, btnLink);

                    domEvent.on(btnLink, 'click', function (e) {
                        e.preventDefault();
                        var name = e.currentTarget.getAttribute('data-name');
                        this.setBasemap(name);
                        //$(".fm_basemap_list").toggle();
                        this.hide();
                        //fm.setActiveTab(null);
                        return false;
                    }, this);
                }
            }
            //$("#basemapList").html(code);
        }



    });

    return BasemapDialog;


});