import * as THREE from 'three';
import App from '../App';
import { inputStore } from '../Utils/Store';

export default class AnimationController {
    constructor() {
        this.app = new App();
        this.scene = this.app.scene;
        this.avatar = this.app.world.character.avatar;
        this.environment = this.app.world.environment;

        this.mixer = null;
        this.animations = new Map();

        if (this.avatar) {
            this.setupAnimations();
        }

        inputStore.subscribe((input) => this.onInput(input));
    }

    setupAnimations() {
        this.mixer = new THREE.AnimationMixer(this.avatar.scene);

        this.avatar.animations.forEach((clip) => {
            this.animations.set(clip.name, this.mixer.clipAction(clip));
        });

        this.playAnimation('dance');
    }

    playAnimation(name) {
        const action = this.animations.get(name);
        if (!action || action === this.currentAction) return;

        if (this.currentAction) {
            this.currentAction.fadeOut(0.5);
        }

        action.reset().fadeIn(0.5).play();
        this.currentAction = action;
    }

    onInput(input) {
        if (this.animations.size === 0) {
            this.handleDirectionChange(input);
            return;
        }

        if (input.forward || input.backward || input.left || input.right) {
            this.playAnimation('run');
        } else {
            this.playAnimation('idle');
        }
    }

    handleDirectionChange(input) {
        const rotationSpeed = 0.05;
        if (input.left) {
            this.avatar.scene.rotation.y += rotationSpeed;
        } else if (input.right) {
            this.avatar.scene.rotation.y -= rotationSpeed;
        }
    }

    loop(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        if (this.environment) {
            this.environment.loop(deltaTime);
        }
    }
}