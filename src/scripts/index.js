
import AttractorPhysics from "./attractor-physics";

const MARBLE_ENV_MAP = "src/assets/marble_env.jpg";
const MARBLE_ROUGHNESS_MAP = "src/assets/metal_ball_roughness_map.jpg";

const MARBLES_COUNT = 50;
const CACHED_VEC2 = new THREE.Vector2();

export class App {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.marbles = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.initWorld();
    this.initLights();
    this.initEnvMap();
    this.initBackground();
    this.initCenterMarble();
    this.initPhysics();
    this.initMarbles();
    // this.initHelpers();
    this.attachEvents();
    this.cacheElements();
    this.updateSize();
    this.onFrame();
  }
  cacheElements() {
    this.mouseElement = document.querySelector(".mouse-pointer");
  }

  initWorld() {
    const { innerWidth: w, innerHeight: h } = window;
    const aspect = w / h;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.gammaInput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    window.scene = this.scene;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.set(0, 0, 2);
    this.clock = new THREE.Clock();
    document.body.appendChild(this.renderer.domElement);
  }

  initHelpers() {
    const { scene, camera, renderer } = this;
    const c = new THREE.OrbitControls(camera, renderer.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.25;
    c.minDistance = 1;
    c.maxDistance = 1000;
    this.orbitControls = c;
    this.axesHelper = new THREE.AxesHelper(500);
    scene.add(this.axesHelper);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xff00fc, 0.5);
    const pLight1 = new THREE.PointLight(0xFCD581, 0.5, 100);
    pLight1.castShadow = true;
    pLight1.position.set(5, 5, 5);
    const pLightHelper = new THREE.PointLightHelper(pLight1, 1);
    this.scene.add(ambientLight, hemiLight, pLight1);
    this.scene.add(pLightHelper);
  }

  initEnvMap() {
    this.envTexture = new THREE.TextureLoader().load(MARBLE_ENV_MAP);
    this.envTexture.mapping = THREE.SphericalReflectionMapping;
  }

  initBackground() {
    const geo = new THREE.IcosahedronBufferGeometry(2, 1);
    const mat = new THREE.MeshStandardMaterial({
      side: THREE.BackSide,
      color: 0x55286F,
      metalness: 0.5,
      roughness: 0.8,
      flatShading: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.scene.add(mesh);
  }

  initCenterMarble() {
    const geo = new THREE.IcosahedronBufferGeometry(1, 4);
    const mat = new THREE.MeshStandardMaterial({
      roughnessMap: new THREE.TextureLoader().load(MARBLE_ROUGHNESS_MAP),
      envMap: this.envTexture,
      color: 0xB74F6F,
      metalness: 0.3,
      roughness: 1
      //wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.centerMarble = mesh;
    this.scene.add(mesh);
  }

  initPhysics() {
    this.attractor = new AttractorPhysics({});
    for (let i = 0; i < MARBLES_COUNT; i++) {
      this.attractor.addBody();
    }
  }

  initMarbles() {
    const geo = new THREE.IcosahedronBufferGeometry(1, 4);
    const mat = new THREE.MeshStandardMaterial({
      roughnessMap: new THREE.TextureLoader().load(MARBLE_ROUGHNESS_MAP),
      color: 0xFCD581,
      envMap: this.envTexture,
      metalness: 0.3,
      roughness: 1
    });
    for (let i = 0; i < MARBLES_COUNT; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.marbles.push(mesh);
      this.scene.add(mesh);
    }
  }

  attachEvents() {
    window.addEventListener("resize", this.updateSize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  updateSize() {
    const { renderer, camera } = this;
    const { innerWidth: w, innerHeight: h } = window;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    this.width = w;
    this.height = h;
  }

  syncMarbles() {
    const { marbles, attractor } = this;
    const { bodies } = this.attractor;
    this.centerMarble.scale.setScalar(attractor.opts.radius);
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      const b = bodies[i];
      m.scale.setScalar(b.radius);
      m.position.setFromSpherical(b.position);
    }
  }

  onMouseMove(e) {
    const { innerWidth: w, innerHeight: h } = window;
    e.preventDefault();
    this.mouse.x = (e.clientX / w) * 2 - 1;
    this.mouse.y = - (e.clientY / h) * 2 + 1;
    this.mouseElement.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    console.log(this.mouse)
  }

  updateInput() {
    const { raycaster, mouse, camera, centerMarble } = this;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(centerMarble);
    centerMarble.material.wireframe = intersects.length > 0;
    CACHED_VEC2.set(0, 0);
    const dist = mouse.distanceTo(CACHED_VEC2);
    this.mouseElement.style.opacity = dist < 0.8 ? 1 : 0.5;
      const x = mouse.x * Math.max(0, 1 - dist);
      const y = mouse.y * Math.max(0, 1 - dist);
      centerMarble.position.set(mouse.x, mouse.y, 0);
  }

  onFrame() {
    const { renderer, scene, camera, clock, raycaster, mouse } = this;
    requestAnimationFrame(this.onFrame.bind(this));
    //this.orbitControls.update();
    camera.lookAt(scene.position);
    this.updateInput();
    this.attractor.update(clock.getDelta());
    this.syncMarbles();
    renderer.render(scene, camera);
  }
}

new App();
