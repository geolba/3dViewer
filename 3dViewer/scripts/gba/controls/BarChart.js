define('gba/controls/BarChart', ["lib/leaflet/Class", "helper/dom"], function (Class, dom) {
    "use strict";

    //DxfLayer.prototype = {
    var BarChart = Class.extend({

        /**
    	 * constructor: BoreHole
    	 */
        init: function (color, val, valcolor, render, valHeight) {

            // The render type - can be light and full
            this.renderType = render;         
            // the 3D object for the text label
            this.labelobj = null;
            // should we set the wireframe
            this.hasWireframe = false;          
            //this.val = val;          
            ////this.h = 0.5;

            //// rows and column titles
            //this.titles = titles;

            // main cube colour
            this.color = parseInt(color, 16);
            this.htmlcolor = "#" + color;
            //this.lumcolor = colorLuminance(color, 0.5);
            //this.darklumcolor = colorLuminance(color, -0.3);
            this.valcolor = parseInt(valcolor, 16);
                       
            this.alignRight = false;

            //var container = this._container = dom.createDom("table", { "class": "chartTable" });
            //var _tbody = dom.createDom("tbody", {}, this._container);

            this.width = 300;
            this.height = valHeight;// 400;
            this.maxValue;
            this.margin = 100;
            this.colors = ["purple", "red", "green", "yellow"];
            this.curArr = [];
            this.backgroundColor = "#fff";
            this.xAxisLabelArr = ["Bohrloch"];
            this.yAxisLabelArr = ["34"];
            //this.animationInterval = 100;
            //this.animationSteps = 10;
            var container = this._container = dom.createDom("canvas", { "class": "chartCanvas" });
           
        },

        addBar: function (barHeight, color, name) {
            barHeight = barHeight;//*1.5;
            // Simple cube geometry for the bar
            // Parameter 1 : width
            // Parameter 2 : height
            // Parameter 3 : depth

            var barColor = "";
            if (typeof color === "string") {
                barColor = color;
            }
            else {
                barColor = "#" + this._zfill(color.toString(16), 6); //webservicelayer.materialParameter[0].color;
            }

           
            var _tr = dom.createDom("tr", {style: "width:100px;"}, this._container);
            var _profileColumn = dom.createDom("td", {}, _tr);
            //var span = dom.createDom("span", { "class": "tooltip", title: "Beschreibung...", innerHTML: " info" }, _td);
            var geometry = dom.createDom("div", {
                style: "width:25px;height:" + barHeight + "px;background-color:" + barColor + ";",
                //innerHTML: name
            }, _profileColumn);
            //this._container.insertBefore(_tr, this._container.firstChild);


            var _lableColumn = dom.createDom("td", {}, _tr);
            var lable = dom.createDom("div", {
                innerHTML: name,
                style: "width:75px;height:" + barHeight + "px;"
            }, _lableColumn);
        },

        draw: function (arr) {
            //this._container.innerHTML = "";
            var numOfBars = 1;// arr.length;
            var barWidth;
            var barHeight;
            var border = 0;
            var ratio;
            var maxBarHeight;
            var gradient;
            var largestValue;
            var graphAreaX = 0;
            var graphAreaY = 0;
            var graphAreaWidth = this.width;
            var graphAreaHeight = this.height;
            var i;
            var ctx = this._container.getContext("2d");

            // Update the dimensions of the canvas only if they have changed
            if (ctx.canvas.width !== this.width || ctx.canvas.height !== this.height) {
                ctx.canvas.width = this.width;
                ctx.canvas.height = this.height;
            }
            //// Draw the background color white
            //ctx.fillStyle = this.backgroundColor;
            //ctx.fillRect(0, 0, this.width, this.height);

            // If x axis labels exist then make room	
            if (this.xAxisLabelArr.length) {
                graphAreaHeight -= 40;
            }

            // Calculate dimensions of the bar
            barWidth = 15;// graphAreaWidth / numOfBars - this.margin * 2;
            maxBarHeight = graphAreaHeight - 25;//300

            // Determine the largest value in the bar array
            var largestValue = 0;
            for (i = 0; i < arr.length; i += 1) {
                if (arr[i].dist > largestValue) {
                    largestValue = arr[i].dist;
                }
            }

            //// Draw grey bar background
            //ctx.fillStyle = "lightgray";
            //ctx.fillRect(this.margin,
            //  graphAreaHeight - maxBarHeight,
            //  barWidth,
            //  maxBarHeight);

            // For each bar
            for (var i = 0; i < arr.length; i ++) {

                var color = arr[i].color;
                var barColor = "";
                if (typeof color === "string") {
                    barColor = color;
                }
                else {
                    barColor = "#" + this._zfill(color.toString(16), 6); //webservicelayer.materialParameter[0].color;
                }

                //// Set the ratio of current bar compared to the maximum
                //if (this.maxValue) {
                //    ratio = arr[i].dist / this.maxValue;
                //} else {
                //    ratio = arr[i].dist / largestValue;
                //}

                //barHeight = arr[i].dist;// ratio * maxBarHeight;
                barHeight = parseInt((maxBarHeight / 6000) * arr[i].dist);


                var x = this.margin;// this.margin + i * this.width / numOfBars
                var y = graphAreaHeight - barHeight;
                if (i == 0){
                    this.startPointY = y +(barHeight);
                }
             


                // Draw bar color if it is large enough to be visible
                if (barHeight > border * 2) {                 

                    ctx.fillStyle = barColor;// gradient;
                    // Fill rectangle with gradient
                    ctx.fillRect(x + border,
                      y + border,
                      barWidth - border * 2,
                      barHeight - border * 2);
                }
                

                // Write bar value
                if (barHeight > border + 9) {
                ctx.fillStyle = "#333";
                ctx.font = "bold 9px sans-serif";
                //ctx.textAlign = "center";
                // Use try / catch to stop IE 8 from going to error town
                    try {
                        if (arr[i].name !== "Basement") {
                            ctx.fillText("Mächtigkeit " + arr[i].name + ": " + Math.round(arr[i].dist),//.toFixed(2),
                              //i * this.width / numOfBars + (this.width / numOfBars) / 2,
                              x + 30,
                              y + (barHeight / 2) + 4.5);
                        }
                        else {
                            ctx.fillText(arr[i].name,//.toFixed(2),                             
                              x + 30,
                              y + (barHeight / 2) + 4.5);
                        }
                }
                catch (ex) { }
            }

                graphAreaHeight = graphAreaHeight - (barHeight - (border / 2));

                //// Draw bar label if it exists
                //if (this.xAxisLabelArr[i]) {
                //    // Use try / catch to stop IE 8 from going to error town				
                //    ctx.fillStyle = "#333";
                //    ctx.font = "bold 12px sans-serif";
                //    ctx.textAlign = "center";
                //    try {
                //        ctx.fillText(this.xAxisLabelArr[i],
                //          i * this.width / numOfBars + (this.width / numOfBars) / 2,
                //          this.height - 10);
                //    } catch (ex) { }
                //}




            }//for-loop
            if (this.startPointY) {
                ctx.beginPath();
                ctx.moveTo(20, this.startPointY);
                ctx.lineTo(20, this.startPointY - maxBarHeight);
                var startPoint = this.startPointY;
                var iwas = [-5500, -5000, -4500, -4000, -3500, -3000, -2500, -2000, -1500, -1000, -500, 0, 500];
                iwas.forEach(function (item) {
                    var dist = (maxBarHeight / 6000) * 500;

                    ctx.moveTo(20, startPoint);
                    ctx.lineTo(40, startPoint);
                    ctx.font = "10px Arial";
                    ctx.strokeText(item, 55, startPoint + 2.5);
                    startPoint = startPoint - dist;

                });
                //ctx.lineTo(70, 100);
                ctx.stroke();
            }




        },

        getStatTable: function (arr){
            var statTable = dom.createDom("table", { "class": "chartTable" });
            var _headerRow = dom.createDom("tr", { style: "width:100px;" }, statTable);
            var _profileHeaderColumn = dom.createDom("th", {}, _headerRow);
            var _lableHeaderColumn = dom.createDom("th", {}, _headerRow);
            var _minHeaderColumn = dom.createDom("th", {}, _headerRow);
            dom.createDom("div", {
                innerHTML: "UNTERKANTE <br /> (m Seehöhe)",
                style: "width:75px;"
            }, _minHeaderColumn);
            var _maxHeaderColumn = dom.createDom("th", {}, _headerRow);
            dom.createDom("div", {
                innerHTML: "OBERKANTE <br /> (m Seehöhe)",
                style: "width:75px;"
            }, _maxHeaderColumn);

            // For each bar
            //for (var i = 0; i < arr.length; i++) {
            for (var i = arr.length -1; i >= 0; i--) {
               
                var color = arr[i].color;
                var barColor = "";
                if (typeof color === "string") {
                    barColor = color;
                }
                else {
                    barColor = "#" + this._zfill(color.toString(16), 6); //webservicelayer.materialParameter[0].color;
                }
                var _tr = dom.createDom("tr", { style: "width:100px;" }, statTable);

                var _profileColumn = dom.createDom("td", {}, _tr);
                var geometry = dom.createDom("div", {
                    style: "width:20px;height:20px;background-color:" + barColor + ";",
                    //innerHTML: name
                }, _profileColumn);

                var _lableColumn = dom.createDom("td", {}, _tr);
                var lable = dom.createDom("div", {
                    innerHTML: arr[i].name,
                    style: "width:75px;"
                }, _lableColumn);

                var _minColumn = dom.createDom("td", {}, _tr);
                //für den Layer Basement keine Unterkante
                var minLable = "";
                if (arr[i].name !== "Basement") {
                    minLable = dom.createDom("div", {
                        innerHTML: Math.round(arr[i].min),//.toFixed(2),
                        style: "width:75px;"
                    }, _minColumn);
                }
                else {
                    minLable = dom.createDom("div", {
                        innerHTML: "x",
                        style: "width:75px;"
                    }, _minColumn);
                }

                var _maxColumn = dom.createDom("td", {}, _tr);
                var maxLable = dom.createDom("div", {
                    innerHTML: Math.round(arr[i].max),//.toFixed(2),
                    style: "width:75px;"
                }, _maxColumn);

            }
            return statTable;
        },

        _zfill: function (num, len) {
            return (Array(len).join("0") + num).slice(-len);
        },

        //addObject: function (object, queryable) {
        //    if (queryable === undefined) {
        //        queryable = this.q;
        //    }
        //    this.objectGroup.add(object);
        //    //if (queryable) {
        //    //    this._addQueryableObject(object);
        //    //}
        //},

        // function to show the label
        showLabel: function (posx, posy) {

            // Shows 3D label if set
            if (this.hasLabel) {
                this.labelobj.visible = true;
            }

            // Shows HTML Label if set - uses jquery for DOM manipulation
            if (this.hasHTMLLabel) {
                this.hasHTMLLabel.html(this.titles.row +
                                        '<p>' + this.titles.col + ': ' + val + '</p>');
                this.hasHTMLLabel.show();
                // Back transformation of the coordinates
                posx = ((posx + 1) * window.innerWidth / 2);
                posy = -((posy - 1) * window.innerHeight / 2);
                this.hasHTMLLabel.offset({ left: posx, top: posy });
            }

        },

        // function to hide the label
        hideLabel: function () {

            // Hides 3D label if set
            if (this.hasLabel) {
                this.labelobj.visible = false;
            }

            //// Hides HTML Label if set - uses jquery for DOM manipulation
            //if ( this.hasHTMLLabel ) {
            //    this.hasHTMLLabel.hide();
            //}

        },

        //reposition: function (x, y, z) {
        //    this.objectGroup.position.set(x, y, z); //+ (this.height)/2);//35);
        //},

        //reorientation: function (x, y, z) {
        //    this.objectGroup.rotation.set(x, y, z);
        //}

    });

    return BarChart;

});