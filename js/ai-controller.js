/**
 * JAABBAR 3D LIVE OPS - Autonomous AI Multi-Agent Operations Simulation
 * Coordinates 18 Staff, Orders, Pathing, Revenue & Live Activity Feed
 */

class AIController {
  constructor(sceneInstance, charManager, staffMgr, soundEng) {
    this.sceneInstance = sceneInstance;
    this.charManager = charManager;
    this.staffManager = staffMgr;
    this.soundEngine = soundEng;

    this.simSpeed = 1.0;
    this.isRushHour = false;

    this.metrics = {
      occupiedTables: 43,
      totalTables: 54,
      totalSeats: 60,
      completedOrders: 142,
      liveRevenue: 184500,
      activeOrders: 4
    };

    this.readyOrders = [];
    this.pendingTableOrders = [];
    this.activityLogs = [];
    this.maxLogs = 80;

    this.waypoints = {
      kitchenPass: { x: 25.0, z: 0.0 },
      barPickup: { x: 2.5, z: 13.5 },
      barPOS: { x: 6.5, z: 14.5 },
      backroomDesk: { x: 2.0, z: 21.0 },
      vipCenter: { x: 0.0, z: -8.0 },
      vipStage: { x: -6.0, z: -14.0 },
      entrance: { x: -24.0, z: 22.0 },
      sofaZone: { x: 22.0, z: 11.0 },
      zoneAFront: { x: 0.0, z: -1.5 },
      zoneBMiddle: { x: 0.0, z: 7.0 }
    };

    this.orderGenTimer = 0;
    this.chefCookTimer = 0;
    this.accountantTimer = 0;
    this.managerPatrolTimer = 0;
    this.ceoPatrolTimer = 0;

    this.initInitialOrders();
  }

  initInitialOrders() {
    const initialTables = ['50', '24', '14', '3'];
    initialTables.forEach(tId => {
      this.generateNewOrder(tId, false);
    });

    this.addLog(
      'ระบบ',
      '🌟 เริ่มต้นการทำงานระบบ JAABBAR 3D LIVE OPS เต็มรูปแบบ พร้อมเจ้าหน้าที่ AI 18 อัตรา',
      '#8b5cf6'
    );
  }

  setSpeed(speed) {
    this.simSpeed = speed;
  }

  toggleRushHour() {
    this.isRushHour = !this.isRushHour;
    if (this.isRushHour) {
      this.addLog('แจ้งเตือน', '⚡ เปิดโหมดชั่วโมงเร่งด่วน (RUSH HOUR)! ลูกค้าหลั่งไหลเข้าสู่ร้าน', '#ef4444');
    } else {
      this.addLog('แจ้งเตือน', '🍃 สิ้นสุดโหมดชั่วโมงเร่งด่วน กลับสู่สภาวะปกติ', '#10b981');
    }
    return this.isRushHour;
  }

  addLog(category, message, color = '#38bdf8') {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', { hour12: false });

    const logEntry = {
      id: Date.now() + Math.random(),
      time: timeStr,
      category,
      message,
      color
    };

    this.activityLogs.unshift(logEntry);
    if (this.activityLogs.length > this.maxLogs) {
      this.activityLogs.pop();
    }

    window.dispatchEvent(new CustomEvent('newActivityLog', { detail: { log: logEntry } }));
  }

