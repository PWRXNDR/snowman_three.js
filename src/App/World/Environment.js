import * as THREE from "three";
import App from "../App.js";
import assetStore from "../Utils/AssetStore.js";

export default class Environment {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.physics = this.app.world.physics;
      this.pane = this.app.gui.pane;

      this.assetStore = assetStore.getState()
      this.environment = this.assetStore.loadedAssets.environment

    this.loadEnvironment();
    this.addLights();
  }

  loadEnvironment() {
      const environmentScene = this.environment.scene;
      this.scene.add(environmentScene);

      const snowMaterial = new THREE.MeshStandardMaterial({
          color: 0xFFFAFA, 
          roughness: 0.9, 
          metalness: 0, 
          emissive: 0xaaaaaa, 
          emissiveIntensity: 0.2, 
      });

      
      environmentScene.traverse((child) => {
          if (child.isMesh) {
              if (child.name.includes('floor') || child.name.includes('Plane')) {
                  child.material = snowMaterial;
              }
          }
      });

      environmentScene.position.set(-4.8, 0, -7.4)
      environmentScene.rotation.set(0, -.60, 0)
      environmentScene.scale.setScalar(1.3)

      const physicalObjects = [
          'floor',
      ]

      const shadowCasters = [
      ]

      const shadowReceivers = ['floor',
      ]

      for (const child of environmentScene.children) {
          child.traverse((obj) => {
              if (obj.isMesh) {
                  obj.castShadow = shadowCasters.some((keyword) => child.name.includes(keyword))
                  obj.receiveShadow = shadowReceivers.some((keyword) => child.name.includes(keyword))
                  if (physicalObjects.some((keyword) => child.name.includes(keyword))) {
                      this.physics.add(obj, "fixed", "cuboid")
                  }
              }
          })
      }
  }


  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(1, 1, 1);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
  }

}
