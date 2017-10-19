define('gba/controls/Coordinates', [
    "lib/leaflet/Control", "helper/dom", "helper/domEvent", "jquery", "lib/proj4js/proj4js-amd", 'three'
],
function (
   Control, dom, domEvent, $, Proj4js, THREE
) {
    var Coordinates = Control.extend({

        options: {
            position: 'bottomright',
            separator: ' : ',
            emptyString: 'Unavailable',
            lngFirst: false,
            numDigits: 5,
            lngFormatter: undefined,
            latFormatter: undefined,
            prefix: ""
        },

        onAdd: function (map) {
            //this._container = L.DomUtil.create('div', 'gba-control-coordinates');
            this._container = dom.createDom("div", { "class": "gba-control-coordinates" });
            //map.on('mousemove', this._onMouseMove, this);
            map.on('mouse-move', this._onMouseMove, this);
            //this._container.innerHTML = this.options.emptyString;
            return this._container;
        },

        onRemove: function (map) {
            map.off('mouse-move', this._onMouseMove, this);
        },

        _onMouseMove: function (event) {
            var canvasOffset = $(this._map.domElement).offset();
            var offsetX = event.clientX - canvasOffset.left;
            var offsetY = event.clientY - canvasOffset.top;
            var width = this._map.domElement.clientWidth;
            var height = this._map.domElement.clientHeight;

            var x = (offsetX / width) * 2 - 1;
            var y = -(offsetY / height) * 2 + 1;
            var vector = new THREE.Vector3(x, y, 1);
            vector.unproject(this.options.camera);
            //var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
            //var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
            //var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
            //var prefixAndValue = this.options.prefix + ' ' + value;

            // clicked coordinates: skalierung wieder wegrechnen:
            var pt = this.options.dataservice.toMapCoordinates(vector.x, vector.y, 1);
            var dest = new Proj4js.Proj("EPSG:4326");
            var source = new Proj4js.Proj(this.options.dataservice.crs);
            var minPoint = { x: pt.x, y: pt.y, spatialReference: { wkid: 31256 } };
            var point84 = Proj4js.transform(source, dest, minPoint);
            var koordx = this._dec2sex(point84.x, 'X');
            var koordy = this._dec2sex(point84.y, 'y');
            //document.getElementById("info").innerHTML = "LON: " + koordx + ", " + "LAT: " + koordy;
            this._container.innerHTML = "LON: " + koordx + ", " + "LAT: " + koordy;
        },

        _dec2sex: function (dec, dir) {
            var plus = Math.abs(dec);
            var degr = Math.floor(plus);
            var minu = Math.floor(60 * (plus - degr));
            var sec = Math.floor(60 * (60 * (plus - degr) - minu));
            var compass = "?";
            if (minu < 10) {
                minu = "0" + minu;
            }
            if (sec < 10) {
                sec = "0" + sec;
            }
            if (dir === 'y') {
                compass = dec < 0 ? "S" : "N";
            }
            else {
                compass = dec < 0 ? "W" : "E";
            }
            return "" + degr + "° " + minu + "' " + sec + '" ' + compass;
        }

    });
    return Coordinates;
});