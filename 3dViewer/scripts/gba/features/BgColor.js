// Filename: BgColor.js 
define('gba/features/BgColor', ["jquery", "lib/leaflet/Class", "helper/domUtil", "helper/domEvent"
], function ($, Class, domUtil, domEvent) {
    "use strict";
    /**
   * @class BgColor
   *
   * 
   */

    var BgColor = Class.extend({

        //statische Klassenvriablen und Methoden:
        statics: {

            create: function (options) {
                var oControls = new BgColor(options);
                return oControls;
            }

        },

        init: function (options) {


            //self.bgNode = geo3d.x3dContainer.querySelector('background');
            //self.input = document.getElementById(config.inputId);
           

            this.bgNode = document.getElementById(options.containerSelector);
            this.input = document.getElementById(options.inputId);
            this.renderer = options.renderer;
            this.map = options.map;

            domEvent.on(this.input, 'input', this.updateValue, this);         

        },

        updateValue: function (e) {           
            //var color = this.hexToX3dRgb(e.target.value);
            this.renderer.setClearColor(e.target.value, 0.2);
            this.map.update();
        },

        hexToX3dRgb: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ?
              parseInt(result[1], 16) / 255 + ' ' +
              parseInt(result[2], 16) / 255 + ' ' +
              parseInt(result[3], 16) / 255
            : '1 1 1';
        }


    });

    return BgColor;


});