  generateNewOrder(targetTableId = null, notify = true) {
    const tableKeys = Array.from(this.sceneInstance.tableMeshes.keys());
    let tableId = targetTableId;

    if (!tableId) {
      const available = tableKeys.filter(k => {
        const mesh = this.sceneInstance.tableMeshes.get(k);
        return mesh && mesh.userData.isOccupied && !mesh.userData.orderPending;
      });
      if (available.length === 0) return;
      tableId = available[Math.floor(Math.random() * available.length)];
    }

    const tableGroup = this.sceneInstance.tableMeshes.get(tableId);
    if (!tableGroup) return;

    const zone = tableGroup.userData.zone;
    let orderType = 'food';
    let orderName = 'ไก่ทอดเกาหลีสูตรจ๊าบบาร์';
    let price = 280;
    let station = 'kitchen';

    if (zone === 'VIP') {
      const vipMenus = [
        { type: 'champagne', name: 'แชมเปญ Dom Pérignon เซ็ต VIP', price: 4500, station: 'bar' },
        { type: 'food', name: 'เซ็ตเนื้อวากิวย่างหินภูเขาไฟ', price: 1890, station: 'kitchen' },
        { type: 'drink', name: 'Jaabbar Signature Cocktail VIP', price: 650, station: 'bar' }
      ];
      const item = vipMenus[Math.floor(Math.random() * vipMenus.length)];
      orderType = item.type;
      orderName = item.name;
      price = item.price;
      station = item.station;
    } else if (zone === 'BAR') {
      orderType = 'drink';
      orderName = 'Seoul Sunset Mocktail';
      price = 220;
      station = 'bar';
    } else if (Math.random() > 0.5) {
      orderType = 'drink';
      orderName = 'ค็อกเทล โซลไนท์ไลฟ์';
      price = 320;
      station = 'bar';
    } else {
      orderType = 'food';
      orderName = 'ต๊อกบกกีชีสกระทะร้อน';
      price = 290;
      station = 'kitchen';
    }

    this.sceneInstance.showTableOrder(tableId, orderType, orderName);

    const orderObj = {
      orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      tableId,
      tableLabel: tableGroup.userData.label,
      zone,
      type: orderType,
      name: orderName,
      price,
      station,
      status: 'preparing'
    };

    this.pendingTableOrders.push(orderObj);
    this.metrics.activeOrders = this.pendingTableOrders.length;

    if (notify) {
      this.addLog(
        'ออเดอร์ใหม่',
        `🔔 [โต๊ะ ${tableGroup.userData.label}] สั่ง "${orderName}" (฿${price.toLocaleString()})`,
        '#f59e0b'
      );
    }
  }

  update(delta) {
    if (this.simSpeed === 0) return;

    const scaledDelta = delta * this.simSpeed;
    const nowTime = performance.now() / 1000;

    const genInterval = this.isRushHour ? 6.0 : 13.0;
    this.orderGenTimer += scaledDelta;
    if (this.orderGenTimer > genInterval) {
      this.orderGenTimer = 0;
      if (this.pendingTableOrders.length < 9) {
        this.generateNewOrder();
      }
    }

    this.updateKitchenChefs(scaledDelta);
    this.updateBartenders(scaledDelta);
    this.updateWaitstaff(scaledDelta);
    this.updateAccountant(scaledDelta);
    this.updateManagers(scaledDelta);
    this.updateCEOs(scaledDelta);

    this.charManager.updateAll(scaledDelta, nowTime);
  }

  updateKitchenChefs(delta) {
    this.chefCookTimer += delta;
    if (this.chefCookTimer > 4.5) {
      this.chefCookTimer = 0;

      const pendingFood = this.pendingTableOrders.find(o => o.station === 'kitchen' && o.status === 'preparing');

      const chefs = [
        this.charManager.getCharacterById('JB-KIT-01'),
        this.charManager.getCharacterById('JB-KIT-02'),
        this.charManager.getCharacterById('JB-KIT-03'),
        this.charManager.getCharacterById('JB-KIT-04'),
        this.charManager.getCharacterById('JB-KIT-05')
      ].filter(Boolean);

      const activeChef = chefs[Math.floor(Math.random() * chefs.length)];
      if (!activeChef || activeChef.isWalking) return;

      if (pendingFood) {
        pendingFood.status = 'ready';
        this.soundEngine.playActionSfx('kitchen');

        activeChef.setStatus(`วาง "${pendingFood.name}" ที่ช่องส่ง`, `เตรียมอาหารเสร็จสมบูรณ์`);
        activeChef.walkTo(this.waypoints.kitchenPass.x + 1.5, this.waypoints.kitchenPass.z, () => {
          this.readyOrders.push(pendingFood);
          this.addLog(
            'ครัวร้อน',
            `🍳 ${activeChef.staffData.name} ปรุง "${pendingFood.name}" เสร็จแล้ว วางที่ช่องส่งอาหาร`,
            '#f97316'
          );

          setTimeout(() => {
            activeChef.setStatus('ปรุงเมนูกระทะร้อนและอาหารเกาหลี');
            activeChef.walkTo(activeChef.staffData.workPos.x, activeChef.staffData.workPos.z);
          }, 2000);
        });
      } else {
        const cookingActions = [
          'ควบคุมไฟและผัดกระทะร้อน',
          'ย่างหมูสามชั้นเกาหลีบนเตา',
          'จัดจานเครื่องเคียงกิมจิสด',
          'ตกแต่งของหวานบิงซูสตรอว์เบอร์รี'
        ];
        activeChef.setStatus(cookingActions[Math.floor(Math.random() * cookingActions.length)]);
      }
    }
  }

