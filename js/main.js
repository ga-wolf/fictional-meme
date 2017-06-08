var app = app || {};
app.step = 0;

var randomNum = function(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

var randomHex = function() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

app.createParticles = function() {
  var NUM_OF_PARTICLES = 20000;
  var NUM_OF_PARTICLE_TYPES = 20;
  app.geometry = new THREE.Geometry();
  for (var i = 1; i <= NUM_OF_PARTICLES / 10; i += 1) {
    var vertex = new THREE.Vector3();
    vertex.x = randomNum(-1000, 1000);
    vertex.y = randomNum(-1000, 1000);
    vertex.z = randomNum(-1000, 1000);
    app.geometry.vertices.push(vertex);
  }
  app.pointsCollection = [];
  for (var i = 1; i <= NUM_OF_PARTICLE_TYPES; i += 1) {
    var size = randomNum(1, 6);
    var size = randomNum(1, 20);
    var hue = randomNum(0, 360);
    var loader = new THREE.TextureLoader();
    loader.load(Math.random() > 0.5 ? "bill.png" : "haylivia.png", function(
      texture
    ) {
      // console.log(texture);
      var material = new THREE.PointsMaterial({
        size: size,
        map: texture,
        // color: new THREE.Color(`hsl(${hue}, 100%, 50%)`),
        // blending: THREE.AdditiveBlending,
        transparent: true,
        alphaTest: 0.5
      });
      var points = new THREE.Points(app.geometry, material);
      points.hue = hue;
      points.rotation.x = randomNum(1, 6);
      points.rotation.y = randomNum(1, 6);
      points.rotation.z = randomNum(1, 6);
      app.scene.add(points);
      app.pointsCollection.push(points);
    });
  }
};

app.addStats = function() {
  var stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";

  var statsEl = document.querySelector("#stats");
  statsEl.appendChild(stats.domElement);

  return stats;
};

app.controller = new function() {
  this.rotationSpeed = 0.05;
  this.bouncingSpeed = 0.02;
  return this;
}();

app.animate = function() {
  app.stats.update();

  app.cube.rotation.x += app.controller.rotationSpeed;
  app.cube.rotation.y += app.controller.rotationSpeed;
  app.cube.rotation.z += app.controller.rotationSpeed;

  app.step += app.controller.bouncingSpeed;
  var desiredY = 4 + 10 * Math.abs(Math.sin(app.step));
  app.sphere.position.y = desiredY;

  app.cube.position.y = desiredY - 2;

  var desiredX = 20 + 10 * Math.cos(app.step);
  app.sphere.position.x = desiredX;

  app.pointsCollection.forEach(function(points) {
    points.hue += 1.5;
    // points.material.color = new THREE.Color(`hsl(${points.hue}, 100%, 50%)`);
    points.rotation.x += 0.001;
    points.rotation.y += 0.001;
    points.rotation.z += 0.001;
  });

  app.renderer.render(app.scene, app.camera);
  app.controls.update();

  requestAnimationFrame(app.animate);
};

app.addLight = function() {
  app.pointLight = new THREE.PointLight(0xffffff);
  app.pointLight.position.set(15, 30, 10);

  app.pointLight.shadow.mapSize.width = 1024;
  app.pointLight.shadow.mapSize.height = 1024;

  app.pointLight.castShadow = true;

  app.scene.add(app.pointLight);
};

app.addSphere = function(radius, position) {
  // radius, horizontal segments, vertical segments
  var sphereGeometry = new THREE.SphereGeometry(radius, 60, 60);
  var sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0x039be5,
    wireframe: Math.random() < 0.5
  });
  app.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  app.sphere.castShadow = true;
  app.sphere.position.x = position.x;
  app.sphere.position.y = position.y;
  app.sphere.position.z = position.z;

  app.scene.add(app.sphere);
};

app.addCube = function(position) {
  var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  var cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xff8f00,
    wireframe: Math.random() < 0.5
  });
  app.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  app.cube.castShadow = true;
  app.cube.position.x = position.x;
  app.cube.position.y = position.y;
  app.cube.position.z = position.z;

  app.scene.add(app.cube);
};

app.init = function() {
  // This is the memory storage of all 3D stuff belongs
  app.scene = new THREE.Scene();

  app.width = window.innerWidth;
  app.height = window.innerHeight;

  // fov, aspect ratio, near, far
  app.camera = new THREE.PerspectiveCamera(
    45,
    app.width / app.height,
    0.1,
    1000
  );
  app.camera.position.x = -30;
  app.camera.position.y = 40;
  app.camera.position.z = 30;

  app.camera.lookAt(app.scene.position);

  app.renderer = new THREE.WebGLRenderer();
  app.renderer.setClearColor(0xeceff1);
  app.renderer.shadowMap.enabled = true;
  app.renderer.setPixelRatio(window.devicePixelRatio || 1);
  app.renderer.setSize(app.width, app.height);

  app.controls = new THREE.OrbitControls(app.camera, app.renderer.domElement);

  var output = document.getElementById("output");
  output.appendChild(app.renderer.domElement);

  // app.axes = new THREE.AxisHelper(40);
  // app.scene.add(app.axes);

  var planeGeometry = new THREE.PlaneGeometry(60, 20);
  var planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xcfd8dc,
    side: THREE.DoubleSide
  });
  app.plane = new THREE.Mesh(planeGeometry, planeMaterial);
  app.plane.receiveShadow = true;

  app.plane.position.x = 15;
  app.plane.position.y = 0;
  app.plane.position.z = 0;

  // app.plane.rotation.x = -0.5 * Math.PI;
  app.plane.rotation.x = THREE.Math.degToRad(-90);

  app.scene.add(app.plane);

  app.addCube({
    x: -4,
    y: 3,
    z: 0
  });
  app.addSphere(4, {
    x: 20,
    y: 4,
    z: 0
  });
  app.addLight();

  app.gui = new dat.GUI();
  app.gui.add(app.controller, "rotationSpeed", 0, 3);
  app.gui.add(app.controller, "bouncingSpeed", 0, 3);

  app.stats = app.addStats();
  app.createParticles();
  app.animate();
};

app.onResize = function() {
  app.width = window.innerWidth;
  app.height = window.innerHeight;

  app.camera.aspect = app.width / app.height;
  app.camera.updateProjectionMatrix();

  app.renderer.setSize(app.width, app.height);
};

window.addEventListener("resize", app.onResize);

window.onload = app.init;
