import * as THREE from 'three';
import App from '../App';
import { inputStore } from '../Utils/Store';

export default class AnimationController {
    constructor() {
        this.app = new App();
        this.scene = this.app.scene;
        this.avatar = this.app.world.character.avatar;

        inputStore.subscribe((input) => this.onInput(input));

        this.animations = new Map();
        this.mixer = null;
        if (this.avatar.animations && this.avatar.animations.length > 0) {
            this.instantiatedAnimations();
        }
    }

    instantiatedAnimations() {
        const idle = this.avatar.animations[0];
        this.mixer = new THREE.AnimationMixer(this.avatar.scene);

        this.avatar.animations.forEach((clip) => {
            this.animations.set(clip.name, this.mixer.clipAction(clip));
        });

        this.currentAction = this.animations.get('idle');
        if (this.currentAction) {
            this.currentAction.play();
        }
    }

    playAnimation(name) {
        if (this.currentAction === this.animations.get(name)) return;
        const action = this.animations.get(name);
        if (action) {
            action.reset();
            action.play();
            action.crossFadeFrom(this.currentAction, 0.2);
            this.currentAction = action;
        }
    }

    onInput(input) {
        if (this.animations.size === 0) {
            // No animations available, handle direction changes only
            this.handleDirectionChange(input);
            return;
        }

        if (
            input.forward ||
            input.backward ||
            input.left ||
            input.right
        ) {
            this.playAnimation('run');
        } else {
            this.playAnimation('idle');
        }
    }

    handleDirectionChange(input) {
        // Implement logic to change snowman's direction based on input
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
    }
}