  updateBartenders(delta) {
    const bar1 = this.charManager.getCharacterById('JB-BAR-01');
    const bar2 = this.charManager.getCharacterById('JB-BAR-02');

    if (!bar1 || !bar2) return;

    const pendingDrink = this.pendingTableOrders.find(o => o.station === 'bar' && o.status === 'preparing');

    if (pendingDrink && !bar1.isWalking && Math.random() > 0.4) {
      pendingDrink.status = 'ready';
      this.soundEngine.playActionSfx('bar');

      bar1.setStatus(`กำลังชง "${pendingDrink.name}"`, 'ผสมเครื่องดื่มค็อกเทลสด');

      setTimeout(() => {
        bar1.setStatus(`วาง "${pendingDrink.name}" ที่จุดรับบาร์น้ำ`);
        this.readyOrders.push(pendingDrink);
        this.addLog(
          'บาร์น้ำ',
          `🍸 ${bar1.staffData.name} ชงเครื่องดื่ม "${pendingDrink.name}" วางที่เคาน์เตอร์บาร์น้ำเรียบร้อย`,
          '#06b6d4'
        );

        setTimeout(() => {
          bar1.setStatus('เชค Signature Cocktail');
        }, 2200);
      }, 2500);
    }

    if (!bar2.isWalking && Math.random() < 0.05) {
      const stoolIds = ['B-1', 'B-2', 'B-3', 'B-4', 'B-5', 'B-6'];
      const stoolId = stoolIds[Math.floor(Math.random() * stoolIds.length)];
      bar2.setStatus(`บริการลูกค้าหน้าบาร์ ${stoolId}`);
    }
  }

  updateWaitstaff(delta) {
    if (this.readyOrders.length === 0) return;

    const waiters = [
      this.charManager.getCharacterById('JB-SRV-01'),
      this.charManager.getCharacterById('JB-SRV-02'),
      this.charManager.getCharacterById('JB-SRV-03'),
      this.charManager.getCharacterById('JB-SRV-04'),
      this.charManager.getCharacterById('JB-SRV-05'),
      this.charManager.getCharacterById('JB-SRV-06')
    ].filter(Boolean);

    const availableWaiter = waiters.find(w => !w.isWalking && (!w.assignedTask || w.assignedTask === 'idle'));
    if (!availableWaiter) return;

    const orderToDeliver = this.readyOrders.shift();
    if (!orderToDeliver) return;

    availableWaiter.assignedTask = 'delivering';
    const targetTableMesh = this.sceneInstance.tableMeshes.get(orderToDeliver.tableId);
    if (!targetTableMesh) return;

    const pickupPoint = orderToDeliver.station === 'kitchen' ? this.waypoints.kitchenPass : this.waypoints.barPickup;
    availableWaiter.setStatus(`ไปรับ "${orderToDeliver.name}" ที่${orderToDeliver.station === 'kitchen' ? 'ครัว' : 'บาร์'}`);

    availableWaiter.walkTo(pickupPoint.x, pickupPoint.z, () => {
      availableWaiter.setStatus(`กำลังนำเสิร์ฟ โต๊ะ ${orderToDeliver.tableLabel}`);

      const tablePos = targetTableMesh.position;
      availableWaiter.walkTo(tablePos.x + 1.2, tablePos.z + 0.8, () => {
        this.sceneInstance.clearTableOrder(orderToDeliver.tableId);
        this.soundEngine.playServeChime();

        this.pendingTableOrders = this.pendingTableOrders.filter(o => o.orderId !== orderToDeliver.orderId);

        this.metrics.completedOrders += 1;
        this.metrics.liveRevenue += orderToDeliver.price;
        this.metrics.activeOrders = this.pendingTableOrders.length;
        availableWaiter.staffData.tasksCompleted = (availableWaiter.staffData.tasksCompleted || 0) + 1;

        this.addLog(
          'เสิร์ฟสำเร็จ',
          `✅ ${availableWaiter.staffData.name} เสิร์ฟ "${orderToDeliver.name}" ถึงโต๊ะ ${orderToDeliver.tableLabel} (+฿${orderToDeliver.price.toLocaleString()})`,
          '#10b981'
        );

        window.dispatchEvent(new CustomEvent('updateKpiMetrics', { detail: { metrics: this.metrics } }));

        setTimeout(() => {
          availableWaiter.setStatus('พร้อมรับออเดอร์ใหม่');
          availableWaiter.walkTo(availableWaiter.staffData.workPos.x, availableWaiter.staffData.workPos.z, () => {
            availableWaiter.assignedTask = 'idle';
          });
        }, 1500);
      });
    });
  }

