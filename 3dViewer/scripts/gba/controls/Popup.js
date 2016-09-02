// Filename: Popup.js 
define('gba/controls/Popup', ["jquery", "lib/leaflet/Class", "helper/utilities", "helper/dom", "i18n!nls/template", "helper/domEvent"
], function ($, Class, util, dom, N, domEvent) {
    "use strict";
    /**
   * @class helper.Popup
   *
   * Popup
   *
   */  
      
    var Popup = Class.extend({

        declaredClass: "helper.Popup",
        offsetX: 3,
        offsetY: 3,
        zoomFactor: 4,
        marginLeft: 25,
        marginTop: 25,
        highlight: true, //!0,
        _isRTL: false,
        pagingControls: true, //!0,
        pagingInfo: true, //!0,
        keepHighlightOnHide: false,//!1,
        popupWindow: true,//!0,
        titleInBody: true,
        anchor: "auto",
        visibleWhenEmpty: true, //!0,
        hideDelay: 1000, //1E3,
        location: null,

        init: function (options, source) {
            //this.initialize();
            util.mixin(this, options);
            this.source = source;
           
        },

        addTo: function (map) {
            this._map = map;
            this._container = this.onAdd(map);
            //var pos = this.getPosition();//"topright"
            //var corner = map._controlCorners[pos];

            //$(container).addClass('gba-control');

            //if (pos.indexOf('bottom') !== -1) {
            //    corner.insertBefore(container, corner.firstChild);
            //}
            //else {
            //    corner.appendChild(container);
            //}
            return this;
        },

        // happens after added to map
        onAdd: function (map) {
            if (!map) {
                this.destroy();
                //logger.warning('HomeButton::map required', true);
                return;
            }
            this.map = map;
            var container = this.domNode =  document.getElementById(this.source);
            var b = this._nls = util.mixin({}, N.widgets.popup);
            var d = this.domNode;
            d.classList.add("gba-popup");
            d.classList.add("modernGrey");

            d.innerHTML = '<div class="popupWrapper" style="position: absolute;">' +
	                            '<div class="sizer">' +
		                            '<div class="titlePane">' +
			                            '<div title="' + b.NLS_searching + '" class="spinner hidden"></div>' +
			                            '<div class="title"></div>' +
			                            '<div title="' + b.NLS_nextFeature + '"Previous feature" class="titleButton prev hidden"></div>' +
			                            '<div title="' + b.NLS_prevFeature + '" class="titleButton next hidden"></div>' +
			                            '<div title="' + b.NLS_maximize + '" class="titleButton maximize"></div>' +
			                            '<div title="' + b.NLS_close + '" class="titleButton close"></div>' +
		                            '</div>' +
	                            '</div>' +
	                            '<div class="sizer content">' +
		                            '<div class="contentPane"></div>' +
	                            '</div>' +
                                '<div class="arrow hidden"></div>' +
                            '</div>' +
                            '<div class="outerPointer hidden"></div>';

            this._sizers = d.getElementsByClassName("sizer");//g.query(".sizer", d);
            this._title = d.getElementsByClassName("title", b)[0];
            this._positioner = d.getElementsByClassName("popupWrapper")[0];
            this._maxButton = d.getElementsByClassName("maximize")[0];
            this._closeButton = d.getElementsByClassName("close")[0];
            this._spinner = d.getElementsByClassName("spinner")[0];
            this._contentPane = d.getElementsByClassName("contentPane")[0];
            //pointer:
            this._pointer = d.getElementsByClassName("arrow")[0];
            this._outerPointer = d.getElementsByClassName("outerPointer")[0];


            //this._closeButton.addEventListener("click", this.hide.bind(this), false),
            //this._maxButton.addEventListener("click", this._toggleSize.bind(this), false)
            domEvent.on(this._closeButton, 'click', this.hide, this);
            domEvent.on(this._maxButton, 'click', this._toggleSize, this);
            map.on("mouse-pan", this.hide, this);

            this._toggleVisibility(false);
            return container;
        },      
     
        show: function (a) {
            this._clearContent();
            if (this.popupWindow) {
                if (this._delayHide = false, a) {
                    //var b = this.map;
                    var d = a;
                    //a.spatialReference ? (this.location = a, d = b.toScreen(a)) : (this.location = b.toMap(a), d = a);
                    //var p = b._getFrameWidth();
                    //if (-1 !== p && (d.x %= p, 0 > d.x && (d.x += p), b.width > p))
                    //    for (b = (b.width - p) / 2; d.x < b;) d.x += p;
                   
                    this._maximized && this.restore();
                    this._setPosition(d);
                    //this._maximized ? this.restore() : this._setPosition(d);
                    //this._setPosition(d)
                    //c && c.closestFirst &&
                    //    this.showClosestFirst(this.location);
                    this.isShowing || (this._toggleVisibility(true));
                }
                else {
                    this._toggleVisibility(true);
                }
            }
        },

        hide: function (e) {         
            if (this.isShowing) {
                (this._toggleVisibility(false));
            }
            //if (e) {
            //    domEvent.stop(e);
            //}
        },

        resize: function (a, c) {

            if (this.popupWindow) {

                $(this._sizers).css({
                    "width": a
                });
                $(this._contentPane).css({
                    "max-height": c
                }),
                this._maxHeight = c;
                //this.isShowing && this.reposition()

            }
        },

        maximize: function () {
            var a = this.map;
            if (a && !this._maximized && this.popupWindow) {
                this._maximized = true;
                //var c = this._maxButton;
                //e.remove(c, "maximize");
                $(this._maxButton).removeClass("maximize");
                //e.add(c, "restore");
                $(this._maxButton).addClass("restore");
                //t.set(c, "title", this._nls.NLS_restore);
                $(this._maxButton).attr("title", this._nls.NLS_restore);
                var c = this.marginLeft;
                var b = this.marginTop;
                var d = a.domElement.width - 2 * c;
                var d2 = a.domElement.height - 2 * b;
                //n.set(this.domNode, {
                //    left: this._isRTL ? null : c + "px",
                //    right: this._isRTL ? c + "px" : null,
                //    top: b + "px",
                //    bottom: null
                //});
                $(this.domNode).css({
                    "left": c + "px",
                    "right": "",
                    "top": b + "px",
                    "bottom": ""
                });
                //n.set(this._positioner, {
                //    left: null,
                //    right: null,
                //    top: null,
                //    bottom: null
                //});
                $(this._positioner).css({
                        "left": "",
                        "right": "",
                        "top": "",
                        "bottom": ""
                });
                this._savedWidth = $(this._sizers).css("width");
                this._savedHeight = $(this._contentPane).css('max-height'); // n.get(this._contentPane, "maxHeight");
                $(this._sizers).css({
                    "width": d + "px"
                });
                $(this._contentPane).css({
                    "maxHeight": d2 - 65 + "px",
                    "height": d2 - 65 + "px"
                  
                });
                this._showPointer("");
                //this._unfollowMap();              
                $(this.domNode).addClass("gbaPopupMaximized");
                //this.onMaximize()
            }
        },

        restore: function () {
           
            if (this.map && this._maximized &&
                this.popupWindow) {
                this._maximized = false;
                var a = this._maxButton;
                //e.remove(a, "restore");
                $(a).removeClass("restore");
                //e.add(a, "maximize");
                $(a).addClass("maximize");
                //t.set(a, "title", this._nls.NLS_maximize);
                $(a).attr("title", this._nls.NLS_maximize);
                //n.set(this._contentPane, "height", null);
                $(this._contentPane).css("height", "");
                this.resize(this._savedWidth, this._savedHeight);
                this._savedWidth = this._savedHeight = null;
                //this.show(this.location);
                //this._followMap();             
                $(this.domNode).removeClass("gbaPopupMaximized");
                //this.onRestore()
            }            
        },

        _toggleSize: function () {
            this._maximized ? this.restore() : this.maximize();
        },
       
        setTitle: function (a) {
            if (this.popupWindow) {
                //if (!u.isDefined(a) || "" === a) a = "\x26nbsp;";
                //this.destroyDijits(this._title);
                //this.place(a, this._title);
                //this.isShowing && (this.startupDijits(this._title), this.reposition())
                this._title.innerHTML = a;
            }
        },

        setContent: function (a) {
           
            if (this.popupWindow) {
                //if (!u.isDefined(a) ||
                //    "" === a) a = "\x26nbsp;";
                //this.destroyDijits(this._contentPane);
                //this.place(a, this._contentPane);
                //this.isShowing && (this.startupDijits(this._contentPane), this.reposition())
                if (a instanceof HTMLElement) {
                    this._contentPane.innerHTML = "";
                    this._contentPane.appendChild(a);
                }
                else {
                    this._contentPane.innerHTML = a;
                }
                //this._contentPane.style.display = "block";
            }
        },

        _clearContent: function () {            
            $(this._contentPane).html('');
        },

        _toggleVisibility: function (visible) {
            this._setVisibility(visible);
            this.isShowing = visible;
        },

        _setVisibility: function (addOrRemove) {
            //n.set(this.domNode, "visibility", addOrRemove ? "visible" : "hidden");
            $(this.domNode).css("visibility", addOrRemove ? "visible" : "hidden");
            //e.toggle(this.domNode, "esriPopupVisible", addOrRemove)
            $(this.domNode).toggleClass("gbaPopupVisible", addOrRemove);
        },

        _setPosition: function (a) {
            var c = a.x,
                b = a.y;
            a = this.offsetX || 0;
            var d = this.offsetY || 0,
                e = 0,
                f = 0,
                h = this.position(this.domElement, false);
                var r = h.w,
                g = h.h,
                l = "Left",
                m = "bottom",
                s = this.getContentBox(this._positioner),
                q = s.w / 2,
                y = s.h / 2,
                v = 349;// n.get(this._sizers[0], "height") + this._maxHeight + n.get(this._sizers[2], "height"),
                var z = v / 2,
                t = 0,
                u = 0,
                w = c,
                x = b,
                k = "auto";// this.anchor.toLowerCase();
            if ("auto" === k) {
                //if (k = F.getBox) k = k(), t = Math.max(k.l,
                //    h.x), r = Math.min(k.l + k.w, h.x + h.w), u = Math.max(k.t, h.y), g = Math.min(k.t + k.h, h.y + h.h), w += h.x, x += h.y;
                h = x - u >= v;
                v = g - x >= v;
                k = r - w >= s.w;
                s = w - t >= s.w;
                x - u > z && g - x >= z && (k ? (m = "", l = "Left") : s && (m = "", l = "Right"));
                l && m && (w - t > q && r - w >= q) && (h ? (l = "", m = "bottom") : v && (l = "", m = "top"));
                l && m && (k && h ? (l = "Left", m = "bottom") : k && v ? (l = "Left", m = "top") : s && v ? (l = "Right", m = "top") : s && h && (l = "Right", m = "bottom"));
            } else m = l = "", -1 !== k.indexOf("top") ? m = "bottom" : -1 !== k.indexOf("bottom") && (m = "top"), -1 !== k.indexOf("left") ? l = "Right" : -1 !== k.indexOf("right") &&
                (l = "Left");
            z = m + l;
            switch (z) {
                case "top":
                case "bottom":
                    f = 14;
                    break;
                case "Left":
                case "Right":
                    e = 13;
                    break;
                case "topLeft":
                case "topRight":
                case "bottomLeft":
                case "bottomRight":
                    f = 14, e = -16;
            }
            //n.set(this.domNode, {
            //    left: c + "px",
            //    top: b + "px",
            //    right: null,
            //    bottom: null
            //});
            //dom.setProperties(this.domNode, { style: "left:" + c + "px, top: " + b + "px , right: null, bottom: null;" });
            //dom.setProperties(this.domNode, {
            //        left: c + "px",
            //        top: b + "px",
            //        right: null,
            //        bottom: null
            //    });
            $(this.domNode).css({ left: c, top : b, right : "", bottom : "", position: 'absolute' });
            c = {
                left: "",
                right: "",
                top: "",
                bottom: ""
            };
            l ? c[l.toLowerCase()] = e + a + "px" : c.left = -q + "px";
            m ? c[m] = f + d + "px" : c.top = -y + "px";
            //n.set(this._positioner, c);
            //dom.setProperties(this._positioner, { style: c });
            $(this._positioner).css(c);
            this._showPointer(z);
        },

        _showPointer: function (a) {
            //e.remove(this._pointer, "top bottom right left topLeft topRight bottomRight bottomLeft hidden".split(" "));
            $(this._pointer).removeClass("top bottom right left topLeft topRight bottomRight bottomLeft hidden");
            //e.remove(this._outerPointer, ["right", "left", "hidden"]);
            $(this._outerPointer).removeClass("right left hidden");
            //"Right" === a || "Left" === a ? (a = a.toLowerCase(), e.add(this._outerPointer, a)) : e.add(this._pointer, a)
            "Right" === a || "Left" === a ? (a = a.toLowerCase(), $(this._outerPointer).addClass(a)) : $(this._pointer).addClass(a);
        },
       
        position: function (/*DomNode*/ node) {
            node = node;
            //var db = win.body(node.ownerDocument),
            var ret = node.getBoundingClientRect();
            ret = { x: ret.left, y: ret.top, w: ret.right - ret.left, h: ret.bottom - ret.top };
            return ret;
        },

        getContentBox : function (node){
            // summary:
            //		Returns an object that encodes the width, height, left and top
            //		positions of the node's content box, irrespective of the
            //		current box model.
            // node: DOMNode
            
            // clientWidth/Height are important since the automatically account for scrollbars
            // fallback to offsetWidth/Height for special cases (see #3378)
            node = node;
            //var s = computedStyle || style.getComputedStyle(node);
            var w = node.clientWidth, h;
            //var pe = geom.getPadExtents(node, s);
            var pe = { b : 0, h: 0, l : 0, r : 0, t : 0, w : 0 };
            //var be = geom.getBorderExtents(node, s);
            var be = { b: 0, h: 0, l: 0, r: 0, t: 0, w: 0 };
            if(!w){
                w = node.offsetWidth;
                h = node.offsetHeight;
            }else{
                h = node.clientHeight;
                be.w = be.h = 0;
            }           
            return {l: pe.l, t: pe.t, w: w - pe.w - be.w, h: h - pe.h - be.h};
        },

        destroy: function () {          
            //this.cleanup();
            this.isShowing && this.hide();          
            //for (var i = 0; i < this._eventConnections.length; i ++)
            //{
            //    var f = this._eventConnections[i];
            //    f.remove();
            //}
            domEvent.off(this._closeButton, 'click', this.hide, this);
            domEvent.off(this._maxButton, 'click', this._toggleSize, this);
            this.map.off('mouse-pan', this.hide, this);
            //C.destroy(this.domNode);
            this.domNode.parentNode.removeChild(this.domNode);        
            this._sizers = this._contentPane = this._positioner = this._pointer = this._outerPointer = this._title = this._prevFeatureButton = this._nextFeatureButton = this._spinner = this._eventConnections = this._nls = this._maxButton = this._closeButton = null;
        } 

    });


    return Popup;


});