import * as THREE from 'three';
import assert from 'assert';

/**
 * Represent Vectorizer
 * @interface Controller
 * @extends {THREE.EventDispatcher}
 */
export default class Controller extends THREE.EventDispatcher {
    /**
     * @constructor
     */
    constructor() {
        super();
    }
}