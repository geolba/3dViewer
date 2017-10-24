// Filename: Legend.js 
define('gba/controls/Legend', ["jquery", "lib/leaflet/Class", "helper/dom", "helper/domEvent"
], function ($, Class, dom, domEvent) {
    "use strict";
    /**
   * @class module.Legend
   *
   * Dialog
   *
   */

    var Legend = Class.extend({

        init: function (layers, map) {
            this.layers = layers;
            this.map = map;

            this.id = 'legendDiv';
            ////build html:
            this.ownerDocumentBody = document.getElementById(this.id);
            this._createLegend(layers);

            //map.on('border-change', this.refresh.bind(this));
        },

        _refresh: function (data) {
            //$("#legendDiv").html("");
            //this._createLegend(this.map.dataservice.layers);
            var webservicelayer = data.target;
            var title = webservicelayer.name;
            if (webservicelayer.borderVisible == false) {
                title = "Oberkante " + webservicelayer.name;
            }
            var _td = document.getElementById(webservicelayer.name + "_" + webservicelayer.index);
            if (_td) {
                _td.innerHTML = title;
                //add info for description:
                if (webservicelayer.description.abstract) {
                    //var description = webservicelayer.description ? webservicelayer.description.abstract : "keine Beschreibung"
                    var description = webservicelayer.description.abstract;
                    var span = dom.createDom("span", { "class": "tooltip", title: description, innerHTML: " info" }, _td);
                }
            }
        },

        _createLegend: function (layers) {
            //var mapScale = this.map.getScale();
            //var a = false;
            //domStyle.set(this.domNode, "position", "relative");
            dom.setProperties(this.ownerDocumentBody, { style: "position: relative;" });
            //domConstruct.create("div", { id: this.id + "_msg", innerHTML: this.NLS_creatingLegend + "..." }, this.domNode);
            dom.createDom("div", { id: this.id + "_msg", innerHTML: "Legende wird erstellt" + "..." }, this.ownerDocumentBody);

            var legendResponse = this._buildManuallyLegendResponseImg();
            //WebService-Überschrift generieren:
            this.newDiv = dom.createDom('div', { id: this.id }, this.ownerDocumentBody);
            var table = dom.createDom('table', { width: "95%" }, this.newDiv);
            var tblBody = dom.createDom("tbody", {}, table);
            var row = dom.createDom("tr", {}, tblBody);
            var td = dom.createDom("td", { align: this.alignRight ? "right" : "left" }, row);
            dom.createDom("span", { innerHTML: "LEGENDE", "class": "gbaLegendServiceLabel" }, td);

            //this._processLegendResponse(layers[1], legendResponse);
            layers.forEach(function (layer) {

                layer.addListener('border-change', this._refresh, this);

                this._processLegendResponse(layer, legendResponse);
            }, this);

        },

        _processLegendResponse: function (layer, legendResponse) {
            if (legendResponse && legendResponse.layers) {

                layer.legendResponse = legendResponse;

                //WebService-Überschrift generieren:
                this.newDiv = dom.createDom('div', { id: this.id + "_" + layer.index }, this.ownerDocumentBody);
                //var table = dom.createDom('table', { width: "95%" }, this.newDiv);
                //var tblBody = dom.createDom("tbody", {}, table);
                //var row = dom.createDom("tr", {}, tblBody);
                //var td = dom.createDom("td", { align: this.alignRight ? "right" : "left" }, row);
                //dom.createDom("span", { innerHTML: "LEGENDE", "class": "gbaLegendServiceLabel" }, td);  

                this._createLegendForLayer(layer);
            }
            else {
                console.log("Legend could not get generated for " + layer.url);
            }
        },

        _createLegendForLayer: function (layer) {
            if (layer.legendResponse || layer.renderer) {
                var b = false;

                if (layer.legendResponse) {
                    var layerInfos = layer.layerInfos;
                    //map services:
                    if (layerInfos !== undefined && layerInfos.length > 0) {

                        array.forEach(layerInfos, function (layerInfo, layerIndex) {
                            if (!layer._hideLayersInLegend || -1 === array.indexOf(layer._hideLayersInLegend, layerInfo.id)) {
                                var boolResponse = this._buildWebservicelayerHeadings(layer, layerInfo, layerIndex);
                                b = b || boolResponse;
                            }
                        }, this);
                    }
                        //DxfLayer:
                    else {
                        if ("DxfLayer" === layer.declaredClass) {

                            b = this._buildWebservicelayerHeadings(layer, { id: 0, name: null, title: layer.name, subLayerIds: null, parentLayerId: -1 }, 0);
                        }
                    }

                }

                if (b === true) {
                    dom.setProperties(document.getElementById(this.id + "_" + layer.index), { style: "display: block;" });
                    dom.setProperties(document.getElementById(this.id + "_msg"), { style: "display: none;" });
                }
            }

        },

        _buildWebservicelayerHeadings: function (mainLayer, layerInfo, layerIndex) {
            var e = false;
            var d = this.newDiv;
            var parentLayerId = layerInfo.parentLayerId;
            var grundDiv;
            //var mapScale = this.map.getScale();
            var _id, _class1, _attributes, _refNode, _tr;
            //if (layerInfo.subLayerIds) {
            //}
            //einfache layer und sichtbare sub-layer:
            if (!layerInfo.subLayerIds) {
                //nicht sichtbare Layer/Sublayer ausschließen:
                if (mainLayer.visibleLayers && -1 === ("," + webservicelayer.visibleLayers + ",").indexOf("," + layerInfo.id + ",")) {
                    return e;
                }

                //atrributes
                _id = this.id + "_" + mainLayer.index + "_" + layerInfo.id;
                //_class1;
                if (-1 < parentLayerId) {
                    _class1 = "esriLegendLeft";
                }
                else {
                    _class1 = "";
                }
                _attributes = { id: _id, style: "display: visible;", "class": _class1 };
                _refNode = -1 === parentLayerId ? d : dom.byId(this.id + "_" + webservicelayer.id + "_" + parentLayerId + "_group");

                grundDiv = dom.createDom("div", _attributes, _refNode);
                //domStyle.set(dom.byId(_id), "display", "visible");
                dom.setProperties(document.getElementById(_id), { style: "display: visible;" });

                //unnötig
                var _table = dom.createDom("tbody", {}, dom.createDom("table", { width: "95%", "class": "gbaLegendLayerLabel" }, grundDiv));
                _tr = dom.createDom("tr", {}, _table);
                dom.createDom("td", { innerHTML: layerInfo.name ? layerInfo.name : "", align: this.alignRight ? "right" : "left" }, _tr);

                //e = e || this._buildLegendItems_Tools(layer, b, grundDiv);
                e = this._buildLayerLegendItems(mainLayer, layerInfo, grundDiv);
                //}
            }

            return e;

        },

        _buildLayerLegendItems: function (webservicelayer, layerInfo, grundDiv) {

            var hasLegendResponse = false;

            var _getLegendResponseForSpecificLayer = function (legendResponseLayers, layerInfo) {
                var c, d;
                for (c = 0; c < legendResponseLayers.length; c++) {
                    if (layerInfo.dynamicLayerInfos) {
                        for (d = 0; d < layerInfo.dynamicLayerInfos[d].length; d++) {

                            if (layerInfo.dynamicLayerInfos[d].mapLayerId === legendResponseLayers[c].layerId) {
                                return legendResponseLayers[c];
                            }

                        }
                    }
                    else if (layerInfo.id === legendResponseLayers[c].layerId) {
                        return legendResponseLayers[c];
                    }
                }


                return {};
            };
            var legendResponsesForLayer = _getLegendResponseForSpecificLayer(webservicelayer.legendResponse.layers, layerInfo).legend;
            if (legendResponsesForLayer) {
                var _table = dom.createDom("table", { cellpadding: 0, cellspacing: 0, width: "95%", "class": "gbaLegendLayer" }, grundDiv);
                var _tbody = dom.createDom("tbody", {}, _table);

                //dom.createDom("tr", { "class": "RowToClick" }, _tbody);
                ////domConstruct.create("td", { innerHTML: '', align: this.alignRight ? "right" : "left" }, _tr);
                var rowVisibility = "row-table";

                //array.forEach(legendResponsesForLayer, function (legendResponseRow) {
                //$.each(legendResponsesForLayer, function (index, legendResponseRow) {
                legendResponsesForLayer.forEach(function (legendResponseRow) {
                    hasLegendResponse = true;
                    this._buildRowCheckbox(legendResponseRow, _tbody, webservicelayer, layerInfo.id, rowVisibility);
                }, this);
            }

            if (hasLegendResponse) {
                //domStyle.set(dom.byId(this.id + "_" + webservicelayer.id + "_" + layerInfo.id), "display", "visible");
                dom.setProperties(document.getElementById(this.id + "_" + webservicelayer.index + "_" + layerInfo.id), { style: "display: visible;" });
            }
            return hasLegendResponse;
        },

        _buildRowCheckbox: function (legendResponseRow, tbody, webservicelayer, e, rowVisibility) {

            var legendEntryRow = dom.createDom("tr", {}, tbody);
            //domStyle.set(legendEntryRow, 'display', rowVisibility);
            dom.setProperties(legendEntryRow, { style: "display: row-table;" });

            var imgDataCell, lblDataCell;

            if (this.alignRight) {
                lblDataCell = dom.createDom("td", { align: "right" }, legendEntryRow);
                imgDataCell = dom.createDom("td", { align: "right", width: 35 }, legendEntryRow);
            }
            else {
                //chkDataCell = dom.createDom("td", { width: 25, "class": "checkboxFive" }, legendEntryRow);
                imgDataCell = dom.createDom("td", { width: 25 }, legendEntryRow);
                lblDataCell = dom.createDom("td", {}, legendEntryRow);
            }

            //var checkbox = dom.createDom("input", { type: 'checkbox', checked: webservicelayer.visible, "id": webservicelayer.index }, chkDataCell); 
            //var stop = domEvent.stopPropagation;
            //domEvent
            //    .on(checkbox, 'click', stop)
            //    //.on(checkbox, 'click', domEvent.preventDefault)
            //    .on(checkbox, 'click', function (e) {
            //        var isChecked = checkbox.checked;
            //        webservicelayer.setVisible(isChecked);
            //        this.map.update();
            //    }, this);
            //var chkLabel = dom.createDom("label", { for: webservicelayer.index }, chkDataCell);         



            //legend entry image:
            //var imgSrc = legendResponseRow.url;         
            //imgSrc = "data:image/png;base64," + legendResponseRow.imageData;       
            //dom.createDom("img", { src: imgSrc, border: 0, style: "opacity:" + webservicelayer.opacity }, imgDataCell);
            var color = this._zfill(webservicelayer.materialParameter[0].color.toString(16), 6); //webservicelayer.materialParameter[0].color;

            dom.createDom("div", { style: "width: 20px; height: 20px; background-color:#" + color + "; opacity:" + webservicelayer.opacity }, imgDataCell);

            //legend entry label
            var _table = dom.createDom("table", { width: "95%", dir: "ltr" }, lblDataCell);
            var _tbody = dom.createDom("tbody", {}, _table);
            var _tr = dom.createDom("tr", {}, _tbody);
            //dom.createDom("td", { innerHTML: legendResponseRow.label, align: this.alignRight ? "right" : "left" }, _tr);
            var title = webservicelayer.name;
            if (webservicelayer.borderVisible == false) {
                title = "Oberkante " + webservicelayer.name;
            }
            var _td = dom.createDom("td", { id: webservicelayer.name + "_" + webservicelayer.index, innerHTML: title, align: this.alignRight ? "right" : "left" }, _tr);

            //add info for description:
            if (webservicelayer.description.abstract) {
                //var description = webservicelayer.description ? webservicelayer.description.abstract : "keine Beschreibung"
                var description = webservicelayer.description.abstract;
                var span = dom.createDom("span", { "class": "tooltip", title: description, innerHTML: " info" }, _td);
            }
        },

        _setLayerVisibility: function (webservicelayer, isChecked) {
            //var isChecked = this.checked;
            webservicelayer.setVisible(isChecked);
        },

        _buildTableRow: function (legendResponseRow, tbody, webservicelayer, e, rowVisibility) {
            var legendEntryRow = dom.createDom("tr", {}, tbody);
            //domStyle.set(legendEntryRow, 'display', rowVisibility);
            dom.setProperties(legendEntryRow, { style: "display: row-table;" });

            var imgDataCell, lblDataCell, chkDataCell;

            if (this.alignRight) {
                lblDataCell = dom.createDom("td", { align: "right" }, legendEntryRow);
                imgDataCell = dom.createDom("td", { align: "right", width: 35 }, legendEntryRow);
            }
            else {
                chkDataCell = dom.createDom("td", { width: 25, "class": "checkboxFive" }, legendEntryRow);
                imgDataCell = dom.createDom("td", { width: 25 }, legendEntryRow);
                lblDataCell = dom.createDom("td", {}, legendEntryRow);
            }

            var checkbox = dom.createDom("input", { type: 'checkbox', checked: webservicelayer.visible, "id": webservicelayer.index }, chkDataCell);
            checkbox.onclick = function () {
                var isChecked = this.checked;
                webservicelayer.setVisible(checkbox.checked);
            };
            dom.createDom("label", { for: webservicelayer.index }, chkDataCell);



            //legend entry image:
            //var imgSrc = legendResponseRow.url;         
            //imgSrc = "data:image/png;base64," + legendResponseRow.imageData;       
            //dom.createDom("img", { src: imgSrc, border: 0, style: "opacity:" + webservicelayer.opacity }, imgDataCell);
            var color = this._zfill(webservicelayer.materialParameter[0].color.toString(16), 6); //webservicelayer.materialParameter[0].color;

            dom.createDom("div", { style: "width: 20px; height: 20px; background-color:#" + color + "; opacity:" + webservicelayer.opacity }, imgDataCell);

            //legend entry label
            var _table = dom.createDom("table", { width: "95%", dir: "ltr" }, lblDataCell);
            var _tbody = dom.createDom("tbody", {}, _table);
            var _tr = dom.createDom("tr", {}, _tbody);
            //dom.createDom("td", { innerHTML: legendResponseRow.label, align: this.alignRight ? "right" : "left" }, _tr);
            var _td = dom.createDom("td", { innerHTML: webservicelayer.name, align: this.alignRight ? "right" : "left" }, _tr);
            var span = dom.createDom("span", { "class": "tooltip", title: "Beschreibung...", innerHTML: " info" }, _td);
        },

        _zfill: function (num, len) {
            return (Array(len).join("0") + num).slice(-len);
        },

        _buildManuallyLegendResponseImg: function () {

            var legendResponse = {
                "layers": [
                 {
                     "layerId": 0,
                     "layerName": "Test/MD_Gebietskarten",
                     "layerType": "Raster Layer",
                     "minScale": 0,
                     "maxScale": 0,
                     "legendType": "RGB Composite",
                     "legend": [
                      {
                          "label": "Red:    Band_1",
                          "url": "2929cfae2efac980ef6c9ea09223463e",
                          "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAAAAAAAAAHqZRakAAAANUlEQVQ4jWPMy8v7z0BFwMLAwMAwcdIkqhiWn5fHwEQVk5DAqIGjBo4aOGrgqIEQwEjtKgAATl0Hu6JrzFUAAAAASUVORK5CYII=",
                          "contentType": "image/png",
                          "height": 20,
                          "width": 20
                      }
                     ]
                 }
                ]
            };

            return legendResponse;
        },

    });

    return Legend;


});