/**
 * Physics Manager - Handles player physics and collision detection
 */

import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { APP_CONFIG } from '@/config/app.config';
import type { KeyState } from '@/types';

export class PhysicsManager {
  private raycaster: THREE.Raycaster;
  private playerVelocity: THREE.Vector3;
  private playerDirection: THREE.Vector3;
  private playerOnFloor: boolean = false;
  private currentMoveSpeed: number;
  private keys: KeyState;

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.currentMoveSpeed = APP_CONFIG.physics.baseMoveSpeed;
    
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
    };
  }

  updatePlayerDesktop(
    delta: number,
    pointerLockControls: PointerLockControls,
    colliderMeshes: THREE.Mesh[]
  ): void {
    if (!pointerLockControls.isLocked) return;

    const physics = APP_CONFIG.physics;
    const playerPos = pointerLockControls.getObject().position;

    // 1. Vertical Movement (Gravity & Floor)
    this.raycaster.set(playerPos, new THREE.Vector3(0, -1, 0));
    const floorIntersections = this.raycaster.intersectObjects(colliderMeshes);
    const localOnFloor = floorIntersections.length > 0 && 
                         floorIntersections[0].distance < physics.playerHeight + 0.1;

    if (localOnFloor) {
      this.playerVelocity.y = Math.max(0, this.playerVelocity.y);
      
      if (this.keys.jump) {
        this.playerVelocity.y = physics.jumpVelocity;
        this.keys.jump = false;
      }
      
      const floorDist = floorIntersections[0].distance;
      if (floorDist < physics.playerHeight) {
        playerPos.y += physics.playerHeight - floorDist;
      }
    } else {
      this.playerVelocity.y += physics.gravity * delta;
    }

    playerPos.y += this.playerVelocity.y * delta;

    // 2. Horizontal Movement (Friction)
    this.playerVelocity.x -= this.playerVelocity.x * physics.friction * delta;
    this.playerVelocity.z -= this.playerVelocity.z * physics.friction * delta;

    // 3. Horizontal Input
    this.playerDirection.z = Number(this.keys.forward) - Number(this.keys.backward);
    this.playerDirection.x = Number(this.keys.right) - Number(this.keys.left);
    this.playerDirection.normalize();

    if (this.keys.forward || this.keys.backward) {
      this.playerVelocity.z -= this.playerDirection.z * this.currentMoveSpeed * delta;
    }
    if (this.keys.left || this.keys.right) {
      this.playerVelocity.x -= this.playerDirection.x * this.currentMoveSpeed * delta;
    }

    // 4. Apply Horizontal Movement
    pointerLockControls.moveRight(-this.playerVelocity.x * delta);
    pointerLockControls.moveForward(-this.playerVelocity.z * delta);

    // 5. Collision Resolution
    const horizontalCheckPos = new THREE.Vector3(
      playerPos.x,
      playerPos.y - physics.playerHeight / 2,
      playerPos.z
    );

    const checkDirections = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];

    for (const dir of checkDirections) {
      this.raycaster.set(horizontalCheckPos, dir);
      const wallIntersections = this.raycaster.intersectObjects(colliderMeshes);

      if (wallIntersections.length > 0 && wallIntersections[0].distance < physics.playerRadius) {
        const penetrationDepth = physics.playerRadius - wallIntersections[0].distance;
        playerPos.x -= dir.x * (penetrationDepth + 0.01);
        playerPos.z -= dir.z * (penetrationDepth + 0.01);

        if (dir.x !== 0) this.playerVelocity.x = 0;
        if (dir.z !== 0) this.playerVelocity.z = 0;
      }
    }

    // 6. Final Ground Check
    this.raycaster.set(playerPos, new THREE.Vector3(0, -1, 0));
    const finalFloorIntersections = this.raycaster.intersectObjects(colliderMeshes);
    
    if (finalFloorIntersections.length > 0) {
      const floorDist = finalFloorIntersections[0].distance;
      if (floorDist < physics.playerHeight + 0.1) {
        this.playerOnFloor = true;
        if (floorDist < physics.playerHeight) {
          playerPos.y = finalFloorIntersections[0].point.y + physics.playerHeight;
          if (this.playerVelocity.y < 0) this.playerVelocity.y = 0;
        }
      } else {
        this.playerOnFloor = false;
      }
    } else {
      this.playerOnFloor = false;
    }
  }

  updatePlayerVR(
    delta: number,
    playerRig: THREE.Group,
    camera: THREE.Camera,
    colliderMeshes: THREE.Mesh[],
    vrControllers: any[]
  ): void {
    const physics = APP_CONFIG.physics;
    const vr = APP_CONFIG.vr;
    const playerPos = playerRig.position;

    let moveGamepad: any = null;
    let turnGamepad: any = null;

    vrControllers.forEach((controller) => {
      if (controller.userData.gamepad) {
        if (controller.userData.hand === 'left') {
          moveGamepad = controller.userData.gamepad;
        } else if (controller.userData.hand === 'right') {
          turnGamepad = controller.userData.gamepad;
        }
      }
    });

    // 1. Vertical Movement
    const rayStart = playerPos.clone().add(new THREE.Vector3(0, 0.1, 0));
    this.raycaster.set(rayStart, new THREE.Vector3(0, -1, 0));
    const floorIntersections = this.raycaster.intersectObjects(colliderMeshes);
    const onFloor = floorIntersections.length > 0 && floorIntersections[0].distance < 0.15;

    if (onFloor) {
      this.playerVelocity.y = Math.max(0, this.playerVelocity.y);
      const targetY = floorIntersections[0].point.y + 0.05;
      playerPos.y = targetY;
    } else {
      this.playerVelocity.y += physics.gravity * delta;
    }

    // 2. Horizontal Movement (Friction)
    this.playerVelocity.x -= this.playerVelocity.x * physics.friction * delta;
    this.playerVelocity.z -= this.playerVelocity.z * physics.friction * delta;

    // 3. Input & Direction
    let moveSpeed = vr.moveSpeed;
    const moveDirection = new THREE.Vector3();

    if (moveGamepad) {
      moveDirection.x = moveGamepad.axes[2] || 0;
      moveDirection.z = moveGamepad.axes[3] || 0;
      if (moveGamepad.buttons[0] && moveGamepad.buttons[0].value > vr.sprintThreshold) {
        moveSpeed *= physics.sprintMultiplier;
      }
    }

    if (turnGamepad) {
      const turnAxis = turnGamepad.axes[2] || 0;
      if (Math.abs(turnAxis) > 0.1) {
        playerRig.rotateY(-turnAxis * delta * vr.turnSpeed);
      }
    }

    const cameraDirection = camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    const forwardVector = cameraDirection.clone().multiplyScalar(-moveDirection.z * moveSpeed * delta);
    const rightVector = camera.getWorldDirection(new THREE.Vector3())
      .cross(camera.up)
      .normalize()
      .multiplyScalar(moveDirection.x * moveSpeed * delta);

    this.playerVelocity.x += forwardVector.x + rightVector.x;
    this.playerVelocity.z += forwardVector.z + rightVector.z;

    // 4. Apply Position
    playerRig.position.x += this.playerVelocity.x * delta;
    playerRig.position.z += this.playerVelocity.z * delta;
    playerRig.position.y += this.playerVelocity.y * delta;

    // 5. Collision Resolution
    const horizontalCheckPos = playerRig.position.clone().add(new THREE.Vector3(0, 1.0, 0));
    const checkDirections = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];

    for (const dir of checkDirections) {
      this.raycaster.set(horizontalCheckPos, dir);
      const wallIntersections = this.raycaster.intersectObjects(colliderMeshes);

      if (wallIntersections.length > 0 && wallIntersections[0].distance < physics.playerRadius) {
        const penetrationDepth = physics.playerRadius - wallIntersections[0].distance;
        playerRig.position.x -= dir.x * (penetrationDepth + 0.01);
        playerRig.position.z -= dir.z * (penetrationDepth + 0.01);

        if (dir.x !== 0) this.playerVelocity.x = 0;
        if (dir.z !== 0) this.playerVelocity.z = 0;
      }
    }

    // 6. Final Floor Check
    const finalRayStart = playerPos.clone().add(new THREE.Vector3(0, 0.1, 0));
    this.raycaster.set(finalRayStart, new THREE.Vector3(0, -1, 0));
    const finalFloorIntersections = this.raycaster.intersectObjects(colliderMeshes);

    if (finalFloorIntersections.length > 0) {
      const floorDist = finalFloorIntersections[0].distance;
      if (floorDist < 0.15) {
        const targetY = finalFloorIntersections[0].point.y + 0.05;
        playerPos.y = targetY;
        if (this.playerVelocity.y < 0) this.playerVelocity.y = 0;
      }
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    const physics = APP_CONFIG.physics;
    
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = true;
        break;
      case 'KeyS':
        this.keys.backward = true;
        break;
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'Space':
        if (this.playerOnFloor) {
          this.keys.jump = true;
        }
        break;
      case 'ShiftLeft':
        this.keys.sprint = true;
        this.currentMoveSpeed = physics.baseMoveSpeed * physics.sprintMultiplier;
        break;
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    const physics = APP_CONFIG.physics;
    
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = false;
        break;
      case 'KeyS':
        this.keys.backward = false;
        break;
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
      case 'ShiftLeft':
        this.keys.sprint = false;
        this.currentMoveSpeed = physics.baseMoveSpeed;
        break;
    }
  }

  reset(): void {
    this.playerVelocity.set(0, 0, 0);
    this.playerOnFloor = true;
    Object.keys(this.keys).forEach((key) => {
      (this.keys as any)[key] = false;
    });
  }

  isPlayerOnFloor(): boolean {
    return this.playerOnFloor;
  }
}