  updateAccountant(delta) {
    this.accountantTimer += delta;
    if (this.accountantTimer > 18.0) {
      this.accountantTimer = 0;

      const acc = this.charManager.getCharacterById('JB-ACC-01');
      if (!acc || acc.isWalking) return;

      acc.setStatus('เดินตรวจนับยอดขายที่บาร์น้ำ');
      acc.walkTo(this.waypoints.barPOS.x, this.waypoints.barPOS.z, () => {
        acc.setStatus('ตรวจสอบยอดใบเสร็จ & ลิ้นชักเงินสด');
        this.addLog(
          'บัญชี & POS',
          `💼 ${acc.staffData.name} ตรวจสอบยอดแคชเชียร์บาร์น้ำ ยอดสะสมปัจจุบัน ฿${this.metrics.liveRevenue.toLocaleString()}`,
          '#6366f1'
        );

        setTimeout(() => {
          acc.setStatus('บันทึกสมุดบัญชีในห้องหลังบาร์');
          acc.walkTo(this.waypoints.backroomDesk.x, this.waypoints.backroomDesk.z, () => {
            acc.setStatus('ตรวจเช็กยอดขาย POS แบบเรียลไทม์');
          });
        }, 3500);
      });
    }
  }

  updateManagers(delta) {
    this.managerPatrolTimer += delta;
    if (this.managerPatrolTimer > 14.0) {
      this.managerPatrolTimer = 0;

      const mgr1 = this.charManager.getCharacterById('JB-MGR-01');
      const mgr2 = this.charManager.getCharacterById('JB-MGR-02');

      if (mgr1 && !mgr1.isWalking) {
        const patrolPoints = [this.waypoints.vipStage, this.waypoints.vipCenter, this.waypoints.barPickup];
        const pt = patrolPoints[Math.floor(Math.random() * patrolPoints.length)];
        mgr1.setStatus('ตรวจความเรียบร้อยรอบเวที & โซน VIP');
        mgr1.walkTo(pt.x, pt.z, () => {
          this.addLog('ผู้จัดการ', `📋 ${mgr1.staffData.name} ตรวจสอบมาตรฐานการบริการและแสงสีเสียงรอบเวที VIP`, '#a855f7');
        });
      }

      if (mgr2 && !mgr2.isWalking) {
        const patrolPoints = [this.waypoints.kitchenPass, this.waypoints.sofaZone, this.waypoints.zoneBMiddle];
        const pt = patrolPoints[Math.floor(Math.random() * patrolPoints.length)];
        mgr2.setStatus('ตรวจคิวอาหารและคุณภาพการบริการ');
        mgr2.walkTo(pt.x, pt.z, () => {
          this.addLog('ผู้จัดการ', `📑 ${mgr2.staffData.name} ตรวจสอบความเร็วการออกอาหารที่ช่องส่งครัว`, '#9333ea');
        });
      }
    }
  }

  updateCEOs(delta) {
    this.ceoPatrolTimer += delta;
    if (this.ceoPatrolTimer > 20.0) {
      this.ceoPatrolTimer = 0;

      const ceo1 = this.charManager.getCharacterById('JB-CEO-01');
      const ceo2 = this.charManager.getCharacterById('JB-CEO-02');

      if (ceo1 && !ceo1.isWalking) {
        const vipWalk = [this.waypoints.vipStage, this.waypoints.vipCenter, this.waypoints.zoneAFront];
        const pt = vipWalk[Math.floor(Math.random() * vipWalk.length)];
        ceo1.setStatus('ตรวจเยี่ยมบรรยากาศคอนเสิร์ต');
        ceo1.walkTo(pt.x, pt.z, () => {
          this.addLog('ผู้บริหาร', `👑 ${ceo1.staffData.name} เดินตรวจบรรยากาศการแสดงและทักทายลูกค้าคนสำคัญ`, '#eab308');
        });
      }

      if (ceo2 && !ceo2.isWalking) {
        const entranceWalk = [this.waypoints.entrance, this.waypoints.sofaZone, this.waypoints.barPickup];
        const pt = entranceWalk[Math.floor(Math.random() * entranceWalk.length)];
        ceo2.setStatus('ต้อนรับลูกค้าและตรวจภาพรวมหน้าร้าน');
        ceo2.walkTo(pt.x, pt.z, () => {
          this.addLog('ผู้บริหาร', `💎 ${ceo2.staffData.name} สังเกตการณ์การไหลเวียนลูกค้าและจุดต้อนรับทางเข้า`, '#f59e0b');
        });
      }
    }
  }
}
