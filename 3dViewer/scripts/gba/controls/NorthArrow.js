define('gba/controls/NorthArrow', ['three', "lib/leaflet/Class", "helper/utilities"],
    function (THREE, Class, util) {
        "use strict";

       
        var NorthArrow = Class.extend({

            //statische Klassenvriablen und Methoden:
            statics: {

                create: function (options) {
                    var oControl = new NorthArrow(options);
                    return oControl;
                }

            },

            //constructor: NorthArrow,
            init: function (options) {
                             
                this.objectGroup = new THREE.Group();
                this.objectGroup.visible = true;
                this.labels = [];

                util.setOptions(this, options);
               
                this.declaredClass = "NorthArrow";
                
                this.build();
            },

            build: function () {
                var org = new THREE.Vector3(0, 0, 0);
                var headLength = this.options.headLength;//1;
                var headWidth = this.options.headWidth;//1;

                var direction = new THREE.Vector3(1, 0, 0);
                this.objectGroup.add(new THREE.ArrowHelper(direction, org, 6, 0xf00000, headLength, headWidth)); // Red = x

                direction = new THREE.Vector3(0, 1, 0);
                this.objectGroup.add(new THREE.ArrowHelper(direction, org, 6, 0x7cfc00, headLength, headWidth)); // Green = y

                direction = new THREE.Vector3(0, 0, 1);//blue z
                this.objectGroup.add(new THREE.ArrowHelper(direction, org, 6, 0x00bfff, headLength, headWidth)); //8 is the length,  Blue = z; 20 and 10 are head length and width
            },

            buildLabels: function (parentElement) {
                //this.parent = parent;
                this.parentElement = parentElement;

                this.f = [
                    { a: ["x"], cl: "red-label", centroid: [[7, 0, 0]] },
                    { a: ["y"], cl: "green-label",  centroid: [[0,7,0]] },
                    { a: ["z"], cl: "blue-label", centroid: [[0, 0, 7]] }
                ];

                var zFunc, getPointsFunc = function (f) { return f.centroid; };


                // create parent element for labels
                var e = document.createElement("div");
                parentElement.appendChild(e);
                e.style.display = (this.objectGroup.visible) ? "block" : "none";
                this.labelParentElement = e; //lable parent div for this layer

                for (var i = 0, l = this.f.length; i < l; i++) {
                    var f = this.f[i];
                    f.aElems = [];
                    f.aObjs = [];
                    var text = f.a[0];
                    if (text === null || text === "") continue;

                    var classLabel = f.cl;
                    if (classLabel === undefined || classLabel === "") classLabel = "label";

                    //var horizontalShiftLabel = f.hs;
                    //if (horizontalShiftLabel === undefined || horizontalShiftLabel === "") horizontalShiftLabel = 0;

                    var pts = getPointsFunc(f);
                    for (var j = 0, m = pts.length; j < m; j++) {
                        var pt = pts[j];

                        // create div element for label
                        var e = document.createElement("div");
                        e.appendChild(document.createTextNode(text));
                        e.className = classLabel;// "label";
                        this.labelParentElement.appendChild(e);

                        var pt1 = new THREE.Vector3(pt[0] , pt[1], pt[2]);    // top

                        this.labels.push({ labelDiv: e, pt: pt1 });
                    }
                }



            }




        });

        return NorthArrow;

    });