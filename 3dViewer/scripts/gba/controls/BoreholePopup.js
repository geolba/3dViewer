// Filename: BoreholePopup.js 
define('gba/controls/BoreholePopup', [
    //"helper/Class",
    "jquery",
    "lib/leaflet/Control",
    "helper/utilities",
    "helper/dom",
    "i18n!nls/template",
    "helper/domEvent",
     "gba/controls/BarChart",
     "helper/mixin"
], function ($, Control, util, dom, N, domEvent, BarChart, mixin) {
    "use strict";
    /**
   * @class helper.Popup
   *
   * Popup
   *
   */

    //var proto = Events.prototype;
    //var Mixin = { Events: proto };
      
    var BoreholePopup = Control.extend({

        includes: mixin.Events,
       
        declaredClass: "gba.controls.BoreholePopup",     

        //visibleWhenEmpty: true, //!0,
        //hideDelay: 1000, //1E3,
       
        options: {
            position: 'topleft',
            width: '300px',
            height: '100%',
            delay: '10'
        },

        init: function (options) {
            //this.initialize();
            //util.mixin(this, options);
            this._innerHTML = "Es wurde noch keine Bohrloch ausgewählt!";
            util.setOptions(this, options); 
            //this._startPosition = -(parseInt(this.options.width, 10));
            //this._isLeftPosition = true;
            this._hasContent = false;
            //this.include(Events);
            //this.layer = layer;
        },

        //addTo: function (map) {
        //    this._map = map;
        //    this._container = this.onAdd(map);
           
        //    //var pos = this.getPosition();//"topright"
        //    //var corner = map._controlCorners[pos];

        //    //$(container).addClass('gba-control');

        //    //if (pos.indexOf('bottom') !== -1) {
        //    //    corner.insertBefore(container, corner.firstChild);
        //    //}
        //    //else {
        //    //    corner.appendChild(container);
        //    //}
        //    return this;
        //},

        // happens after added to map
        onAdd: function (map) {
            if (!map) {
                this.destroy();
                //logger.warning('HomeButton::map required', true);
                return;
            }
            //this._map = map;
            //var container = this.domNode =  document.getElementById(this.source);
            var b = this._nls = util.mixin({}, N.widgets.boreholepopup);

           
            var container = this._container = dom.createDom("div", { "class": "gba-control-borehole" });

            //button:
            this._maxButton = dom.createDom('div', {
                "class": "maximize", innerHTML: ">", title: b.NLS_maximize
            }, this._container);
            //link.title = 'Menu';
            //dom.createDom('span', { "class": "close", innerHtml: '?' }, link);

            //this._menu = dom.createDom('div', { "class": "gba-menu" }, document.getElementsByClassName('mapDesktop')[0]);
            this._menu = dom.createDom('div', { "class": "gba-menu" }, dom.byId("webgl"));
            this._menu.style.width = this.options.width;
            this._menu.style.height = this.options.height;
            this._menu.style.left = 0;// '-' + this.options.width;
            this._menu.style.top = 0;

            var toolboxList = dom.createDom('ul', { "class": "toolbox" }, this._menu);
            this._clearButton = dom.createDom('li', { "class": "gba-close-link" }, toolboxList);
            dom.createDom('i', { "class": "gba-close-icon" }, this._clearButton);
            dom.createDom('span', { title: b.NLS_close, innerHTML: "Close" }, this._clearButton);

            this._body = dom.createDom('div', { "class": "body" }, this._menu);

            //this._minimizeButton = dom.createDom('div', {
            //    "class": "close", innerHTML: "<", title: b.NLS_minimize
            //}, this._menu);         
         
          
            this._contenLable = dom.createDom('lable', { innerHTML: "Virtuelles Bohrprofil laut Modell <br /> (Höhenangaben in m Seehöhe)" },
                this._body);

            /* hier kommt nach dem Identify das Bohrprofil hinein */
            this._contentPane = dom.createDom('div', { "class": "gba-menu-contents" }, this._body);
            this._contentPane.innerHTML = this._innerHTML;
            this._contentPane.style.clear = 'both';

           

            domEvent
                //.on(this._maxButton, 'click', domEvent.stopPropagation)
                .on(this._maxButton, 'click',
                  this.show,
                  this);
            //L.DomEvent.disableClickPropagation(this._menu);
            //domEvent.on(this._minimizeButton, 'click', domEvent.stopPropagation)
            //    .on(this._minimizeButton, 'click',
            //        this.hide,
            //        this);
            domEvent
                //.on(this._clearButton, 'click', domEvent.stopPropagation)
               .on(this._clearButton, 'click',
                   this._close,
                   this);

                  
            this._toggleVisibility(false);
            return container;
        },      

        show: function (a) {
            //this._clearContent();
            this._toggleVisibility(true);   
            //this._animate(true);
        },

        hide: function (e) {
            //var test = this.isShowing;
            if (this.isShowing) {
                (this._toggleVisibility(false));
            }
            //if (e) {
            //    domEvent.stop(e);
            //}
        },

        _setContent: function (innerHTML) {

           

            if (innerHTML instanceof HTMLElement) {
                this._contentPane.innerHTML = "";
                this._contentPane.appendChild(innerHTML);
            }
            else {
                this._contentPane.innerHTML = innerHTML;
            }
            this._contentPane.style.display = "block";
            //this._contentPane.innerHTML = innerHTML;
            //this._contentPane.style.display = "block";            
        },

        setChartContent: function (data) {
            this._contentPane.innerHTML = "";

            var valTextColor = "ffffff";         
            this.barChart = new BarChart("d17100",
                                   320, valTextColor, 'full',                                                                
                                     400);
            this.barChart.draw(data);
            this._contentPane.appendChild(this.barChart._container);

            var table = this.barChart.getStatTable(data);
            this._contentPane.appendChild(table);
            this._hasContent = true;
        },

        _close: function(){
            this._clearContent();
            this._toggleVisibility(false);
            this.emit("closed");
        },

        _clearContent: function () {
            $(this._contentPane).html('');
            this._hasContent = false;            
        },

        _toggleVisibility: function (visible) {
           
            this._setVisibility(visible);
            this.isShowing = visible;
           
        },

        _setVisibility: function (addOrRemove) {
            //n.set(this.domNode, "visibility", addOrRemove ? "visible" : "hidden");
            $(this._menu).css("visibility", addOrRemove ? "visible" : "hidden");
            //e.toggle(this.domNode, "esriPopupVisible", addOrRemove)

            var maxButtonVisible = false;
            //if add, max Button not visible
            if (addOrRemove == true) {
                maxButtonVisible = !addOrRemove;
            }
            //if remove , then max Button only visible if popup has content
            else if (addOrRemove == false) {
                maxButtonVisible = this._hasContent;
            }            
            $(this._maxButton).css("visibility", maxButtonVisible ? "visible" : "hidden");
        },

        onRemove: function () {
            //this.cleanup();
            this.isShowing && this.hide();
            //for (var i = 0; i < this._eventConnections.length; i ++)
            //{
            //    var f = this._eventConnections[i];
            //    f.remove();
            //}
            domEvent.off(this._clearButton, 'click', this._close, this);
            domEvent.off(this._maxButton, 'click', this.show, this);
            //this.map.off('mouse-pan', this.hide, this);
            //C.destroy(this.domNode);
            //this.getContainer().parentNode.removeChild(this.getContainer());
            this._innerHTML = this._hasContent = this._nls = this._menu = this._body = this._contenLable = this._contentPane = this._maxButton = this._clearButton = null;
        }
        
    });

    return BoreholePopup;
});