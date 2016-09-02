// Filename: Dialog.js 
define('gba/controls/Dialog', ["jquery", "lib/leaflet/Class"
], function ($, Class) {
    "use strict";
    /**
   * @class module.Dialog
   *
   * Dialog
   *
   */  
      
    var Dialog = Class.extend({

        //constructor: Dialog,
        init: function (message, title, options) {
            this.message = message;
            this.title = title || this.defaultTitle;
            this.options = options || this.defaultOptions;

            ////build html:
            this.ownerDocumentBody = document.getElementById('mainWindow');

            this.domNode = document.createElement('div');
            this.domNode.setAttribute('id', 'popup');


            this.dialogDiv = document.createElement('div');
            //dialogDiv.textContent = "Sup, y'all?";
            this.dialogDiv.setAttribute('id', 'dialog');
            this.dialogDiv.setAttribute('class', 'window');
            this.domNode.appendChild(this.dialogDiv);

            this.closeDiv = document.createElement('div');
            this.closeDiv.innerHTML  = "&times;";
            this.closeDiv.setAttribute('class', 'close');
            this.dialogDiv.appendChild(this.closeDiv);
            this.titleBar = document.createElement('div');
            this.titleBar.innerHTML = "<b>Help</b>";
            this.titleBar.setAttribute('id', 'popupbar');
            this.dialogDiv.appendChild(this.titleBar);

            var popupbody = document.createElement('div');
            popupbody.innerHTML = '<div id="popupcontent">fhfghj tzutrutru</div>'+
                                   '<div id="pageinfo">' +
                                        '<h1>About</h1>' +
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

                                             '<li id="lib_leaflet">leaflet - class.js and control.js <a href="http://leafletjs.com/" target="_blank">http://leafletjs.com/</a>' +
                                            ' <a href="./dist/lib/leaflet/LICENSE.md" target="_blank" class="license">LICENSE</a></li>' +

                                            '</ul>' +
                                        '</div>' +
                                    '</div>';
            popupbody.setAttribute('id', 'popupbody');
            this.dialogDiv.appendChild(popupbody);



            this.maskDiv = document.createElement('div');
            //dialogDiv.textContent = "Sup, y'all?";
            this.maskDiv.setAttribute('id', 'mask');
            this.domNode.appendChild(this.maskDiv);

            this.ownerDocumentBody.appendChild(this.domNode);

            this.closeDiv.addEventListener('click', this.hide, false);
        },

        baseClass: "Dialog",
        defaultTitle: 'Application',
        defaultOptions: {},

        // open: [readonly] Boolean  //rue if Dialog is currently displayed on screen.
        open: false,

        templateString: [
         '<div data-view="plugins/messageBox" data-bind="css: getClass(), style: getStyle()">',
             '<div class="modal-header">',
                 '<h3 data-bind="html: title"></h3>',
             '</div>',
             '<div class="modal-body">',
                 '<p class="message" data-bind="html: message"></p>',
             '</div>',
             '<div class="modal-footer">',
                 '<!-- ko foreach: options -->',
                 '<button data-bind="click: function () { $parent.selectOption($parent.getButtonValue($data)); }, text: $parent.getButtonText($data), css: $parent.getButtonClass($index)"></button>',
                 '<!-- /ko -->',
                 '<div style="clear:both;"></div>',
             '</div>',
         '</div>'
        ].join('\n'),

       
        show: function (obj, title) {
            var isHelp = obj === undefined ? true: false;
            //// first time we show the dialog, there's some initialization stuff to do
            //if (!this._alreadyInitialized) {
            //    this._setup();
            //    this._alreadyInitialized = true;
            //}
            //obj = this._help();
            var content = document.getElementById("popupcontent");
            if (obj === undefined) {
                obj = this._help();
                //// show page info
                //content.style.display = "none";
                //document.getElementById("pageinfo").style.display = "block";
            }
         
            //$('#pageinfo').style.display = "none";
            if (obj instanceof HTMLElement) {
                content.innerHTML = "";
                content.appendChild(obj);
            }
            else {
                content.innerHTML = obj;
            }
            content.style.display = "block";
          
            //document.getElementById("popupbar").innerHTML = title || "";
            //document.getElementById("popup").style.display = "block";


       

            ////Cancel the link behavior
            //e.preventDefault();
            //Get the A tag
            var id = '#dialog';// $(this).attr('href');

            //Get the screen height and width
            var maskHeight = $(document).height();
            var maskWidth = $(window).width();

            //Set height and width to mask to fill up the whole screen
            $('#mask').css({ 'width': maskWidth, 'height': maskHeight });

            //transition effect        
            $('#mask').fadeIn(1000);
            $('#mask').fadeTo("slow", 0.8);

            //Get the window height and width
            var winH = $(window).height();
            var winW = $(window).width();

            //Set the popup window to center
            $(id).css('top', winH / 2 - $(id).height() / 2);
            $(id).css('left', winW / 2 - $(id).width() / 2);

          
            document.getElementById("popupbar").innerHTML = title || this.defaultTitle;
            //document.getElementById("popupbar").innerHTML = this.title || "";
            if (!isHelp) {
                document.getElementById("pageinfo").style.display = "none";
            }
            else {
                document.getElementById("pageinfo").style.display = "block";
            }

            //transition effect
            //$(id).fadeIn(2000);
            $(this.dialogDiv).fadeIn(2000);
        },
        
        hide: function (e) {
            // summary:
            //		Hide the dialog
            //Cancel the link behavior
            e.preventDefault();
            $('#mask, .window').hide();
            //$([this.maskDiv, this.closeDiv]).hide();
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
                    html += "<tr><td>" + p[0].trim() + "</td><td>" + p[1].trim() + "</td></tr>";
                }
            });    
            html += "</table>";

            var list = '<li id="leftMouse"><img src="content/img/leftMouse.png"> Rotate 3D Model</li>' +
            '<li id="middleMouse"><img src="content/img/middleMouse.png"> Zoom 3D Model</li>' +
            '<li id="rightMouse"><img src="content/img/rightMouse.png"> Pan 3D Model</li>';
            html += list;
                    

            return html;
        }

    });
   

    return Dialog;


});