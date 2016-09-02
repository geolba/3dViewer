define('gba/controls/Slider', [
    "lib/leaflet/Control", "helper/dom", "helper/domEvent", "helper/utilities"],

function (Control, dom, domEvent, util) {

    var Slider = Control.extend({      

        //onAdd: function (map) {
        //    //this._container = L.DomUtil.create('div', 'gba-control-coordinates');
        //    var classname = "gba-control-slider";
        //    this._container = dom.createDom("div", { "class": classname });
        //    var link = dom.createDom("span", { "class": classname, title: "scale z" }, this._container);
        //    return this._container;
        //},

        options: {
            size: '100px',
            position: 'topright',
            min: 1,
            max: 5,
            step: 0.5,
            id: "slider",
            value: 1,
            collapsed: true,
            title: 'Z Slider',           
            orientation: 'horizontal',          
            showValue: true,
            syncSlider: false
        },

        init: function (options) {
            util.setOptions(this, options);
            //if (typeof f == "function") {
            //    this.update = f;
            //} else {
            //    this.update = function (value) {
            //        console.log(value);
            //    };
            //}
            //if (typeof this.options.getValue != "function") {
            //    this.options.getValue = function (value) {
            //        return value;
            //    };
            //}
            if (this.options.orientation !== 'vertical') {
                this.options.orientation = 'horizontal';
            }
        },
        onAdd: function (map) {
            this._initLayout();
            //this.update(this.options.value + "");
            return this._container;
        },
       
        _initLayout: function () {

            var className = 'gba-control-slider';
            var className2 = className + ' ' + className + '-' + this.options.orientation;
            //this._container = domUtil.create('div', className + ' ' + className + '-' + this.options.orientation);
            this._container = dom.createDom("div", { "class": className2 });

            ///////////////// der eigentliche Button
            //this._sliderLink = domUtil.create('a', className + '-toggle', this._container);
            //this._sliderLink.setAttribute("title", this.options.title);
            //this._sliderLink.innerHTML = this.options.logo;
            this._sliderLink = dom.createDom("span", { "class": className + "-toggle", title: this.options.title }, this._container);

            //if (this.options.showValue) {
            //    this._sliderValue = L.DomUtil.create('p', className + '-value', this._container);
            //    this._sliderValue.innerHTML = this.options.getValue(this.options.value);
            //}
            //show value
            this._sliderValue = dom.createDom("p", { "class": className + "-value", innerHTML: this.options.value }, this._container);

            //if (this.options.increment) {
            //    this._plus = L.DomUtil.create('a', className + '-plus', this._container);
            //    this._plus.innerHTML = "+";
            //    L.DomEvent.on(this._plus, 'click', this._increment, this);
            //    L.DomUtil.addClass(this._container, 'leaflet-control-slider-incdec');
            //}

            //this._sliderContainer = L.DomUtil.create('div', 'leaflet-slider-container', this._container);
            this._sliderContainer = dom.createDom('div', { "class": 'gba-slider-container' }, this._container);
        
            this.slider = dom.createDom('input', { "class": 'gba-slider' }, this._sliderContainer);
            if (this.options.orientation === 'vertical') { this.slider.setAttribute("orient", "vertical"); }
            this.slider.setAttribute("title", this.options.title);
            this.slider.setAttribute("id", this.options.id);
            this.slider.setAttribute("type", "range");
            this.slider.setAttribute("min", this.options.min);
            this.slider.setAttribute("max", this.options.max);
            this.slider.setAttribute("step", this.options.step);
            this.slider.setAttribute("value", this.options.value);

            //if (this.options.syncSlider) {
            //    L.DomEvent.on(this.slider, "input", function (e) {
            //        this._updateValue();
            //    }, this);
            //} else {
            //    L.DomEvent.on(this.slider, "change", function (e) {
            //        this._updateValue();
            //    }, this);
            //}
            domEvent.on(this.slider, "change", this._updateValue, this);

            //if (this.options.increment) {
            //    this._minus = L.DomUtil.create('a', className + '-minus', this._container);
            //    this._minus.innerHTML = "-";
            //    L.DomEvent.on(this._minus, 'click', this._decrement, this);
            //}

            if (this.options.showValue) {
                if (window.matchMedia("screen and (-webkit-min-device-pixel-ratio:0)").matches && this.options.orientation === 'vertical') {
                    this.slider.style.width = (this.options.size.replace('px', '') - 36) + 'px';
                    this._sliderContainer.style.height = (this.options.size.replace('px', '') - 36) + 'px';
                }
                else if (this.options.orientation === 'vertical') {
                    this._sliderContainer.style.height = (this.options.size.replace('px', '') - 36) + 'px';
                }
                else {
                    this._sliderContainer.style.width = (this.options.size.replace('px', '') - 25) + 'px';
                }
            } 
            //else {
            //    if (window.matchMedia("screen and (-webkit-min-device-pixel-ratio:0)").matches && this.options.orientation == 'vertical') { this.slider.style.width = (this.options.size.replace('px', '') - 10) + 'px'; this._sliderContainer.style.height = (this.options.size.replace('px', '') - 10) + 'px'; }
            //    else if (this.options.orientation == 'vertical') { this._sliderContainer.style.height = (this.options.size.replace('px', '') - 10) + 'px'; }
            //    else { this._sliderContainer.style.width = (this.options.size.replace('px', '') - 25) + 'px'; }
            //}

            //L.DomEvent.disableClickPropagation(this._container);

            if (this.options.collapsed) {
                //if (!L.Browser.android) {
                    domEvent
                        .on(this._container, 'mouseenter', this._expand, this)
                        .on(this._container, 'mouseleave', this._collapse, this);
                //}

                //if (L.Browser.touch) {
                //    L.DomEvent
                //        .on(this._sliderLink, 'click', L.DomEvent.stop)
                //        .on(this._sliderLink, 'click', this._expand, this);
                //} 
                //else {
                    domEvent.on(this._sliderLink, 'focus', this._expand, this);
                //}
            }
            else {
                this._expand();
            }

        },
        _updateValue: function () {
            this.value = this.slider.value;
            if (this.options.showValue) {
                this._sliderValue.innerHTML = this.value;
            }
            //this.options.layers[0].scaleZ(this.value);
            //this.update(this.value);

            //this.options.layers.forEach(function (layer) {
            //    layer.scaleZ(this.value);
            //},this);
            //this._map._layers.forEach(function (layer) {
            //        layer.scaleZ(this.value);
            //},this);
            for (var prop in this._map._layers) {
                if (this._map._layers.hasOwnProperty(prop)) {
                    var layer = this._map._layers[prop];
                    if (layer.declaredClass === "GridLayer" || layer.declaredClass === "DxfLayer" || layer.declaredClass === "DemLayer")
                    layer.scaleZ(this.value);
                }
            }
            this._map.update();
        },

        _expand: function () {          
            this._container.classList.add("gba-control-slider-expanded");
        },
        _collapse: function () {          
            this._container.classList.remove("gba-control-slider-expanded");
        },




        //_increment: function () {
        //    console.log(this.slider.value - this.slider.step + " " + this.slider.value + this.slider.step);
        //    this.slider.value = this.slider.value * 1 + this.slider.step * 1;
        //    this._updateValue();
        //},
        //_decrement: function () {
        //    console.log(this.slider.value - this.slider.step + " " + this.slider.value + this.slider.step);
        //    this.slider.value = this.slider.value * 1 - this.slider.step * 1;
        //    this._updateValue();
        //}

     

  
    });
    return Slider;

});