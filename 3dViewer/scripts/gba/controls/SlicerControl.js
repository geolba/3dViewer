define('gba/controls/SlicerControl', [
    //"helper/Class",
     "lib/leaflet/Control",
    "gba/controls/RangeSlider", "helper/dom", "helper/domEvent", "helper/utilities", "helper/domUtil"],

function (Control, RangeSlider, dom, domEvent, util, domUtil) {

    var SlicerControl = Control.extend({
        options: {
            //size: '100px',
            position: 'topright',
            //min: 1,
            //max: 50,
            //step: 1,
            //id: "slider",
            //value: 0,
            //collapsed: true,
            //title: 'zeige Slicer-Menü',
            //orientation: 'horizontal',
            //showValue: true,
            //syncSlider: false
        },

        init: function (options) {

            util.setOptions(this, options);
           
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

        onAdd: function (map) {
          
            //var container = this._container = document.getElementById('range-slider-3');
            var container = null;//this._container = dom.createDom("div", { "class": "gba-control-slicer" });
            ////button:
            ////this._maxButton = dom.createDom('div', {
            ////    "class": "maximize", innerHTML: ">", title: "zeige Slicer-Menü"
            ////}, this._container);

            /////////////////// der eigentliche Button  
            //this._sliderLink = dom.createDom("span", {"class": "gba-span-showmenu", title: "zeige Slicer-Menü" }, this._container);
            //this._less = dom.createDom("span", { "class": "gba-span-hidemenu", title: "schließe Slicer-Menü" }, this._container);
            //domEvent.on(this._less, 'click', this._show, this);

           
            //this._menu = dom.createDom('div', { "class": "gba-menu" }, document.getElementsByClassName('mapDesktop')[0]);
            //var rangeSlider = dom.createDom('div', { "class": 'slicerDesktop' }, document.getElementById('slicerPanel'));
            this._slicerMenu = dom.createDom('div', {id: "range-slider", "class": 'gba-slicer-menu' }, document.getElementById('range-slider'));
            dom.createDom("span", { innerHTML: "SLICER", "class": "gbaLegendServiceLabel" }, this._slicerMenu);

            var table = dom.createDom('table', { width: "95%" }, this._slicerMenu);
            var tblBody = dom.createDom("tbody", {}, table);
          
            var sliderValue1 = Math.round(this._map.dataservice.width / 2);
            var row = dom.createDom("tr", {}, tblBody);
            var leftTd = dom.createDom("td", { align: "left", style: "width:20px;" }, row);
            dom.createDom("span", { innerHTML: "x",  }, leftTd);
            var rightTd = dom.createDom("td", { align: "left" }, row);
            this.slider1 = new RangeSlider(rightTd, {
                vertical: false,
                value: sliderValue1,
                max: sliderValue1, min: -sliderValue1,
                id:"slider1"
            });

            var sliderValue2 = Math.round(this._map.dataservice.height / 2);
            row = dom.createDom("tr", {}, tblBody);
            leftTd = dom.createDom("td", { align: "left", style: "width:20px;" }, row);
            dom.createDom("span", { innerHTML: "y", }, leftTd);
            rightTd = dom.createDom("td", { align: "left", "data-slider-id": 2 }, row);
            this.slider2 = new RangeSlider(rightTd, {
                vertical: false,
                value: -sliderValue2,
                max: sliderValue2, min: -sliderValue2,
                inverse:true,
                id: "slider2"
            });

            //this.xSlider = dom.createDom('input', { "class": 'gba-slider' }, this._slicerMenu);
            //if (this.options.orientation === 'vertical') { this.xSlider.setAttribute("orient", "vertical"); }
            //this.xSlider.setAttribute("title", "slicer");
            ////this.xSlider.setAttribute("id", this.options.id);
            //this.xSlider.setAttribute("type", "range");
            //this.xSlider.setAttribute("min", -50);
            //this.xSlider.setAttribute("max", 50);
            //this.xSlider.setAttribute("step", 1);
            //this.xSlider.setAttribute("value", 50);
            //domEvent.on(this.xSlider, "change", this._updateValue, this);

            this.slider1.on("changed", this._updateValue, this);
            this.slider2.on("changed", this._updateValue, this);


            //domEvent.on(this._sliderLink, 'click', this._show, this);
            //this._toggleVisibility(false);
            return this._container;
        },

        _show: function () {
            //this._clearContent();
            this._toggleVisibility(!this.isShowing);
            //this._animate(true);
            this.toggle();
        },

        _toggleVisibility: function (visible) {          
            this._setVisibility(visible);
            this.isShowing = visible;
         
        },
        _setVisibility: function (addOrRemove) {
            ////n.set(this.domNode, "visibility", addOrRemove ? "visible" : "hidden");
            //$(this._slicerMenu).css("visibility", addOrRemove ? "visible" : "hidden");
            
            this._slicerMenu.style.visibility = addOrRemove ? "visible" : "hidden";
        },
        
        toggle: function () {
            //var pos = this.getPosition();
            //var corner = this._map._controlCorners[pos];
            var className = 'gba-slicer-show';
            //var className2 = 'gba-control-slicer2';
            if (domUtil.hasClass(this._container, className)) {
                domUtil.removeClass(this._container, className);
                //corner.classList.remove(className);
             
            } else {               
                domUtil.addClass(this._container, className);
                //corner.classList.add(className);
              
            }
        },

        _updateValue: function (value) {
            //this.value = value,// this.xSlider.value;// value;
            var x = this.slider1.getValue(); //50
            var y = this.slider2.getValue(); //39
            //if (this.options.showValue) {
            //    this._sliderValue.innerHTML = this.value;
            //}
            //this.options.layers[0].scaleZ(this.value);
            //this.update(this.value);
            this._map.dataservice.layers.forEach(function (layer) {
                //if (layer.type === "DxfLayer"){
                //    layer.filterTest(x, y);
                //}
                layer.filter(x, y);
            }, this);

            util.showLoading();
            var self = this;
            var work1 = this._map.dataservice.layers[1].asyncBuildBorder(true);
            var work2 = this._map.dataservice.layers[2].asyncBuildBorder(true);
            var work3 = this._map.dataservice.layers[3].asyncBuildBorder(true);
            var work4 = this._map.dataservice.layers[4].asyncBuildBorder(true);
            var work5 = this._map.dataservice.layers[5].asyncBuildBorder(true);
            var work6 = this._map.dataservice.layers[6].asyncBuildBorder(false);
            $.when(work1, work2, work3, work4, work5, work6).then(function (result1, result2, result3, result4, result5, result6) {
                util.hideLoading();
                //var borderControl = new BorderControl(app.dataservice.layers, {}).addTo(app.controls);
                self._map.update();
            }).fail(function (event) {
                util.hideLoading();               
            });



            this._map.update();
        },

        onRemove: function (map) {
            domEvent.off(this._less, 'click', this._show, this);
           
            this.slider1.off("slide", this._updateValue, this);
            this.slider2.off("slide", this._updateValue, this);

            domEvent.off(this._sliderLink, 'click', this._show, this);
        },

    });
    return SlicerControl;

});