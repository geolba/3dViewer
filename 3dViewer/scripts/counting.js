//note: can also use requireJS in this file - see here for more info: http://requirejs.org/docs/api.html#webworker
importScripts('lib/threejs/three.js', 'gba/tasks/RaycasterVertices.js');

//importScripts('require.js');
//require({
//    //baseUrl: '/scripts',
//    paths: {   
//        //app: 'app',
//        three: 'app/three',
//        threeCore: 'lib/threejs/three',
//    },
//    shim: {
//        'threeCore': { exports: 'THREE' }       
//    }
//}, ['three', 'gba/tasks/RaycasterVertices'], function (THREE, RaycasterVertices) {

    //self.postMessage('in require');

    var borderEdges, graph, indices, vertizes, check;
    self.onmessage = function (event) {
        //if (event.data == "start") {
        
        //graph = event.data.args.graph;
        check = event.data.args.check;
        vertizes = event.data.args.vertices;
        indices = event.data.args.index;
        borderEdges = event.data.args.borderEdges;
        //graph = Raycaster.LAYERS[event.data.index + 1].graph;

        buildTriangleBorder();//and post the message
        //getExtrudedPositions(borderEdges);
    };

    var getExtrudedPositions = function (borderEdges) {

        var raycaster = new RaycasterVertices();
        var j = 0;
        var direction = new THREE.Vector3(0, 0, -1);

        for (var i = 0; i < borderEdges.length; i++) {

            var edge = borderEdges[i];
            edge.border === true;

            if (edge.n1.visited === false) {               
                var intersects = raycaster.identifyObjects3(indices, vertizes, edge.n1.pos, direction, check);
                if (intersects.length > 0) {//&& intersects[0].point.x != 0 && intersects[0].point.y != 0 && intersects[0].point.z != 0) {
                    edge.n1.raycastPos = intersects[0].point;
                    edge.n1.visited = true;
                }
            }

            if (edge.n2.visited === false) {           
                var intersects2 = raycaster.identifyObjects3(indices, vertizes, edge.n2.pos, direction, check);
                if (intersects2.length > 0) {// && intersects2[0].point.x != 0 && intersects2[0].point.y != 0 && intersects2[0].point.z != 0) {
                    edge.n2.raycastPos = intersects2[0].point;
                    edge.n2.visited = true;
                }
            }

            if (edge.n1.visited === true && edge.n2.visited === false) {
                edge.n2.raycastPos = edge.n1.raycastPos;
                //edge.n2.raycastPos = new THREE.Vector3(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                //edge.n2.raycastPos.copy(edge.n1.raycastPos);
                //edge.n2.raycastPos.set(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                edge.n2.visited = true;
            }
            else if (edge.n1.visited === false && edge.n2.visited === true) {
                edge.n1.raycastPos = edge.n2.raycastPos;
                //edge.n1.raycastPos = new THREE.Vector3(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                //edge.n1.raycastPos.copy(edge.n2.raycastPos);
                //edge.n1.raycastPos.set(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                edge.n1.visited = true;
            }
        }//for loop through border edges

        var notExtrudedEdges = borderEdges.filter(function (edge) {
            return edge.n1.visited === false && edge.n2.visited === false;
        });

        if (notExtrudedEdges.length > 0) {
            getExtrudedPositions(borderEdges);
        }
        else {
            buildTriangleBorder2();
        }
    };

    var buildTriangleBorder2 = function () {
        var geometry = new THREE.BufferGeometry();
        var vertices = [];
        //var idx = [];
        //var nullVector = new THREE.Vector3(0, 0, 0);

        //var b = this._getQueryableObjects3();//alle faces vom nächsten Layer
        //var b = graph;
        var raycaster = new RaycasterVertices();
        var j = 0;
        var direction = new THREE.Vector3(0, 0, -1);

        for (var i = 0; i < borderEdges.length; i++) {

            var edge = borderEdges[i];
            edge.border === true;
            if (edge.n1.raycastPos && edge.n2.raycastPos) {
             
                vertices[vertices.length] = edge.n1.pos.x;
                vertices[vertices.length] = edge.n1.pos.y;
                vertices[vertices.length] = edge.n1.pos.z;
                //vertices[vertices.length] = intersects[0].point.x;
                //vertices[vertices.length] = intersects[0].point.y;
                //vertices[vertices.length] = intersects[0].point.z;
                //vertices[vertices.length] = intersects2[0].point.x;
                //vertices[vertices.length] = intersects2[0].point.y;
                //vertices[vertices.length] = intersects2[0].point.z;
                vertices[vertices.length] = edge.n1.raycastPos.x;
                vertices[vertices.length] = edge.n1.raycastPos.y;
                vertices[vertices.length] = edge.n1.raycastPos.z;
                vertices[vertices.length] = edge.n2.raycastPos.x;
                vertices[vertices.length] = edge.n2.raycastPos.y;
                vertices[vertices.length] = edge.n2.raycastPos.z;

                vertices[vertices.length] = edge.n1.pos.x;
                vertices[vertices.length] = edge.n1.pos.y;
                vertices[vertices.length] = edge.n1.pos.z;
                vertices[vertices.length] = edge.n2.pos.x;
                vertices[vertices.length] = edge.n2.pos.y;
                vertices[vertices.length] = edge.n2.pos.z;
                //vertices[vertices.length] = intersects2[0].point.x;
                //vertices[vertices.length] = intersects2[0].point.y;
                //vertices[vertices.length] = intersects2[0].point.z;
                vertices[vertices.length] = edge.n2.raycastPos.x;
                vertices[vertices.length] = edge.n2.raycastPos.y;
                vertices[vertices.length] = edge.n2.raycastPos.z;
            }
        }
        self.postMessage(vertices);
    };

    var buildTriangleBorder = function () {
        var geometry = new THREE.BufferGeometry();
        var vertices = [];
        //var idx = [];
        //var nullVector = new THREE.Vector3(0, 0, 0);

        //var b = this._getQueryableObjects3();//alle faces vom nächsten Layer
        //var b = graph;
        var raycaster = new RaycasterVertices();
        var j = 0;
        var direction = new THREE.Vector3(0, 0, -1);

        for (var i = 0; i < borderEdges.length; i++) {

            var edge = borderEdges[i];
            edge.border === true;

            //var faces = $.grep(b.faces, function (face, i) {
            //    //return face.nodes[0].pos.x > 0 && face.nodes[1].pos.x > 0 && face.nodes[2].pos.x > 0 &&
            //    //    face.nodes[0].pos.y > 0 && face.nodes[1].pos.y > 0 && face.nodes[2].pos.y > 0 &&
            //    //    face.nodes[0].pos.x < xMax && face.nodes[1].pos.x < xMax && face.nodes[2].pos.x < xMax;

            //    var x1 = face.nodes[0].pos.x;
            //    var x2 = face.nodes[1].pos.x;
            //    var x3 = face.nodes[2].pos.x;
            //    var y1 = face.nodes[0].pos.x;
            //    var y2 = face.nodes[1].pos.x;
            //    var y3 = face.nodes[2].pos.x;

            //    var xMin = Math.min(x1, Math.min(x2, x3)) - 0.01;
            //    var yMin = Math.min(y1, Math.min(y2, y3)) - 0.01;

            //    var xMax = Math.max(x1, Math.max(x2, x3)) + 0.01;
            //    var yMax = Math.max(y1, Math.max(y2, y3)) + 0.01;

            //    return !(edge.n1.x < xMin || edge.n1.x > xMax || edge.n1.y < yMin || edge.n1.y > yMax);

            //});


            if (edge.n1.visited === false) {
                //var faces = null;
                //if (edge.n1.pos.x < 0 && edge.n1.pos.y >= 0) {
                //    faces = b.firstQuartalFaces;
                //}
                //else if (edge.n1.pos.x >= 0 && edge.n1.pos.y >= 0) {
                //    faces = b.secondQuartalFaces;
                //}
                //else if (edge.n1.pos.x < 0 && edge.n1.pos.y < 0) {
                //    faces = b.thirdQuartalFaces;
                //}
                //else if (edge.n1.pos.x >= 0 && edge.n1.pos.y < 0) {
                //    faces = b.fourthQuartalFaces;
                //}
                //else { continue;}

                //var raycaster = new Raycaster(edge.n1.pos, direction);
                var intersects = raycaster.identifyObjects3(indices, vertizes, edge.n1.pos, direction, check);
                if (intersects.length > 0) {//&& intersects[0].point.x != 0 && intersects[0].point.y != 0 && intersects[0].point.z != 0) {
                    edge.n1.raycastPos = intersects[0].point;
                    edge.n1.visited = true;
                }
            }


            if (edge.n2.visited === false) {
                //var faces = null;
                //if (edge.n2.pos.x < 0 && edge.n2.pos.y >= 0) {
                //    faces = b.firstQuartalFaces;
                //}
                //else if (edge.n2.pos.x >= 0 && edge.n2.pos.y >= 0) {
                //    faces = b.secondQuartalFaces;
                //}
                //else if (edge.n2.pos.x < 0 && edge.n2.pos.y < 0) {
                //    faces = b.thirdQuartalFaces;
                //}
                //else if (edge.n1.pos.x >= 0 && edge.n1.pos.y < 0) {
                //    faces = b.fourthQuartalFaces;
                //}
                ////else { continue; }

                //var raycaster = new Raycaster(edge.n2.pos, direction);
                var intersects2 = raycaster.identifyObjects3(indices, vertizes, edge.n2.pos, direction, check);
                if (intersects2.length > 0) {// && intersects2[0].point.x != 0 && intersects2[0].point.y != 0 && intersects2[0].point.z != 0) {
                    edge.n2.raycastPos = intersects2[0].point;
                    edge.n2.visited = true;
                }
            }



            if (edge.n1.visited === true && edge.n2.visited === false) {
                edge.n2.raycastPos = edge.n1.raycastPos;
                //edge.n2.raycastPos = new THREE.Vector3(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                //edge.n2.raycastPos.copy(edge.n1.raycastPos);
                //edge.n2.raycastPos.set(edge.n2.x, edge.n2.y, edge.n1.raycastPos.z);
                edge.n2.visited = true;
            }
            else if (edge.n1.visited === false && edge.n2.visited === true) {
                edge.n1.raycastPos = edge.n2.raycastPos;
                //edge.n1.raycastPos = new THREE.Vector3(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                //edge.n1.raycastPos.copy(edge.n2.raycastPos);
                //edge.n1.raycastPos.set(edge.n1.x, edge.n1.y, edge.n2.raycastPos.z);
                edge.n1.visited = true;
            }



            //if (edge.n1.visited == false && edge.n2.visited == false) {
            //    //alert("test");                    
            //    var previousEdge = borderEdges[i - 1];
            //    //edge.n1.raycastPos = previousEdge.n2.visited === true ? previousEdge.n2.raycastPos : previousEdge.n1.raycastPos;
            //    //edge.n1.visited = true;

            //    if (previousEdge.n2.visited === true) {

            //        edge.n1.raycastPos = previousEdge.n2.raycastPos;//new THREE.Vector3(edge.n1.x, edge.n1.y, previousEdge.n2.raycastPos.z); //previousEdge.n2.raycastPos;
            //        edge.n1.visited = true;

            //        edge.n2.raycastPos = previousEdge.n2.raycastPos;//new THREE.Vector3(edge.n2.x, edge.n2.y, previousEdge.n2.raycastPos.z); //previousEdge.n2.raycastPos;
            //        edge.n2.visited = true;
            //    }
            //    else if (previousEdge.n1.visited === true) {

            //        edge.n1.raycastPos = previousEdge.n1.raycastPos; //new THREE.Vector3(edge.n1.x, edge.n1.y, previousEdge.n1.raycastPos.z); //previousEdge.n1.raycastPos;
            //        edge.n1.visited = true;

            //        edge.n2.raycastPos = previousEdge.n1.raycastPos; //new THREE.Vector3(edge.n2.x, edge.n2.y, previousEdge.n1.raycastPos.z); // previousEdge.n1.raycastPos;
            //        edge.n2.visited = true;
            //    }
            //}



            //if (intersects.length > 0 && intersects2.length > 0) {
            if (edge.n1.raycastPos && edge.n2.raycastPos) {
                ////vertices.push(edge.n1.pos, intersects[0].point);
                ////vertices.push(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
                vertices[vertices.length] = edge.n1.pos.x;
                vertices[vertices.length] = edge.n1.pos.y;
                vertices[vertices.length] = edge.n1.pos.z;
                //vertices[vertices.length] = intersects[0].point.x;
                //vertices[vertices.length] = intersects[0].point.y;
                //vertices[vertices.length] = intersects[0].point.z;
                //vertices[vertices.length] = intersects2[0].point.x;
                //vertices[vertices.length] = intersects2[0].point.y;
                //vertices[vertices.length] = intersects2[0].point.z;
                vertices[vertices.length] = edge.n1.raycastPos.x;
                vertices[vertices.length] = edge.n1.raycastPos.y;
                vertices[vertices.length] = edge.n1.raycastPos.z;
                vertices[vertices.length] = edge.n2.raycastPos.x;
                vertices[vertices.length] = edge.n2.raycastPos.y;
                vertices[vertices.length] = edge.n2.raycastPos.z;

                vertices[vertices.length] = edge.n1.pos.x;
                vertices[vertices.length] = edge.n1.pos.y;
                vertices[vertices.length] = edge.n1.pos.z;
                vertices[vertices.length] = edge.n2.pos.x;
                vertices[vertices.length] = edge.n2.pos.y;
                vertices[vertices.length] = edge.n2.pos.z;
                //vertices[vertices.length] = intersects2[0].point.x;
                //vertices[vertices.length] = intersects2[0].point.y;
                //vertices[vertices.length] = intersects2[0].point.z;
                vertices[vertices.length] = edge.n2.raycastPos.x;
                vertices[vertices.length] = edge.n2.raycastPos.y;
                vertices[vertices.length] = edge.n2.raycastPos.z;



                j = j + 12;

                ////vertices[vertices.length] = edge.n1.pos.y;
                ////vertices[vertices.length] = edge.n1.pos.z;
                ////vertices[vertices.length] = intersects[0].point.x;
                ////vertices[vertices.length] = intersects[0].point.y;
                ////vertices[vertices.length] = intersects[0].point.z;

                // geometry.vertices.push(
                //    edge.n1.pos,
                //    intersects[0].point,
                //    edge.n2.pos,
                //    intersects2[0].point
                //);
                // var face = new THREE.Face3(j, j + 1, j + 3);                        
                // geometry.faces.push(face);
                // face = new THREE.Face3(j, j + 2, j + 3);
                // geometry.faces.push(face);
                // j = j + 4;
            }


        } //for loop borderEdges
        //var positions = new Float32Array(vertices);
        //var position = new THREE.Float32Attribute(positions, 3);
        //geometry.addAttribute('position', position);

        self.postMessage(vertices);
        self.close();
    };
   

    var i = 0;
    function timedCount() {
        //i = i + 1;
        //postMessage(i);
        //setTimeout("timedCount()", 50);



        //for (var i = 0; i < borderEdges.length; i++) {
        setTimeout(function () {

            var edge = borderEdges[i];
            edge.border === true;
            postMessage(edge.n1.pos.x);

            i++;                     //  increment the counter
            if (i < borderEdges.length) {            //  if the counter < 10, call the loop function
                timedCount();             //  ..  again which will trigger another 
            }

        }, 500);

        
        //}
    }




//});