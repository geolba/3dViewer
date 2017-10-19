// Filename: MobilePopup.js 
define('gba/controls/MobilePopup', ["jquery", "lib/leaflet/Class", "helper/utilities", "helper/dom", "i18n!nls/template", "helper/domEvent", "helper/domUtil"
], function ($, Class, util, dom, N, domEvent, domUtil) {
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
        },

        addTo: function (map) {
            this._map = map;
            this._container = this.onAdd(map);
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
            var container = this.domNode = document.getElementById(this.source);
            var b = this._nls = util.mixin({}, N.widgets.popup);
            var d = this.domNode;
            d.classList.add("gba-popup-mobile");

            d.innerHTML = '<div class="sizer">' +
                                '<div class="titlePane">' +
                                    '<div class="spinner hidden"></div>' +
		                            '<div class="title"></div>' +
                                    '<div style="text-align: center;">' +
                                        '<div class="titleButton prev hidden"></div>' +
                                        '<div class="footer" style="width: 60px; height: 15px; display: inline-block;"></div>' +
                                        '<div class="titleButton next hidden"></div>' +
                                    '</div>' +
                                    '<div class="titleButton close"></div>' +
                                    '<div class="titleButton arrow hidden"></div>' +
                                '</div>' +
                            '</div>' +

                            //'<div class="esriMobilePopupInfoView"></div>' +

                            '<div class="pointer top hidden"></div>' +
                            '<div class="pointer bottom hidden"></div>';

            //this._contentPane = d.getElementsByClassName("esriMobilePopupInfoView")[0];
            this._title = d.getElementsByClassName("title", b)[0];
            this._pointerTop = d.getElementsByClassName("top")[0];// h.query(".top", f)[0];
            this._pointerBottom = d.getElementsByClassName("bottom")[0];
            this._arrowButton = d.getElementsByClassName("arrow")[0];
            this._closeButton = d.getElementsByClassName("close")[0];

            this._eventConnections = [
                domEvent.on(this._closeButton, 'click', this.hide, this),
                domEvent.on(this._arrowButton, "click", this._toggleView, this)
            ];
            map.on("mouse-pan", this.hide, this);

            this._initPopupInfoView();
            this._initPopupNavigationBar();

            this._toggleVisibility(false);
            return container;

        },

        setContent: function (a) {
            //this.features = [];
            //this.features.push(a);
            if (a instanceof HTMLElement) {
                this._contentPane.innerHTML = "";
                this._contentPane.appendChild(a);
            }
            else {
                this._contentPane.innerHTML = a;
            }
            this._updateUI();
        },

        _clearContent: function () {
            $(this._contentPane).html('');
            this.features = [];
            //this._updateUI();
            //g.hide(this.popupNavigationBar.container);
            //$(this._contentPane).css("display", "none");
        },

        setTitle: function (a) {
            this._title.innerHTML = a;
        },

        show: function (a) {
            if (a) {
                var c = this.map;
                //a.spatialReference ? (this.location = a, a = c.toScreen(a)) : this.location = c.toMap(a);
                var d = a;
                //this._maximized ? this.restore() : this._setPosition(a);
                this._maximized && this.restore();
                this._setPosition(d);


                //this.isShowing || (g.show(this.domNode), this.isShowing = !0, this.onShow())

                this.isShowing || (this._toggleVisibility(true), this.isShowing = !0);

            }
            else {
                //g.show(this.domNode)
                this._toggleVisibility(true);
                this.isShowing = !0
            }

        },

        hide: function () {
            if (this.isShowing === true) {
                (this._toggleVisibility(false));
                this.isShowing = false;
                //this.onHide();   
                //this._clearContent();
            }
        },

        destroy: function () {
            //this.map && this.unsetMap();          
            this.isShowing && this.hide();

            //q.forEach(this._eventConnections, b.disconnect);
            domEvent.off(this._closeButton, 'click', this.hide, this);
            domEvent.off(this._arrowButton, "click", this._toggleView, this);
            //handle navigation bar:
            domEvent.off(this._closeNavButton, 'click', this._closePopupNavigation, this);
            domEvent.off(this._toggleNavButton, 'click', this._togglePopupNavigation, this);
            this.map.off('mouse-pan', this.hide, this);

            this.domNode.parentNode.removeChild(this.domNode);
            this._title = this._pointerTop = this._pointerBottom = this._arrowButton = this._closeButton = this._eventConnections = null;
        },


        _toggleVisibility: function (visible) {
            this._setVisibility(visible);
            this.isShowing = visible;
        },

        _setVisibility: function (addOrRemove) {

            $(this.domNode).css("visibility", addOrRemove ? "visible" : "hidden");
            ////e.toggle(this.domNode, "esriPopupVisible", addOrRemove)
            //$(this.domNode).toggleClass("gbaPopupVisible", addOrRemove);
        },

        _toggleView: function () {
            this.popupNavigationBar || this._initPopupNavigationBar();
            this.popupInfoView || this._initPopupInfoView();
            //this.hide();

            //g.show(this.popupNavigationBar.container);
            $(this.popupNavigationBar).css("display", "block");
            $(this.popupInfoView).css("display", "block");
            //0 <= this.selectedIndex && this.setContent(this.features[this.selectedIndex].getContent())
        },

        _initPopupInfoView: function () {
            this.popupInfoView = dom.createDom("div", {
                'class': "mobileInfoView",
                innerHTML: '<div class="mobileInfoViewItem"></div>'
            }, document.body);
            domUtil.addClass(this.popupInfoView, "mobilePopupInfoView");
            //this._contentPane = a[1]._node;
            this._contentPane = this.popupInfoView.getElementsByClassName("mobileInfoViewItem")[0];

        },

        _initPopupNavigationBar: function () {           
            var imagePath = util.rootFolder() + "images/";
            this.popupNavigationBar = dom.createDom("div", {
                'class': 'mobileNavigationBar',
                innerHTML:
                    '<div class="mobileNavigationItem left"><img src=' + imagePath + 'whitex.png style="width: 100%; height: 100%;"></div>' +
                    '<div class="mobileNavigationItem right"><img src=' + imagePath + 'whitedown.png style="width: 100%; height: 100%;"></div>'
            }, document.body);
            this._closeNavButton = this.popupNavigationBar.getElementsByClassName("mobileNavigationItem")[0];
            this._toggleNavButton = this.popupNavigationBar.getElementsByClassName("mobileNavigationItem")[1];

            //handle navigation bar:
            domEvent.on(this._closeNavButton, 'click', this._closePopupNavigation, this);
            domEvent.on(this._toggleNavButton, 'click', this._togglePopupNavigation, this);


            //$(this.popupNavigationBar).css("visibility", "hidden");
            $(this.popupNavigationBar).css("display", "none");
        },

        _closePopupNavigation: function () {
            $(this.popupInfoView).css("display", "none");
            $(this.popupNavigationBar).css("display", "none");
            this.hide();
        },

        _togglePopupNavigation: function () {
            $(this.popupInfoView).css("display", "none");
            $(this.popupNavigationBar).css("display", "none");
            this.show(this.location);
        },


        _setPosition: function (a) {
            this.features = a.features;
            var c = a.x;
            var a = a.y;
            var f = this.getContentBox(this.map.container);
            var d = f.w;
            var f = f.h;
            var b = 0;
            var g = a + 10;
            var k = 118;
            var l = d - 18;
            18 < c && c < l ? (b = c - 130, 0 > b ? b = 0 : b > d - 260 && (b = d - 260)) : 18 >= c ? b = c - 18 : c >= l && (b = d - 260 + (c - l));
            118 < c && c < d - 130 ? k = 118 : 118 >= c ? 18 < c ? k = c - 12 : 18 >= c && (k = 6) : c >= d - 130 && (c < l ? k = 118 + c - (d - 130) : c >= l && (k = 118 + l - (d - 130)));
            if (a <= f / 2) {
                $(this.domNode).css({
                    left: b + "px",
                    top: g + "px",
                    bottom: ""
                });
                $(this._pointerTop).css({
                    left: k + "px"
                });
                //$(this._pointerBottom).css("visibility", 'hidden');
                //$(this._pointerTop).css("visibility", 'visible');
                $(this._pointerBottom).addClass("hidden");
                $(this._pointerTop).removeClass("hidden");
            }
            else {
                $(this.domNode).css({
                    left: b + "px",
                    top: g - 64 + "px",
                    bottom: ""
                });
                $(this._pointerBottom).css({
                    left: k + "px"
                });
                //$(this._pointerTop).css("visibility", 'hidden');
                //$(this._pointerBottom).css("visibility", 'visible');
                $(this._pointerTop).addClass("hidden");
                $(this._pointerBottom).removeClass("hidden");
            }




        },

        getContentBox: function (node) {
            node = node;
            var w = node.clientWidth, h;
            var pe = { b: 0, h: 0, l: 0, r: 0, t: 0, w: 0 };
            var be = { b: 0, h: 0, l: 0, r: 0, t: 0, w: 0 };
            if (!w) {
                w = node.offsetWidth;
                h = node.offsetHeight;
            } else {
                h = node.clientHeight;
                be.w = be.h = 0;
            }
            return { l: pe.l, t: pe.t, w: w - pe.w - be.w, h: h - pe.h - be.h };
        },

        _updateUI: function () {
            var a = "\x26nbsp;";
            var c = "\x26nbsp;";
            var d = this.features;
            d && 1 <= d.length ? ($(this._arrowButton).removeClass("hidden")) : ($(this._arrowButton).addClass("hidden"));
            this.setTitle(a, c);
        }

    });


    return MobilePopup;


});