/**
 * JAABBAR 3D LIVE OPS - 3D Cartoon Characters & CSS2D Floating Name Tags Engine
 * 18 Staff Characters with Role Props, Walking Limb Animations & Name Tag Editing
 */

class CharacterManager {
  constructor(sceneInstance) {
    this.sceneInstance = sceneInstance;
    this.characters = new Map(); // staffId -> characterInstance
  }

  createAllCharacters(staffList) {
    staffList.forEach(staffData => {
      const char = new StaffCharacter(this.sceneInstance, staffData);
      this.characters.set(staffData.id, char);
    });
  }

  getCharacterById(id) {
    return this.characters.get(id);
  }

  getAllCharacters() {
    return Array.from(this.characters.values());
  }

  updateAll(delta, time) {
    this.characters.forEach(char => char.update(delta, time));
  }

  updateStaffProfile(updatedStaff) {
    const char = this.characters.get(updatedStaff.id);
    if (char) {
      char.updateProfile(updatedStaff);
    }
  }

  filterByDepartment(deptKey) {
    this.characters.forEach(char => {
      const match = deptKey === 'all' || char.staffData.dept === deptKey;
      char.setVisible(match);
    });
  }
}

class StaffCharacter {
  constructor(sceneInstance, staffData) {
    this.sceneInstance = sceneInstance;
    this.staffData = staffData;

    this.group = new THREE.Group();
    this.group.userData = { staffData: this.staffData };

    this.mesh = null;
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.propMesh = null;
    this.css2dLabel = null;

    // Movement state
    this.currentPos = new THREE.Vector3(staffData.spawnPos.x, 0, staffData.spawnPos.z);
    this.targetPos = new THREE.Vector3(staffData.spawnPos.x, 0, staffData.spawnPos.z);
    this.isWalking = false;
    this.walkSpeed = 3.2; // units per second
    this.walkCycle = 0;

    this.statusText = staffData.currentStatus;
    this.actionDesc = staffData.actionDesc;

    this.build3DModel();
    this.buildFloatingNameTag();

    this.group.position.copy(this.currentPos);
    this.sceneInstance.scene.add(this.group);
  }

  build3DModel() {
    const skinTones = [0xffdbac, 0xf1c27d, 0xe0ac69];
    const skinColor = skinTones[Math.abs(this.staffData.id.charCodeAt(6)) % skinTones.length];
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
    const uniformMat = new THREE.MeshStandardMaterial({ color: this.staffData.colorHex, roughness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    // 1. Torso / Uniform (Height: 0.7, Width: 0.5, Depth: 0.3)
    const torsoGeom = new THREE.BoxGeometry(0.5, 0.7, 0.32);
    const torso = new THREE.Mesh(torsoGeom, uniformMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    this.group.add(torso);
    this.torso = torso;

    // Belt / Trim
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.34), darkMat);
    belt.position.set(0, -0.28, 0);
    torso.add(belt);

    // 2. Head (Smooth Cartoon Sphere)
    const headGeom = new THREE.SphereGeometry(0.26, 16, 16);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.set(0, 0.6, 0);
    torso.add(head);

    // Eyes (Two dark dots)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMat);
    eyeL.position.set(0.08, 0.03, 0.24);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMat);
    eyeR.position.set(-0.08, 0.03, 0.24);
    head.add(eyeL);
    head.add(eyeR);

    // Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.7), hairMat);
    hair.position.set(0, 0.06, 0);
    head.add(hair);

    // 3. Role-Specific Accessories
    if (this.staffData.hasChefHat) {
      const chefHatGroup = new THREE.Group();
      const hatWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

      const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.15, 16), hatWhiteMat);
      hatBrim.position.y = 0.22;
      chefHatGroup.add(hatBrim);

