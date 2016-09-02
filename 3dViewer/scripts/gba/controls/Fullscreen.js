// Filename: Fullscreen.js 
define('gba/controls/Fullscreen', ["jquery", "lib/leaflet/Class", "helper/domUtil", "helper/domEvent"
], function ($, Class, domUtil, domEvent) {
    "use strict";
    /**
   * @class Fullscreen
   *
   * 
   */  
      
    var Fullscreen = Class.extend({

        //statische Klassenvriablen und Methoden:
        statics: {
          
            create: function (options) {
                var oControls = new Fullscreen(options);
                return oControls;
            }

        },

        init: function (options) {

            this.fsEnabled = (document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen);
            this.container = document.getElementById(options.containerSelector);
            this.chkFullscreen = document.getElementById(options.checkboxId);
                       
            domEvent.on(this.chkFullscreen, 'change', this.toggle, this);

            // Update checkbox when toggle fulscreen outside           
            domEvent.on(document, 'fullscreenchange', this.update, this);
            domEvent.on(document, 'webkitfullscreenchange', this.update, this);
            domEvent.on(document, 'mozfullscreenchange', this.update, this);
            domEvent.on(document, 'MSFullscreenChange', this.update, this);

        },

        toggle: function (e) {
         
            e.preventDefault();
            if (e.target.checked) {
                if (this.fsEnabled) {
                    this.requestFullscreen(this.container);
                    this.container.className += ' view-fullscreen';
                }
                else {
                    alert('Your browser does not have fullscreen support enabled');
                }
            }
            else {
                this.exitFullscreen();
                //tools.rmClass(self.container, 'view-fullscreen');
                domUtil.removeClass(this.container, "view-fullscreen");
            }
        },

        requestFullscreen: function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullScreen) {
                element.msRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        },
        
        exitFullscreen: function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        },

        update: function (e) {            
            if (document.fullScreenElement
                    || document.webkitIsFullScreen 
                    || document.mozFullScreen 
                    || document.msFullscreenElement){

                this.chkFullscreen.checked = true;
            }
            else{
                this.chkFullscreen.checked = false;
                //tools.rmClass(self.container, 'view-fullscreen');
                domUtil.removeClass(this.container, "view-fullscreen");
            }
        }
 

    });

    return Fullscreen;


});