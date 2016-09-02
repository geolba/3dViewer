//// Start the app
//require(['detector', 'app', 'container'], function (Detector, app, container) {
//    if (!Detector.webgl) {
//        Detector.addGetWebGLMessage();
//        container.innerHTML = "";
//    }

//    // Initialize our app and start the animation loop (animate is expected to call itself)
//    app.init();
//    app.animate();
//});

var width = window.innerWidth;
var height = window.innerHeight;

// create a scene, that will hold all our elements such as objects, cameras and lights.
var scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xeeeeee));

// show axes in the screen
var axes = new THREE.AxisHelper(200);
scene.add(axes);

// create a camera, which defines where we're looking at.
var angle = 45;
var aspect = width / height;
var near = 0.1;
var far = 1000;
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, -50, 50);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

var terrainLoader = new THREE.TerrainLoader();
terrainLoader.load('../assets/reer.jpg', function (data) {

    var widthSegments = 4;
    var heightSegements = 4;
    var geometry = new THREE.PlaneGeometry(60, 60, 4, 4); //width, height, widthSegments, heightSegements

    var xPixel = widthSegments + 1; //5
    var yPixel = heightSegements + 1; //5
    var countPixel = xPixel * yPixel; //25

    //erste Reihe 5 Pixel bei 4 Segementen
    geometry.vertices[0].z = 12;//countPixel/xPixel*0
    geometry.vertices[1].z = 12;
    geometry.vertices[2].z = 12;
    geometry.vertices[3].z = 12;
    geometry.vertices[4].z = 5; //(countPixel/xPixel*0) + widthSegments

    //zweite Reihe 
    geometry.vertices[5].z = 1; //countPixel/xPixel*1
    geometry.vertices[6].z = 2;
    geometry.vertices[7].z = 2;
    geometry.vertices[8].z = 1;
    geometry.vertices[9].z = 2; //(countPixel/xPixel*1) + 4 widthSegments

    //dritte Reihe 
    geometry.vertices[10].z = 2; //countPixel/xPixel*2
    geometry.vertices[11].z = 1;
    geometry.vertices[12].z = 0;
    geometry.vertices[13].z = 1;
    geometry.vertices[14].z = 1;//(countPixel/xPixel*2)+ widthSegments

    //vierte Reihe 
    geometry.vertices[15].z = 5; //countPixel/xPixel*3
    geometry.vertices[16].z = 5;
    geometry.vertices[17].z = 5;
    geometry.vertices[18].z = 5;
    geometry.vertices[19].z = 5; //(countPixel/xPixel*3)+ widthSegments

    //fünfte Reihe 
    geometry.vertices[20].z = 0; //countPixel/xPixel*4
    geometry.vertices[21].z = 0;
    geometry.vertices[22].z = 0;
    geometry.vertices[23].z = 0;
    geometry.vertices[24].z = 0; //(countPixel/xPixel*4)+ widthSegments



    //faces = 32 -> 4*4 Segement * 2
    geometry.vertices[24].z = 5; //Anzahl vertices = (widthSegments+1)* (heightSegements+1)
  
    //for (var i = 0, l = geometry.vertices.length; i < l; i++) {
    //    //var value = data[i];
    //    //var height = Math.round(value / 65535 * 2470);
    //    //geometry.vertices[i].z = data[i] / 65535 * 5;
    //    geometry.vertices[i].z = data[5] / 65535 * 5;
    //}

    //var material = new THREE.MeshPhongMaterial({
    //    map: THREE.ImageUtils.loadTexture('../assets/jotunheimen-texture.jpg')
    //});

    //var material = new THREE.MeshPhongMaterial({
    //    color: 0xdddddd,
    //    wireframe: true
    //});
    //var plane = new THREE.Mesh(geometry, material);
   
    //scene.add(plane);


    //scene.add(wireframe);

    var geometry2 = new THREE.PlaneGeometry(60, 60, 4, 4);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        //var value = data[i];
        //var height = Math.round(value / 65535 * 2470);
        //geometry.vertices[i].z = data[i] / 65535 * 5;
        geometry2.vertices[i].z = geometry.vertices[i].z - 20;
    }
    //var plane2 = new THREE.Mesh(geometry2, material);
    //scene.add(plane2);

    geometry.merge(geometry2);
    var material = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
        wireframe: true
    });
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    //// position and point the camera to the center of the scene
    //camera.position.x = 0;
    //camera.position.y = 0;
    //camera.position.z = 100;
    //camera.lookAt(scene.position);

    // add the output of the renderer to the html element
    //document.getElementById("WebGL-output").appendChild(renderer.domElement);

    //// render the scene
    //renderer.render(scene, camera);


});

var controls = new THREE.TrackballControls(camera);

document.getElementById('WebGL-output').appendChild(renderer.domElement);

//// render the scene
//render();

//function render() {
//    controls.update();
//    requestAnimationFrame(render);
//    renderer.render(scene, camera);
//}
render();
function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
