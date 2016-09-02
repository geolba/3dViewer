// Filename: MobilePopup.js 
define('gba/controls/MobilePopup', ["jquery", "lib/leaflet/Class", "helper/utilities", "helper/dom", "i18n!nls/template", "helper/domEvent"
], function ($, Class, util, dom, N, domEvent) {
    "use strict";
    /**
   * @class gba.controls.MobilePopup
   *
   * improved for mobile devices!
   *
   */

    var MobilePopup = Class.extend({

        declaredClass: "gba.controls.MobilePopup",
        
        init: function (options, source) {
            util.mixin(this, options);
            this.source = source;
        }   

    });


    return MobilePopup;


});