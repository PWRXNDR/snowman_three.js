import * as THREE from "three";
import App from "../App.js";
import assetStore from "../Utils/AssetStore.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Environment {
    constructor() {
        this.app = new App();
        this.scene = this.app.scene;
        this.physics = this.app.world.physics;
        this.pane = this.app.gui.pane;
        this.assetStore = assetStore.getState();
        this.environment = this.assetStore.loadedAssets.environment;

        this.loadEnvironment();
        this.addLights();
        this.createSnowfall();
        this.setBackgroundColor();
        this.loadCharacter();
    }

    loadEnvironment() {
        const environmentScene = this.environment.scene;
        this.scene.add(environmentScene);

        const snowMaterial = new THREE.MeshStandardMaterial({
            color: 0x68BB50,
            roughness: 0.75,
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

        environmentScene.position.set(-4.8, 0, -7.4);
        environmentScene.rotation.set(0, -0.60, 0);
        environmentScene.scale.setScalar(1.3);

        const physicalObjects = ['floor'];

        const shadowCasters = [];

        const shadowReceivers = ['floor'];

        for (const child of environmentScene.children) {
            child.traverse((obj) => {
                if (obj.isMesh) {
                    obj.castShadow = shadowCasters.some((keyword) =>
                        child.name.includes(keyword)
                    );
                    obj.receiveShadow = shadowReceivers.some((keyword) =>
                        child.name.includes(keyword)
                    );
                    if (
                        physicalObjects.some((keyword) => child.name.includes(keyword))
                    ) {
                        this.physics.add(obj, "fixed", "cuboid");
                    }
                }
            });
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

    createSnowfall() {
        const snowflakes = [];
        const snowflakeCount = 3000;

        const snowflakeGeometry = new THREE.BufferGeometry();
        const snowflakePositions = new Float32Array(snowflakeCount * 3);

        for (let i = 0; i < snowflakeCount; i++) {
            snowflakePositions[i * 3] = (Math.random() - 0.5) * 200;
            snowflakePositions[i * 3 + 1] = Math.random() * 200;
            snowflakePositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }

        snowflakeGeometry.setAttribute('position', new THREE.BufferAttribute(snowflakePositions, 3));

        const snowflakeMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.5,
            transparent: true,
        });

        const snowflakeMesh = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
        this.scene.add(snowflakeMesh);
        snowflakes.push(snowflakeMesh);

        this.snowflakes = snowflakes;
    }

    updateSnowfall() {
        this.snowflakes.forEach(snowflake => {
            const positions = snowflake.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 0.04; // Adjust speed

                if (positions[i + 1] < -50) { // Adjust reset height
                    positions[i + 1] = 100;
                }
            }

            snowflake.geometry.attributes.position.needsUpdate = true;
        });
    }

    setBackgroundColor() {
        this.scene.background = new THREE.Color(0xADD8E6); // Light blue color
    }

    loadCharacter() {
        const loader = new GLTFLoader();
        loader.load('/path/to/your/character.glb', (gltf) => {
            const character = gltf.scene;
            character.name = 'Armature';
            this.scene.add(character);

            const avatar = {
                scene: character,
                animations: gltf.animations,
            };

            this.app.world.character = { avatar };

            const animationController = this.app.world.animationController;
            if (animationController) {
                animationController.setupAnimations();
            }
        }, undefined, (error) => {
            console.error('An error happened while loading the character:', error);
        });
    }

    loop(deltaTime) {
        this.updateSnowfall();
    }
}