function closeSignup() {
  document.querySelector('.signup-box').style.display = 'none';
}
function updateFlag(value) {
  const flagMap = {
    us: 'https://flagcdn.com/w40/us.png',
    vn: 'https://flagcdn.com/w40/vn.png'
  };
  document.getElementById('flag').src = flagMap[value];
}
// ----- 3D MODEL CODE -----
const container = document.getElementById("model-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Ánh sáng
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

// Load mô hình
let model;
const loader = new THREE.GLTFLoader();
loader.load("assets/Models/Sussy_Imposter.glb", function (gltf) {
  model = gltf.scene;
  scene.add(model);
  animate();
}, undefined, function (error) {
  console.error("Error loading model:", error);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (model) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}
