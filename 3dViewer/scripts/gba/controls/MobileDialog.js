// Filename: MobileDialog.js 
define('gba/controls/MobileDialog', ["jquery", "lib/leaflet/Class", "helper/dom", "helper/domEvent"
], function ($, Class, dom, domEvent) {
    "use strict";
    /**
   * @class MobileDialog
   *
   * Dialog
   *
   */  
      
    var MobileDialog = Class.extend({

        defaultTitle: '3DViewer',
        declaredClass: "MobileDialog",
        defaultOptions: {},

        //constructor: MobileDialog,
        init: function (title, options) {
            //this.title = title || this.defaultTitle;
            //this.options = options || this.defaultOptions;
            //this.message = message;
            this.title = title || this.defaultTitle;
            this.options = options || this.defaultOptions;

            ////build html:
            this.ownerDocumentBody = document.getElementById('mainWindow');

            //this.domNode = document.createElement('div');
            //this.domNode.setAttribute('id', 'popup');
            this.domNode = dom.createDom("div", { class: "popup" }, this.ownerDocumentBody);
            //this.domNode.setAttribute('id', 'popup');

            //this.dialogDiv = dom.createDom("div", {
            //    //class: "fm_basemap_list fm_overlay", 
            //    //class: "fm_about fm_overlay", 
            //    class: this.options.klass + " fm_overlay",
            //    innerHTML: '<div id="popupbar"><b class="popuptitle">Help</b><div class="popup_close"></div></div>' +

            //        //'<div id="basemapList" class="fm_handle"></div>' +
            //         '<div id="popupcontent" class="fm_handle"></div>' +

            //        '<div class="pageinfo">' +
            //                            '<h1>About</h1>' +
            //                            '<div id="about">' +
            //                                                    "This project is using the following libraries:" +
            //                                "<ul>" +

            //                                    '<li>three.js + OrbitControls.js <a href="http://threejs.org/" target="_blank">http://threejs.org/</a>' +
            //                                    ' <a href="./dist/lib/threejs/LICENSE.txt" target="_blank" class="license">MIT LICENSE</a></li>' +

            //                                      '<li id="lib_jquery">jQuery <a href="https://jquery.org/" target="_blank">https://jquery.org/</a>' +
            //                                ' <a href="https://jquery.org/license/" target="_blank" class="license">MIT LICENSE</a></li>' +

            //                                '<li>RequireJS <a href="http://requirejs.org/" target="_blank">http://requirejs.org/</a>' +
            //                                ' <a href="./dist/lib/requirejs/LICENSE.md" target="_blank" class="license">MIT LICENSE</a></li>' +

            //                                '<li id="lib_proj4js">Proj4js <a href="http://trac.osgeo.org/proj4js/" target="_blank">http://trac.osgeo.org/proj4js/</a>' +
            //                                ' <a href="./dist/lib/proj4js/LICENSE.md" target="_blank" class="license">LGPL LICENSE</a></li>' +

            //                                 '<li id="lib_leaflet">leaflet - class.js and control.js <a href="http://leafletjs.com/" target="_blank">http://leafletjs.com/</a>' +
            //                                ' <a href="./dist/lib/leaflet/LICENSE.md" target="_blank" class="license">LICENSE</a></li>' +

            //                                '</ul>' +
            //                            '</div>' +
            //                        '</div>'
            //}, this.domNode);

            this.dialogDiv = dom.createDom("div", {
                //class: "fm_basemap_list fm_overlay", 
                //class: "fm_about fm_overlay", 
                class: this.options.klass + " fm_overlay"
            }, this.domNode);

            //popupbar
            this.popupbar = dom.createDom("div", { 'class': "popupbar" }, this.dialogDiv);
            this.popuptitle = dom.createDom("b", { 'class': "popuptitle" }, this.popupbar);
            var popup_close = dom.createDom("div", { 'class': "popup_close" }, this.popupbar);

            //popupcontent
            //this.popupcontent;
            //if (options.contentId) {//z.B. id="basemapList"
            //    this.popupcontent = dom.createDom("div", { 'class': "fm_handle", id: options.contentId }, this.dialogDiv);
            //}
            //else {
            this.popupcontent = dom.createDom("div", { 'class': "fm_handle" }, this.dialogDiv);
            //}

            //additional info div
            this.pageinfo = dom.createDom("div", {
                'class': "pageinfo",
                innerHTML: '<h1>About</h1>' +
                                        '<div id="about">' +
                                                                "This project is using the following libraries:" +
                                            "<ul>" +

                                                '<li>three.js + OrbitControls.js <a href="http://threejs.org/" target="_blank">http://threejs.org/</a>' +
                                                ' <a href="./dist/lib/threejs/LICENSE.txt" target="_blank" class="license">MIT LICENSE</a></li>' +

                                                  '<li id="lib_jquery">jQuery <a href="https://jquery.org/" target="_blank">https://jquery.org/</a>' +
                                            ' <a href="https://jquery.org/license/" target="_blank" class="license">MIT LICENSE</a></li>' +

                                            '<li>RequireJS <a href="http://requirejs.org/" target="_blank">http://requirejs.org/</a>' +
                                            ' <a href="./dist/lib/requirejs/LICENSE.md" target="_blank" class="license">MIT LICENSE</a></li>' +

                                            '<li id="lib_proj4js">Proj4js <a href="http://trac.osgeo.org/proj4js/" target="_blank">http://trac.osgeo.org/proj4js/</a>' +
                                            ' <a href="./dist/lib/proj4js/LICENSE.md" target="_blank" class="license">LGPL LICENSE</a></li>' +

                                             '<li id="lib_leaflet">leaflet - class.js <a href="http://leafletjs.com/" target="_blank">http://leafletjs.com/</a>' +
                                            ' <a href="./dist/lib/leaflet/LICENSE.md" target="_blank" class="license">LICENSE</a></li>' +

                                             '<li id="lib_pure">pure.css <a href="http://purecss.io/" target="_blank">http://purecss.io/</a>' +
                                            ' <a href="./content/components/pure/css/LICENSE.md" target="_blank" class="license">BSD LICENSE</a></li>' +

                                               '<li id="lib_fontawesome">fontawesome <a href="http://fontawesome.io/" target="_blank">http://fontawesome.io/</a>' +
                                            ' <a href="http://fontawesome.io/license" target="_blank" class="license">Font: SIL OFL 1.1, CSS: MIT License</a></li>' +

                                            '</ul>' +
                                        '</div>' 
            }, this.dialogDiv);
         
            //this.closeDiv = dom.byId("closeBtn");
            //this.closeDiv = this.domNode.getElementsByClassName("popup_close")[0];        
            domEvent.on(popup_close, 'click', this.hide, this);
          
           
        },

        hide: function (e) {
            // summary:
            //		Hide the dialog
            //Cancel the link behavior
            var test = this;
            if(e) e.preventDefault();

            //$('.fm_overlay').hide();
            //$('.' + this.options.klass).hide();
            $(this.dialogDiv).hide();
            //$([this.maskDiv, this.closeDiv]).hide();
        },

        show: function (html, title) {
            var isHelp = html === undefined ? true : false;
         

            //var content = document.getElementById("basemapList");//später popupcontent
            var popupcontent = this.popupcontent;// document.getElementById("popupcontent");
            if (html === undefined) {
                html = this._help();
                //// show page info
                //content.style.display = "none";
                //document.getElementById("pageinfo").style.display = "block";
            }

            //$('#pageinfo').style.display = "none";
            if (html instanceof HTMLElement) {
                popupcontent.innerHTML = "";
                popupcontent.appendChild(html);
            }
            else {
                popupcontent.innerHTML = html;
            }

            //document.getElementById("popuptitle").innerHTML = title || this.title;
            this.domNode.getElementsByClassName("popuptitle")[0].innerHTML = title || this.title;

            if (!isHelp) {
                //document.getElementById("pageinfo").style.display = "none";
                this.pageinfo.style.display = "none";
            }
            else {
                //document.getElementById("pageinfo").style.display = "block";
                this.pageinfo.style.display = "block";
            }




            //$(".fm_overlay").toggle();
            //$('.' + this.options.klass).toggle();
            //$(this.dialogDiv).toggle();
            $(this.dialogDiv).fadeToggle(2000);
        },

        _help: function () {
            var lines = [
                "I : Show Page Info",
               "W : Wireframe Mode",
               "Shift + R : Reset Canvas"
            ];
            var html = '<table>';
            lines.forEach(function (line) {
                if (line.trim() === "") return;

                if (line[0] === "*") {
                    html += '<tr><td colspan="2" class="star">' + line.substr(1).trim() + "</td></tr>";
                }
                else if (line.indexOf(":") === -1) {
                    html += '<tr><td colspan="2">' + line.trim() + "</td></tr>";
                }
                else {
                    var p = line.split(":");
                    html += "<tr><td class='star'>" + p[0].trim() + "</td> <td class='star'>" + p[1].trim() + "</td></tr>";
                }
            });
            html += "</table>";

            var list = '<ul><li id="leftMouse"><img src="content/img/leftMouse.png"> Rotate 3D Model</li>' +
            '<li id="middleMouse"><img src="content/img/middleMouse.png"> Zoom 3D Model</li>' +
            '<li id="rightMouse"><img src="content/img/rightMouse.png"> Pan 3D Model</li></ul>';
            html += list;


            return html;
        }


    });


    return MobileDialog;


});