/**
 * JAABBAR 3D LIVE OPS - Three.js 3D Venue Scene Engine
 * JAABBAR CONCERT • SEOUL CAFÉ & SPACE
 */

class VenueScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.controls = null;

    this.tableMeshes = new Map(); // tableId -> mesh/group
    this.tableOrders = new Map(); // tableId -> { orderBadgeObj, type, name, status }
    this.spotlights = [];
    this.stageScreenCanvas = null;
    this.stageScreenCtx = null;
    this.stageScreenTexture = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.followingTarget = null; // staff object currently being tracked by camera
    this.isTagsVisible = true;

    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d14);
    this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.009);

    // 2. Camera (Isometric Perspective)
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 500);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. CSS2D Renderer (HTML Overlays for Name Tags & Labels)
    this.labelRenderer = new THREE.CSS2DRenderer();
    this.labelRenderer.setSize(width, height);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.labelRenderer.domElement.style.left = '0px';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.labelRenderer.domElement);

    // 5. OrbitControls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2.15; // Don't go below ground
    this.controls.minDistance = 10;
    this.controls.maxDistance = 140;
    this.controls.target.set(0, 0, 0);

    // Break follow mode if user manually drags or orbits
    this.controls.addEventListener('start', () => {
      if (this.followingTarget && !this._programmaticMoving) {
        window.dispatchEvent(new CustomEvent('cancelFollow'));
      }
    });

    this.setCameraPreset('overview', false);

    // 6. Build Venue Elements
    this.setupLighting();
    this.buildFloorAndWalls();
    this.buildStage();
    this.buildBarAndBackroom();
    this.buildKitchen();
    this.buildVenueSignsAndDoors();
    this.buildTablesAndChairs();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));

    // Start render loop
    this.animate();
  }

  setupLighting() {
    // Ambient light - warm moody concert hall base
    const ambientLight = new THREE.AmbientLight(0x283149, 1.4);
    this.scene.add(ambientLight);

    // Main warm directional key light
    const dirLight = new THREE.DirectionalLight(0xfff1e0, 1.1);
    dirLight.position.set(25, 45, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -38;
    dirLight.shadow.camera.right = 38;
    dirLight.shadow.camera.top = 38;
    dirLight.shadow.camera.bottom = -38;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Cool blue/purple rim light from stage rear
    const stageBackLight = new THREE.DirectionalLight(0x7c3aed, 1.3);
    stageBackLight.position.set(-15, 25, -35);
    this.scene.add(stageBackLight);

    // Warm Bar Under-counter / Pendants glow
    const barPointLight = new THREE.PointLight(0x38bdf8, 1.5, 18);
    barPointLight.position.set(2, 4.5, 15);
    this.scene.add(barPointLight);

    // Warm Kitchen Stoves glow
    const kitchenLight = new THREE.PointLight(0xf97316, 1.8, 16);
    kitchenLight.position.set(29, 4, -1);
    this.scene.add(kitchenLight);
  }

  buildFloorAndWalls() {
    // Venue Floor Shape (Matching the actual floor plan layout with slanted top)
    const floorShape = new THREE.Shape();
    // Start at bottom-left entrance: (-29, 25)
    floorShape.moveTo(-29, 25);
    // Straight vertical left wall to (-29, -15)
    floorShape.lineTo(-29, -15);
    // Slanted top wall slanting up-right to (28, -26)
    floorShape.lineTo(28, -26);
    // Right wall going south to Restroom corner (28, -26) -> (28, -6)
    floorShape.lineTo(28, -6);
    // Kitchen box extension out to X: 34, Z: -6 to 3
    floorShape.lineTo(34.5, -6);
    floorShape.lineTo(34.5, 3.5);
    floorShape.lineTo(28, 3.5);
    // South to Sofa 39 & Women Restroom step
    floorShape.lineTo(28, 22);
    floorShape.lineTo(31, 22);
    floorShape.lineTo(31, 25);
    // Bottom edge to entrance
    floorShape.lineTo(-29, 25);

    // Extrude low floor base
    const floorGeom = new THREE.ExtrudeGeometry(floorShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.2,
      bevelThickness: 0.2
    });
    floorGeom.rotateX(Math.PI / 2); // Lay flat on X-Z

    // Floor Material: Dark polished club concrete / timber
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.35,
      metalness: 0.25
    });

    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.position.y = -0.5;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Subtle Grid / Tile lines overlay
    const grid = new THREE.GridHelper(70, 70, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // Cutaway Perimeter Walls
    this.buildCutawayWalls();

    // Zone Highlight Mats
    this.buildZoneFloors();
  }

  buildCutawayWalls() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e2638,
      roughness: 0.6,
      metalness: 0.1
    });
    const wallTrimMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.4
    });

    const createWallSegment = (p1, p2, height = 2.0, thickness = 0.6) => {
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);

      const wallGeom = new THREE.BoxGeometry(len, height, thickness);
      const wall = new THREE.Mesh(wallGeom, wallMat);
      wall.position.set((p1.x + p2.x) / 2, height / 2, (p1.z + p2.z) / 2);
      wall.rotation.y = -angle;
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);

      // Top Trim
      const trimGeom = new THREE.BoxGeometry(len, 0.12, thickness + 0.15);
      const trim = new THREE.Mesh(trimGeom, wallTrimMat);
      trim.position.set((p1.x + p2.x) / 2, height + 0.06, (p1.z + p2.z) / 2);
      trim.rotation.y = -angle;
      this.scene.add(trim);
    };

    createWallSegment({ x: -29, z: -15 }, { x: -29, z: 25 });
    createWallSegment({ x: -29, z: -15 }, { x: 28, z: -26 }, 3.5);
    createWallSegment({ x: 28, z: -26 }, { x: 28, z: -6 });
    createWallSegment({ x: 28, z: -6 }, { x: 34.5, z: -6 });
    createWallSegment({ x: 34.5, z: -6 }, { x: 34.5, z: 3.5 });
    createWallSegment({ x: 34.5, z: 3.5 }, { x: 28, z: 3.5 });
    createWallSegment({ x: 28, z: 3.5 }, { x: 28, z: 22 });
    createWallSegment({ x: 28, z: 22 }, { x: 31, z: 22 });
    createWallSegment({ x: 31, z: 22 }, { x: 31, z: 25 });
    createWallSegment({ x: -24, z: 25 }, { x: 31, z: 25 });
  }

  buildZoneFloors() {
    // VIP Zone Glowing Floor Accent
    const vipMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.08,
      depthWrite: false
    });
    const vipFloor = new THREE.Mesh(new THREE.PlaneGeometry(46, 15), vipMat);
    vipFloor.rotation.x = -Math.PI / 2;
    vipFloor.position.set(-1.0, 0.015, -13.0);
    this.scene.add(vipFloor);

    this.buildVipBarrier();

    // Zone A Floor Accent
    const aMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.06,
      depthWrite: false
    });
    const aFloor = new THREE.Mesh(new THREE.PlaneGeometry(50, 9.5), aMat);
    aFloor.rotation.x = -Math.PI / 2;
    aFloor.position.set(-1.0, 0.014, -0.5);
    this.scene.add(aFloor);
  }

  buildVipBarrier() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.2 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.5 });

    const postXs = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
    const zPos = -5.5;

    postXs.forEach((x, i) => {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 16), postMat);
      base.position.set(x, 0.04, zPos);
      this.scene.add(base);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16), postMat);
      pole.position.set(x, 0.5, zPos);
      pole.castShadow = true;
      this.scene.add(pole);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), postMat);
      head.position.set(x, 1.02, zPos);
      this.scene.add(head);

      if (i > 0) {
        const prevX = postXs[i - 1];
        const ropeLength = x - prevX;
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, ropeLength, 8), ropeMat);
        rope.position.set((x + prevX) / 2, 0.78, zPos);
        rope.rotation.z = Math.PI / 2;
        this.scene.add(rope);
      }
    });
  }

  buildStage() {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(-6, 0, -19);
    stageGroup.rotation.y = 0.19; // ~11 deg

    const stageGeom = new THREE.BoxGeometry(18, 0.9, 7.5);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x181e2e,
      roughness: 0.4,
      metalness: 0.3
    });
    const stageMesh = new THREE.Mesh(stageGeom, stageMat);
    stageMesh.position.y = 0.45;
    stageMesh.receiveShadow = true;
    stageMesh.castShadow = true;
    stageGroup.add(stageMesh);

    const neonStrip = new THREE.Mesh(
      new THREE.BoxGeometry(18.05, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    neonStrip.position.set(0, 0.88, 3.75);
    stageGroup.add(neonStrip);

    const stepGeom = new THREE.BoxGeometry(4.0, 0.3, 1.0);
    const step = new THREE.Mesh(stepGeom, stageMat);
    step.position.set(0, 0.15, 4.25);
    stageGroup.add(step);

    this.setupStageScreen(stageGroup);
    this.setupStageTrussAndSpotlights(stageGroup);
    this.setupBandEquipment(stageGroup);

    this.scene.add(stageGroup);
  }

  setupStageScreen(stageGroup) {
    this.stageScreenCanvas = document.createElement('canvas');
    this.stageScreenCanvas.width = 512;
    this.stageScreenCanvas.height = 192;
    this.stageScreenCtx = this.stageScreenCanvas.getContext('2d');

    this.stageScreenTexture = new THREE.CanvasTexture(this.stageScreenCanvas);

    const screenGeom = new THREE.BoxGeometry(16, 4.5, 0.2);
    const screenMat = new THREE.MeshBasicMaterial({ map: this.stageScreenTexture });
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.set(0, 3.2, -3.4);
    stageGroup.add(screenMesh);
  }

  setupStageTrussAndSpotlights(stageGroup) {
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(17, 0.3, 0.3), trussMat);
    topBeam.position.set(0, 6.2, 0);
    stageGroup.add(topBeam);

    [-8.2, 8.2].forEach(x => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.2, 0.3), trussMat);
      pillar.position.set(x, 3.1, 0);
      stageGroup.add(pillar);
    });

    const spotColors = [0xec4899, 0x06b6d4, 0xa855f7, 0xeab308];
    const spotXs = [-6, -2, 2, 6];

    spotXs.forEach((x, i) => {
      const spotGroup = new THREE.Group();
      spotGroup.position.set(x, 6.0, 0);

      const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.7, 16), trussMat);
      casing.rotation.x = Math.PI / 3;
      spotGroup.add(casing);

      const spotLight = new THREE.SpotLight(spotColors[i], 3.0, 40, Math.PI / 7, 0.45, 1);
      spotLight.position.set(0, 0, 0);
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 512;
      spotLight.shadow.mapSize.height = 512;

      const targetObj = new THREE.Object3D();
      targetObj.position.set(x, 0, 8);
      this.scene.add(targetObj);
      spotLight.target = targetObj;

      spotGroup.add(spotLight);
      stageGroup.add(spotGroup);

      this.spotlights.push({
        group: spotGroup,
        light: spotLight,
        target: targetObj,
        baseX: x,
        speed: 1.2 + i * 0.3,
        phase: i * Math.PI / 2
      });
    });
  }

  setupBandEquipment(stageGroup) {
    const eqMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

    const drumGroup = new THREE.Group();
    drumGroup.position.set(-5, 0.9, -1.2);

    const bassDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 20), eqMat);
    bassDrum.rotation.z = Math.PI / 2;
    bassDrum.position.y = 0.7;
    drumGroup.add(bassDrum);

    const snare = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), silverMat);
    snare.position.set(0.7, 0.8, 0.4);
    drumGroup.add(snare);

    const cymbal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    cymbal.position.set(-0.8, 1.4, -0.3);
    cymbal.rotation.x = 0.2;
    drumGroup.add(cymbal);

    stageGroup.add(drumGroup);

    const djDesk = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.0, 1.2), eqMat);
    djDesk.position.set(0, 1.4, -1.5);
    stageGroup.add(djDesk);

    const djLaptop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.6), silverMat);
    djLaptop.position.set(0, 1.95, -1.5);
    stageGroup.add(djLaptop);

    const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), silverMat);
    micStand.position.set(0, 1.65, 2.2);
    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), silverMat);
    micHead.position.set(0, 2.4, 2.2);
    stageGroup.add(micStand);
    stageGroup.add(micHead);

    [-7.0, 7.0].forEach(x => {
      const spk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 1.0), eqMat);
      spk.position.set(x, 1.8, 2.8);
      stageGroup.add(spk);
    });
  }

  buildBarAndBackroom() {
    const barGroup = new THREE.Group();
    const barWoodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4 });
    const barMarbleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.3 });

    const mainCounter = new THREE.Mesh(new THREE.BoxGeometry(15, 1.15, 1.6), barWoodMat);
    mainCounter.position.set(2.5, 0.575, 15.2);
    mainCounter.castShadow = true;
    mainCounter.receiveShadow = true;
    barGroup.add(mainCounter);

    const mainTop = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.12, 2.0), barMarbleMat);
    mainTop.position.set(2.5, 1.18, 15.1);
    barGroup.add(mainTop);

    const sideCounter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.15, 5.0), barWoodMat);
    sideCounter.position.set(-4.2, 0.575, 18.0);
    barGroup.add(sideCounter);

    const sideTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 5.2), barMarbleMat);
    sideTop.position.set(-4.2, 1.18, 18.0);
    barGroup.add(sideTop);

    const tapMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.1 });
    for (let i = 0; i < 3; i++) {
      const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 12), tapMat);
      tap.position.set(0.5 + i * 0.4, 1.4, 15.1);
      barGroup.add(tap);
    }

    const posBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    posBase.position.set(6.5, 1.3, 15.2);
    const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.05), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    posScreen.position.set(6.5, 1.55, 15.1);
    posScreen.rotation.x = -0.3;
    barGroup.add(posBase);
    barGroup.add(posScreen);

    this.scene.add(barGroup);

    const backroomGroup = new THREE.Group();
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.6 });

    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 0.2), backWallMat);
    wallLeft.position.set(-1.5, 1.1, 19.2);
    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.2, 0.2), backWallMat);
    wallRight.position.set(6.0, 1.1, 19.2);
    backroomGroup.add(wallLeft);
    backroomGroup.add(wallRight);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    desk.position.set(2.0, 0.45, 21.5);
    backroomGroup.add(desk);

    [-0.5, 0.5].forEach(mx => {
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.05), new THREE.MeshBasicMaterial({ color: 0x818cf8 }));
      mon.position.set(2.0 + mx, 1.2, 21.5);
      backroomGroup.add(mon);
    });

    const safe = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.9), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 }));
    safe.position.set(-2.0, 0.7, 21.8);
    backroomGroup.add(safe);

    this.scene.add(backroomGroup);
  }

  buildKitchen() {
    const kitchenGroup = new THREE.Group();
    const stainlessMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    const passCounter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 3.5), stainlessMat);
    passCounter.position.set(26.5, 0.55, 0.0);
    kitchenGroup.add(passCounter);

    const heatLampMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    for (let z = -0.8; z <= 0.8; z += 0.8) {
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 16), heatLampMat);
      lamp.position.set(26.5, 1.8, z);
      lamp.rotation.x = Math.PI;
      kitchenGroup.add(lamp);
    }

    const stoveBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 5.0), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 }));
    stoveBase.position.set(32.5, 0.5, -2.0);
    kitchenGroup.add(stoveBase);

    for (let sz = -3.5; sz <= -0.5; sz += 1.5) {
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
      pan.position.set(32.5, 1.08, sz);
      kitchenGroup.add(pan);
    }

    const prepTable = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 3.0), stainlessMat);
    prepTable.position.set(30.0, 0.5, 2.0);
    kitchenGroup.add(prepTable);

    this.scene.add(kitchenGroup);
  }

  buildVenueSignsAndDoors() {
    this.createVenueSignMarker('🎤 เวที (STAGE)', { x: -6.0, y: 3.5, z: -17.5 }, 'sign-stage');
    this.createVenueSignMarker('บาร์น้ำ (BAR)', { x: 2.5, y: 2.0, z: 15.2 }, 'sign-bar');
    this.createVenueSignMarker('ห้องหลังบาร์', { x: 2.0, y: 1.8, z: 22.0 }, 'sign-backroom');
    this.createVenueSignMarker('ห้องครัว • ช่องส่งอาหาร', { x: 28.5, y: 2.2, z: 0.0 }, 'sign-kitchen');
    this.createVenueSignMarker('🚪 ทางเข้า-ออก', { x: -26.5, y: 1.5, z: 25.0 }, 'sign-door');

    const doorMat = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.0), new THREE.MeshBasicMaterial({ color: 0x78350f }));
    doorMat.rotation.x = -Math.PI / 2;
    doorMat.position.set(-26.5, 0.02, 24.5);
    this.scene.add(doorMat);

    this.createVenueSignMarker('🚻 ห้องน้ำ', { x: 28.0, y: 2.2, z: -25.0 }, 'sign-door');
    this.createVenueSignMarker('🚺 ห้องน้ำหญิง', { x: 29.5, y: 2.0, z: 24.5 }, 'sign-door');
  }

  createVenueSignMarker(text, pos, cssClass) {
    const div = document.createElement('div');
    div.className = `venue-sign-label ${cssClass}`;
    div.textContent = text;

    const label = new THREE.CSS2DObject(div);
    label.position.set(pos.x, pos.y, pos.z);
    this.scene.add(label);
  }

  buildTablesAndChairs() {
    TABLES_CONFIG.forEach(cfg => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(cfg.x, 0, cfg.z);
      tableGroup.userData = {
        tableId: cfg.id,
        tableNumber: cfg.number,
        zone: cfg.zone,
        label: cfg.label,
        seats: cfg.seats,
        isOccupied: Math.random() > 0.18,
        orderPending: null
      };

      const zoneInfo = VENUE_ZONES[cfg.zone] || VENUE_ZONES.ZONE_B;

      if (cfg.shape === 'round') {
        this.createRoundTableMesh(tableGroup, cfg, zoneInfo);
      } else if (cfg.shape === 'sofa') {
        this.createSofaBoothMesh(tableGroup, cfg, zoneInfo);
      } else if (cfg.shape === 'stool') {
        this.createBarStoolMesh(tableGroup, cfg, zoneInfo);
      } else {
        this.createSquareTableMesh(tableGroup, cfg, zoneInfo);
      }

      if (tableGroup.userData.isOccupied) {
        this.createCustomerAvatars(tableGroup, cfg);
      }

      this.scene.add(tableGroup);
      this.tableMeshes.set(cfg.id, tableGroup);
    });
  }

  createRoundTableMesh(group, cfg, zoneInfo) {
    const tableMat = new THREE.MeshStandardMaterial({
      color: zoneInfo.colorHex,
      roughness: 0.3,
      metalness: 0.2
    });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });

    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.12, 24), tableMat);
    top.position.y = 0.95;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    this.createTableNumberCanvas(top, cfg.number, zoneInfo.color);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 16), legMat);
    leg.position.y = 0.45;
    group.add(leg);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 20), legMat);
    base.position.y = 0.03;
    group.add(base);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + 0.3;
      const chair = this.createStandardChair(0x475569);
      chair.position.set(Math.cos(angle) * 1.6, 0, Math.sin(angle) * 1.6);
      chair.rotation.y = -angle - Math.PI / 2;
      group.add(chair);
    }

    if (cfg.zone === 'VIP') {
      const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 12), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9 }));
      bucket.position.set(0.3, 1.12, 0.2);
      group.add(bucket);
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.2 }));
      bottle.position.set(0.3, 1.3, 0.2);
      group.add(bottle);
    }
  }

  createSquareTableMesh(group, cfg, zoneInfo) {
    const tableMat = new THREE.MeshStandardMaterial({
      color: zoneInfo.colorHex,
      roughness: 0.3,
      metalness: 0.1
    });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });

    const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.6), tableMat);
    top.position.y = 0.95;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    this.createTableNumberCanvas(top, cfg.number, zoneInfo.color);

    const legGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12);
    [
      [-0.65, -0.65], [0.65, -0.65],
      [-0.65, 0.65], [0.65, 0.65]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(lx, 0.45, lz);
      group.add(leg);
    });

    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const chair = this.createStandardChair(0x334155);
      chair.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
      chair.rotation.y = -angle - Math.PI / 2;
      group.add(chair);
    }
  }

  createSofaBoothMesh(group, cfg, zoneInfo) {
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.1), sofaMat);
    seat.position.set(0, 0.25, 0.7);
    group.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.35), sofaMat);
    backrest.position.set(0, 0.75, 1.15);
    group.add(backrest);

    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.9), woodMat);
    coffeeTable.position.set(0, 0.6, -0.2);
    group.add(coffeeTable);

    this.createTableNumberCanvas(coffeeTable, cfg.number, zoneInfo.color);

    const legGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.56, 8);
    [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeom, woodMat);
      leg.position.set(lx, 0.28, -0.2 + lz);
      group.add(leg);
    });
  }

  createBarStoolMesh(group, cfg, zoneInfo) {
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.1 });

    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 20), stoolMat);
    seat.position.y = 0.85;
    seat.castShadow = true;
    group.add(seat);

    this.createTableNumberCanvas(seat, cfg.number, zoneInfo.color);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 12), chromeMat);
    pole.position.y = 0.42;
    group.add(pole);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16), chromeMat);
    base.position.y = 0.02;
    group.add(base);
  }

  createStandardChair(colorHex) {
    const chairGroup = new THREE.Group();
    const chairMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });

    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), chairMat);
    cushion.position.y = 0.52;
    chairGroup.add(cushion);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.06), chairMat);
    back.position.set(0, 0.82, -0.3);
    chairGroup.add(back);

    const legGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(lx, 0.25, lz);
      chairGroup.add(leg);
    });

    return chairGroup;
  }

  createTableNumberCanvas(parentMesh, numberText, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numberText, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const decalMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const decalGeom = new THREE.PlaneGeometry(0.8, 0.8);
    const decalMesh = new THREE.Mesh(decalGeom, decalMat);
    decalMesh.rotation.x = -Math.PI / 2;
    decalMesh.position.y = 0.07;
    parentMesh.add(decalMesh);
  }

  createCustomerAvatars(tableGroup, cfg) {
    const custCount = cfg.seats > 2 ? (Math.random() > 0.4 ? 2 : 1) : 1;
    const skinTones = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642];
    const shirtColors = [0x3b82f6, 0xec4899, 0x10b981, 0x8b5cf6, 0xf59e0b, 0x06b6d4];

    for (let i = 0; i < custCount; i++) {
      const custGroup = new THREE.Group();
      const skinMat = new THREE.MeshStandardMaterial({ color: skinTones[Math.floor(Math.random() * skinTones.length)] });
      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColors[Math.floor(Math.random() * shirtColors.length)] });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), skinMat);
      head.position.y = 1.35;
      custGroup.add(head);

      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), hairMat);
      hair.position.y = 1.42;
      custGroup.add(hair);

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.28), shirtMat);
      torso.position.y = 0.95;
      custGroup.add(torso);

      const angle = (i * Math.PI) + 0.6;
      custGroup.position.set(Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3);
      custGroup.rotation.y = -angle - Math.PI / 2;

      tableGroup.add(custGroup);
    }
  }

  showTableOrder(tableId, orderType = 'food', orderDesc = 'อาหารจานร้อน') {
    const tableGroup = this.tableMeshes.get(tableId);
    if (!tableGroup) return;

    if (this.tableOrders.has(tableId)) {
      this.clearTableOrder(tableId);
    }

    const badgeDiv = document.createElement('div');
    badgeDiv.className = 'table-order-badge';
    const icon = orderType === 'champagne' ? '🍾' : orderType === 'drink' ? '🍹' : '🍜';
    badgeDiv.innerHTML = `<span>${icon}</span> <span>${orderDesc}</span>`;

    const css2dObj = new THREE.CSS2DObject(badgeDiv);
    css2dObj.position.set(0, 2.2, 0);
    tableGroup.add(css2dObj);

    this.tableOrders.set(tableId, { obj: css2dObj, type: orderType, desc: orderDesc });
    tableGroup.userData.orderPending = { type: orderType, desc: orderDesc };
  }

  clearTableOrder(tableId) {
    const tableGroup = this.tableMeshes.get(tableId);
    const order = this.tableOrders.get(tableId);
    if (tableGroup && order) {
      tableGroup.remove(order.obj);
      this.tableOrders.delete(tableId);
      tableGroup.userData.orderPending = null;
    }
  }

  setCameraPreset(presetName, animate = true) {
    let targetPos = new THREE.Vector3();
    let targetLook = new THREE.Vector3();

    switch (presetName) {
      case 'stage':
        targetPos.set(-6, 20, 14);
        targetLook.set(-6, 1.5, -14);
        break;
      case 'bar':
        targetPos.set(2, 16, 28);
        targetLook.set(2, 1.0, 17);
        break;
      case 'kitchen':
        targetPos.set(26, 16, 12);
        targetLook.set(28, 1.2, 0);
        break;
      case 'overview':
      default:
        targetPos.set(38, 45, 50);
        targetLook.set(0, 0, 0);
        break;
    }

    this.followingTarget = null;

    if (!animate || typeof TWEEN === 'undefined') {
      this.camera.position.copy(targetPos);
      if (this.controls) {
        this.controls.target.copy(targetLook);
        this.controls.update();
      } else {
        this.camera.lookAt(targetLook);
      }
      return;
    }

    this._programmaticMoving = true;
    new TWEEN.Tween(this.camera.position)
      .to(targetPos, 1200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    if (this.controls) {
      new TWEEN.Tween(this.controls.target)
        .to(targetLook, 1200)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          this._programmaticMoving = false;
        })
        .start();
    } else {
      this._programmaticMoving = false;
    }
  }

  focusOnTable(tableId) {
    const tableMesh = this.tableMeshes.get(tableId);
    if (!tableMesh) return;

    const tPos = tableMesh.position;
    const targetCamPos = new THREE.Vector3(tPos.x + 8, 12, tPos.z + 12);

    this.followingTarget = null;
    this._programmaticMoving = true;

    new TWEEN.Tween(this.camera.position)
      .to(targetCamPos, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(this.controls.target)
      .to(new THREE.Vector3(tPos.x, 1.0, tPos.z), 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => {
        this._programmaticMoving = false;
      })
      .start();
  }

  followStaff(staff3DObj) {
    this.followingTarget = staff3DObj;
  }

  unfollowStaff() {
    this.followingTarget = null;
  }

  toggleNameTags(show) {
    this.isTagsVisible = show !== undefined ? show : !this.isTagsVisible;
    this.labelRenderer.domElement.style.display = this.isTagsVisible ? 'block' : 'none';
    return this.isTagsVisible;
  }

  onCanvasClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (let hit of intersects) {
      let curr = hit.object;
      while (curr && curr !== this.scene) {
        if (curr.userData && curr.userData.staffData) {
          window.dispatchEvent(new CustomEvent('selectStaff', { detail: { staff: curr.userData.staffData } }));
          return;
        }
        if (curr.userData && curr.userData.tableId) {
          window.dispatchEvent(new CustomEvent('selectTable', { detail: { tableId: curr.userData.tableId, data: curr.userData } }));
          return;
        }
        curr = curr.parent;
      }
    }
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  updateStageScreen(time) {
    if (!this.stageScreenCtx) return;
    const ctx = this.stageScreenCtx;
    const w = 512;
    const h = 192;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const bars = 24;
    const barW = w / bars - 4;
    for (let i = 0; i < bars; i++) {
      const bh = Math.abs(Math.sin(time * 6 + i * 0.4)) * (h - 60) + 20;
      const hue = (i * 12 + time * 40) % 360;
      ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
      ctx.fillRect(i * (barW + 4) + 2, h - bh, barW, bh);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Prompt, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JAABBAR CONCERT', w / 2, 50);

    ctx.fillStyle = '#facc15';
    ctx.font = '600 18px Prompt, sans-serif';
    ctx.fillText('SEOUL CAFÉ • LIVE ON STAGE', w / 2, 80);

    if (this.stageScreenTexture) {
      this.stageScreenTexture.needsUpdate = true;
    }
  }

  updateSpotlights(time) {
    this.spotlights.forEach(sp => {
      const sweepX = sp.baseX + Math.sin(time * sp.speed + sp.phase) * 6;
      const sweepZ = 6 + Math.cos(time * sp.speed * 0.8 + sp.phase) * 7;
      sp.target.position.set(sweepX, 0.5, sweepZ);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (typeof TWEEN !== 'undefined') {
      TWEEN.update();
    }

    this.updateStageScreen(elapsedTime);
    this.updateSpotlights(elapsedTime);

    if (this.followingTarget && !this._programmaticMoving) {
      const charPos = this.followingTarget.position;
      const offset = new THREE.Vector3(12, 16, 16);
      this.camera.position.lerp(new THREE.Vector3().addVectors(charPos, offset), 0.08);
      this.controls.target.lerp(new THREE.Vector3(charPos.x, 1.2, charPos.z), 0.08);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