      const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.26, 0.45, 16), hatWhiteMat);
      hatCrown.position.y = 0.45;
      chefHatGroup.add(hatCrown);

      head.add(chefHatGroup);
    }

    if (this.staffData.hasCrown) {
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.18, 5), goldMat);
      crown.position.y = 0.34;
      head.add(crown);
    }

    if (this.staffData.hasGlasses) {
      const glassesMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
      const frameL = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.015, 8, 16), glassesMat);
      frameL.position.set(0.08, 0.03, 0.24);
      const frameR = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.015, 8, 16), glassesMat);
      frameR.position.set(-0.08, 0.03, 0.24);
      head.add(frameL);
      head.add(frameR);
    }

    // 4. Arms
    const armGeom = new THREE.CylinderGeometry(0.08, 0.07, 0.5, 10);
    armGeom.translate(0, -0.2, 0);

    this.leftArm = new THREE.Mesh(armGeom, uniformMat);
    this.leftArm.position.set(0.32, 0.24, 0);
    torso.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeom, uniformMat);
    this.rightArm.position.set(-0.32, 0.24, 0);
    torso.add(this.rightArm);

    // 5. Legs
    const legGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.6, 10);
    legGeom.translate(0, -0.28, 0);

    this.leftLeg = new THREE.Mesh(legGeom, darkMat);
    this.leftLeg.position.set(0.14, 0.6, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeom, darkMat);
    this.rightLeg.position.set(-0.14, 0.6, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    this.attachRoleProp();
  }

  attachRoleProp() {
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

    if (this.staffData.dept === 'waiter') {
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16), silverMat);
      tray.position.set(0, -0.4, 0.3);
      const cloche = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), silverMat);
      cloche.position.set(0, 0.02, 0);
      tray.add(cloche);

      this.rightArm.add(tray);
      this.rightArm.rotation.x = -Math.PI / 3;
      this.propMesh = tray;
    } else if (this.staffData.dept === 'bar') {
      const shaker = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.32, 12), silverMat);
      shaker.position.set(0, -0.38, 0.15);
      this.rightArm.add(shaker);
      this.rightArm.rotation.x = -Math.PI / 4;
      this.propMesh = shaker;
    } else if (this.staffData.dept === 'kitchen') {
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.06, 12), blackMat);
      pan.position.set(0, -0.4, 0.22);
      this.rightArm.add(pan);
      this.rightArm.rotation.x = -Math.PI / 4;
      this.propMesh = pan;
    } else if (this.staffData.dept === 'accountant') {
      const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.4), blackMat);
      tablet.position.set(0, -0.38, 0.15);
      tablet.rotation.x = 0.5;
      this.rightArm.add(tablet);
      this.rightArm.rotation.x = -Math.PI / 4;
      this.propMesh = tablet;
    } else {
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.38), silverMat);
      board.position.set(0, -0.38, 0.15);
      board.rotation.x = 0.5;
      this.rightArm.add(board);
      this.rightArm.rotation.x = -Math.PI / 4;
      this.propMesh = board;
    }
  }

  buildFloatingNameTag() {
    const tagContainer = document.createElement('div');
    tagContainer.className = 'staff-name-tag';
    tagContainer.dataset.staffId = this.staffData.id;
    this.labelDiv = tagContainer;

    const header = document.createElement('div');
    header.className = 'tag-header';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'tag-icon';
    iconSpan.textContent = this.staffData.icon;

    const rolePill = document.createElement('span');
    rolePill.className = 'tag-role-pill';
    rolePill.style.backgroundColor = this.staffData.color;
    rolePill.textContent = this.staffData.role;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'tag-name';
    nameSpan.textContent = this.staffData.name;
    this.nameSpanEl = nameSpan;

    const editBtn = document.createElement('button');
    editBtn.className = 'tag-edit-btn';
    editBtn.title = '✏️ คลิกเพื่อแก้ไขชื่อพนักงาน';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('openEditStaffModal', { detail: { staff: this.staffData } }));
    });

    header.appendChild(iconSpan);
    header.appendChild(rolePill);
    header.appendChild(nameSpan);
    header.appendChild(editBtn);

    const statusBubble = document.createElement('div');
    statusBubble.className = 'tag-status-bubble';

    const pulseDot = document.createElement('span');
    pulseDot.className = 'status-pulse-dot';
    pulseDot.style.backgroundColor = this.staffData.color;

    const statusTextEl = document.createElement('span');
    statusTextEl.className = 'status-text';
    statusTextEl.textContent = this.statusText;
    this.statusTextEl = statusTextEl;

    statusBubble.appendChild(pulseDot);
    statusBubble.appendChild(statusTextEl);

    tagContainer.appendChild(header);
    tagContainer.appendChild(statusBubble);

    tagContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('selectStaff', { detail: { staff: this.staffData } }));
    });

    this.css2dLabel = new THREE.CSS2DObject(tagContainer);
    this.css2dLabel.position.set(0, 2.35, 0);
    this.group.add(this.css2dLabel);
  }

  updateProfile(newStaffData) {
    this.staffData.name = newStaffData.name;
    this.staffData.nickname = newStaffData.nickname;
    this.staffData.title = newStaffData.title;
    this.staffData.id = newStaffData.id;

    if (this.nameSpanEl) {
      this.nameSpanEl.textContent = newStaffData.name;
    }
    if (this.labelDiv) {
      this.labelDiv.dataset.staffName = newStaffData.name;
      this.labelDiv.classList.add('tag-updated-glow');
      setTimeout(() => {
        if (this.labelDiv) this.labelDiv.classList.remove('tag-updated-glow');
      }, 1500);
    }
  }

  setStatus(newStatus, actionDesc = '') {
    this.statusText = newStatus;
    this.staffData.currentStatus = newStatus;
    if (actionDesc) {
      this.actionDesc = actionDesc;
      this.staffData.actionDesc = actionDesc;
    }
    if (this.statusTextEl) {
      this.statusTextEl.textContent = newStatus;
    }
  }

  walkTo(x, z, onArrival = null) {
    this.targetPos.set(x, 0, z);
    this.isWalking = true;
    this.onArrivalCallback = onArrival;
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  update(delta, time) {
    if (this.isWalking) {
      const dir = new THREE.Vector3().subVectors(this.targetPos, this.currentPos);
      dir.y = 0;
      const dist = dir.length();

      if (dist < 0.15) {
        this.currentPos.copy(this.targetPos);
        this.group.position.copy(this.currentPos);
        this.isWalking = false;

        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.torso.position.y = 0.95;

        if (this.onArrivalCallback) {
          const cb = this.onArrivalCallback;
          this.onArrivalCallback = null;
          cb();
        }
      } else {
        dir.normalize();
        const moveDist = Math.min(dist, this.walkSpeed * delta);
        this.currentPos.addScaledVector(dir, moveDist);
        this.group.position.copy(this.currentPos);

        const targetAngle = Math.atan2(dir.x, dir.z);
        this.group.rotation.y = targetAngle;

        this.walkCycle += delta * 12;
        this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.65;
        this.rightLeg.rotation.x = -Math.sin(this.walkCycle) * 0.65;

        this.torso.position.y = 0.95 + Math.abs(Math.sin(this.walkCycle)) * 0.06;

        if (this.staffData.dept !== 'waiter') {
          this.leftArm.rotation.x = -Math.sin(this.walkCycle) * 0.45;
        }
      }
    } else {
      this.torso.position.y = 0.95 + Math.sin(time * 2 + this.staffData.id.charCodeAt(5)) * 0.015;
    }
  }
}
