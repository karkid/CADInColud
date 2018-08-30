import * as THREE from 'three';
import Controller from './Controller';

/**
 * This set of controls performs orbiting, dollying (zooming), and panning. It maintains
 * the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
 * supported.
 * 
 * Orbit - left mouse / touch: one finger move
 * Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
 * Pan - right mouse, or arrow keys / touch: three finter swipe
 * 
 * @public
 * @extends {Controller}
 * @class
 * @example
 * controls = new THREE.OrbitController( camera );
 * controls.target.z = 150;
 */
export default class OrbitController extends Controller {
    /**
     * @constructor
     * @param {Object} object - Object which need to control using event
     * @param {Object} domElement - parent which hold the object 
     * @param {Object} config - configure the controller
     */
    constructor(object, domElement, config = {}) {
        super();
        /**
         * Object which need to control using event
         * @public
         * @type {Object} 
         */
        this.object = object;
        /**
         * parent which hold the object
         * @public
         * @type {Object} 
         */
        this.domElement = (domElement !== undefined) ? domElement : document;
        /**
         * Configure controller
         * @public
         * @type {Object} 
         */
        this.config = {
            /**
             * Set to false to disable this control
             * @public
             * @type {Boolean} 
             */
            enabled: true,
            /**
             * This option actually enables dollying in and out; left as "zoom" for
             * backwards compatibility
             * @public
             * @type {Boolean} 
             */
            noZoom: false,
            /**
             * Zoom Speed
             * @public
             * @type {Number} 
             */
            zoomSpeed: 1.0,
            /**
             * Limits to how far you can dolly in
             * @public
             * @type {Number} 
             */
            minDistance: 0,
            /**
             * Limits to how far you can dolly out
             * @public
             * @type {Number} 
             */
            maxDistance: Infinity,
            /**
             * Set to true to disable this control
             * @public
             * @type {Boolean} 
             */
            noRotate: false,
            /**
             * Rotation speed
             * @public
             * @type {Number} 
             */
            rotateSpeed: 1.0,
            /**
             * Set to true to disable this control
             * @public
             * @type {Boolean} 
             */
            noPan: false,
            /**
             * Pixels moved per arrow key push
             * @public
             * @type {Number} 
             */
            keyPanSpeed: 7.0,
            /**
             * Set to true to automatically rotate around the target
             * @public
             * @type {Boolean} 
             */
            autoRotate: false,
            /**
             * 30 seconds per round when fps is 60
             * @public
             * @type {Number} 
             */
            autoRotateSpeed: 2.0,
            /**
             * How far you can orbit vertically, upper and lower limits.
             * Range is 0 to Math.PI radians.
             * @public
             * @type {Number} in radians
             */
            minPolarAngle: 0,
            /**
             * How far you can orbit vertically, upper and lower limits.
             * Range is 0 to Math.PI radians.
             * @public
             * @type {Number} in radians
             */
            maxPolarAngle: Math.PI,
            /**
             * Set to true to disable use of the keys
             * @public
             * @type {Number} in radians
             */
            noKeys: false,
            /**
             * The four arrow keys
             * @public
             * @type {Object} in radians
             */
            keys: {
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                BOTTOM: 40
            }
        }
        //Copy User input config
        Object.keys(this.config).forEach(key => this.config[key] = config[key]);

        /**
         * "target" sets the location of focus, where the control orbits around
         * and where it pans with respect to.
         * @public
         * @type {THREE.Vector3} 
         */
        this.target = new THREE.Vector3();

        /**
         * Controller Object instance
         * @private
         * @type {this}
         */
        this._this = this;
        /**
         * Event per second
         * @private
         * @type {Number}
         */
        this._EPS = 0.000001;
        /**
         * Rotation starting vector
         * @private
         * @type {THREE.Vector2}
         */
        this._rotateStart = new THREE.Vector2();
        /**
         * Rotation ending vector
         * @private
         * @type {THREE.Vector2}
         */
        this._rotateEnd = new THREE.Vector2();
        /**
         * Delta to add on each rotation
         * @private
         * @type {THREE.Vector2}
         */
        this._rotateDelta = new THREE.Vector2();
        /**
         * Panning starting vector
         * @private
         * @type {THREE.Vector2}
         */
        this._panStart = new THREE.Vector2();
        /**
         * Panning ending vector
         * @private
         * @type {THREE.Vector2}
         */
        this._panEnd = new THREE.Vector2();
        /**
         * Delta adding on each panning
         * @private
         * @type {THREE.Vector2}
         */
        this._panDelta = new THREE.Vector2();
        /**
         * Pan offset
         * @private
         * @type {THREE.Vector3}
         */
        this._panOffset = new THREE.Vector3();
        /**
         * @private
         * @type {THREE.Vector3}
         */
        this._offset = new THREE.Vector3();
        /**
         * @private
         * @type {THREE.Vector2}
         */
        this._dollyStart = new THREE.Vector2();
        /**
         * @private
         * @type {THREE.Vector2}
         */
        this._dollyEnd = new THREE.Vector2();
        /**
         * @private
         * @type {THREE.Vector2}
         */
        this._dollyDelta = new THREE.Vector2();
        /**
         * @private
         * @type {Number}
         */
        this._phiDelta = 0;
        /**
         * @private
         * @type {Number}
         */
        this._thetaDelta = 0;
        /**
         * @private
         * @type {Number}
         */
        this._scale = 1;
        /**
         * @private
         * @type {THREE.Vector3}
         */
        this._pan = new THREE.Vector3();
        /**
         * @private
         * @type {THREE.Vector3}
         */
        this._lastPosition = new THREE.Vector3();
        /**
         * @private
         * @type {Number}
         */
        this._state = STATE.NONE;

        // events
        /**
         * @private
         * @type {Object}
         */
        this._changeEvent = {
            type: 'change'
        };
        /**
         * @private
         * @type {Object}
         */
        this._startEvent = {
            type: 'start'
        };
        /**
         * @private
         * @type {Object}
         */
        this._endEvent = {
            type: 'end'
        };

        this.domElement.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        }, false);
        this.domElement.addEventListener('mousedown', this.__onMouseDown.bind(this), false);
        this.domElement.addEventListener('mousewheel', this.__onMouseWheel.bind(this), false);
        this.domElement.addEventListener('DOMMouseScroll', this.__onMouseWheel.bind(this), false); // firefox

        this.domElement.addEventListener('touchstart', this.__touchstart.bind(this), false);
        this.domElement.addEventListener('touchend', this.__touchend.bind(this), false);
        this.domElement.addEventListener('touchmove', this.__touchmove.bind(this), false);

        window.addEventListener('keydown', this.__onKeyDown.bind(this), false);
    }

    /**
     * @public
     * @param {Number} angle - angle of rotation in radian
     */
    rotateLeft(angle) {
        if (angle === undefined) {
            angle = this.__getAutoRotationAngle();
        }
        this._thetaDelta -= angle;
    };

    /**
     * @public
     * @param {Number} angle - angle of rotation in radian
     */
    rotateUp(angle) {
        if (angle === undefined) {
            angle = this.__getAutoRotationAngle();
        }
        this._phiDelta -= angle;
    };

    /**
     * Pass in distance in world space to move left
     * @public
     * @param {Number} distance - distance in world space to move left
     */
    panLeft(distance) {
        let te = this.object.matrix.elements;
        // get X column of matrix
        this._panOffset.set(te[0], te[1], te[2]);
        this._panOffset.multiplyScalar(-distance);
        this._pan.add(this._panOffset);

    };

    /**
     * Pass in distance in world space to move up
     * @public
     * @param {Number} distance - distance in world space to move up
     */
    panUp(distance) {
        let te = this.object.matrix.elements;
        // get Y column of matrix
        this._panOffset.set(te[4], te[5], te[6]);
        this._panOffset.multiplyScalar(distance);
        this._pan.add(this._panOffset);
    };

    /**
     * Pass in x,y of change desired in pixel space,
     * right and down are positive
     * @public
     * @param {Number} deltaX - distance in world space to move up
     * @param {Number} deltaY - distance in world space to move up
     */
    pan(deltaX, deltaY) {
        let element = this.domElement === document ? this.domElement.body : this.domElement;
        if (this.object.fov !== undefined) {
            // perspective
            let position = this.object.position;
            let offset = position.clone().sub(this.target);
            let targetDistance = offset.length();
            // half of the fov is center to top of screen
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            this.panLeft(2 * deltaX * targetDistance / element.clientHeight);
            this.panUp(2 * deltaY * targetDistance / element.clientHeight);
        } else if (this.object.top !== undefined) {
            // orthographic
            this.panLeft(deltaX * (this.object.right - this.object.left) / element.clientWidth);
            this.panUp(deltaY * (this.object.top - this.object.bottom) / element.clientHeight);
        } else {
            // camera neither orthographic or perspective
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
        }
    };

    /**
     * @public
     * @param {Number} dollyScale - zoom scale
     */
    dollyIn(dollyScale) {
        if (dollyScale === undefined) {
            dollyScale = this.__getZoomScale();
        }
        this._scale /= dollyScale;
    };

    /**
     * @public
     * @param {Number} dollyScale - zoom scale
     */
    dollyOut(dollyScale) {
        if (dollyScale === undefined) {
            dollyScale = this.__getZoomScale();
        }
        this._scale *= dollyScale;
    };

    /**
     * @public
     */
    update() {

        if (this.object.top !== undefined) {
            this.object.top = (this._scale * this.object.top);
            this.object.bottom = (this._scale * this.object.bottom);
            this.object.left = (this._scale * this.object.left);
            this.object.right = (this._scale * this.object.right);
            this.object.updateProjectionMatrix();
        }
        let position = this.object.position;
        this._offset.copy(position).sub(this.target);
        this.target.add(this._pan);

        //ToDo: May be Unused code
        position.copy(this.target).add(this._offset);

        this.object.lookAt(this.target);
        this.dispatchEvent(this._changeEvent);
        this._scale = 1;
        this._pan.set(0, 0, 0);
    };

    /**
     * @public
     */
    reset() {
        this._state = STATE.NONE;
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.update();
    };

    /**
     * @private
     * @return {Number}
     */
    __getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }
    /**
     * @private
     * @return {Number}
     */
    __getZoomScale() {
        return Math.pow(0.95, this.config.zoomSpeed);
    }

    /**
     * @private
     */
    __onMouseDown(event) {

        if (this.config.enabled === false)
            return;

        event.preventDefault();

        if (event.button === 0) {
            if (this.config.noRotate === true)
                return;

            this._state = STATE.ROTATE;
            this._rotateStart.set(event.clientX, event.clientY);

        } else if (event.button === 1) {
            if (this.config.noZoom === true)
                return;

            this._state = STATE.DOLLY;
            this._dollyStart.set(event.clientX, event.clientY);

        } else if (event.button === 2) {
            if (this.config.noPan === true)
                return;

            this._state = STATE.PAN;
            this._panStart.set(event.clientX, event.clientY);

        }

        this.domElement.addEventListener('mousemove', this.__onMouseMove.bind(this), false);
        this.domElement.addEventListener('mouseup', this.__onMouseUp.bind(this), false);
        this.dispatchEvent(this._startEvent);

    }

    /**
     * @private
     */
    __onMouseMove(event) {

        if (this.config.enabled === false)
            return;

        event.preventDefault();

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        if (this._state === STATE.ROTATE) {

            if (this.config.noRotate === true) return;

            this._rotateEnd.set(event.clientX, event.clientY);
            this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart);

            // rotating across whole screen goes 360 degrees around
            this.rotateLeft(2 * Math.PI * this._rotateDelta.x / element.clientWidth * this.config.rotateSpeed);

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            this.rotateUp(2 * Math.PI * this._rotateDelta.y / element.clientHeight * this.config.rotateSpeed);

            this._rotateStart.copy(this._rotateEnd);

        } else if (this._state === STATE.DOLLY) {

            if (this.config.noZoom === true)
                return;

            this._dollyEnd.set(event.clientX, event.clientY);
            this._dollyDelta.subVectors(dollyEnd, dollyStart);

            if (this._dollyDelta.y > 0) {
                this.dollyIn();
            } else {
                this.dollyOut();
            }

            this._dollyStart.copy(this._dollyEnd);

        } else if (this._state === STATE.PAN) {

            if (this.config.noPan === true) return;

            this._panEnd.set(event.clientX, event.clientY);
            this._panDelta.subVectors(this._panEnd, this._panStart);

            this.pan(this._panDelta.x, this._panDelta.y);

            this._panStart.copy(this._panEnd);

        }

        this.update();

    }
    /**
     * @private
     */
    __onMouseUp(event) {

        if (this.config.enabled === false)
            return;

        this.domElement.removeEventListener('mousemove', this.__onMouseMove.bind(this), false);
        this.domElement.removeEventListener('mouseup', this.__onMouseUp.bind(this), false);
        this.dispatchEvent(this._endEvent);
        this._state = STATE.NONE;

    }
    /**
     * @private
     */
    __onMouseWheel(event) {

        if (this.config.enabled === false || this.config.noZoom === true)
            return;

        event.preventDefault();

        var delta = 0;

        if (event.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if (event.detail !== undefined) { // Firefox

            delta = -event.detail;

        }

        if (delta > 0) {

            this.dollyOut();

        } else {

            this.dollyIn();

        }

        this.update();
        this.dispatchEvent(this._startEvent);
        this.dispatchEvent(this._endEvent);

    }
    /**
     * @private
     */
    __onKeyDown(event) {

        if (this.config.enabled === false || this.config.noKeys === true || this.config.noPan === true)
            return;

        switch (event.keyCode) {

            case this.config.keys.UP:
                this.pan(0, this.config.keyPanSpeed);
                this.update();
                break;

            case this.config.keys.BOTTOM:
                this.pan(0, -this.config.keyPanSpeed);
                this.update();
                break;

            case this.config.keys.LEFT:
                this.pan(this.config.keyPanSpeed, 0);
                this.update();
                break;

            case this.config.keys.RIGHT:
                this.pan(-this.config.keyPanSpeed, 0);
                this.update();
                break;

        }

    }
    /**
     * @private
     */
    __touchstart(event) {

        if (this.config.enabled === false) return;

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (this.config.noRotate === true) return;

                this._state = STATE.TOUCH_ROTATE;

                this._rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;

            case 2: // two-fingered touch: dolly

                if (this.config.noZoom === true) return;

                this._state = STATE.TOUCH_DOLLY;

                let dx = event.touches[0].pageX - event.touches[1].pageX;
                let dy = event.touches[0].pageY - event.touches[1].pageY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                this._dollyStart.set(0, distance);
                break;

            case 3: // three-fingered touch: pan

                if (this.config.noPan === true) return;

                this._state = STATE.TOUCH_PAN;

                this._panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;

            default:

                this._state = STATE.NONE;

        }

        this.dispatchEvent(startEvent);

    }
    /**
     * @private
     */
    __touchmove(event) {

        if (this.config.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (this.config.noRotate === true) return;
                if (this._state !== STATE.TOUCH_ROTATE) return;

                this._rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart);

                // rotating across whole screen goes 360 degrees around
                this.rotateLeft(2 * Math.PI * this._rotateDelta.x / element.clientWidth * this.config.rotateSpeed);
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                this.rotateUp(2 * Math.PI * this._rotateDelta.y / element.clientHeight * this.config.rotateSpeed);

                this._rotateStart.copy(this._rotateEnd);

                this.update();
                break;

            case 2: // two-fingered touch: dolly

                if (this.config.noZoom === true) return;
                if (this._state !== STATE.TOUCH_DOLLY) return;

                let dx = event.touches[0].pageX - event.touches[1].pageX;
                let dy = event.touches[0].pageY - event.touches[1].pageY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                this._dollyEnd.set(0, distance);
                this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);

                if (this._dollyDelta.y > 0) {

                    this.dollyOut();

                } else {

                    this.dollyIn();

                }

                this._dollyStart.copy(dollyEnd);

                this.update();
                break;

            case 3: // three-fingered touch: pan

                if (this.config.noPan === true) return;
                if (this._state !== STATE.TOUCH_PAN) return;

                this._panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                this._panDelta.subVectors(this._panEnd, this._panStart);

                this.pan(this._panDelta.x, this._panDelta.y);

                this._panStart.copy(this._panEnd);

                this.update();
                break;

            default:

                this._state = STATE.NONE;

        }

    }
    /**
     * @private
     */
    __touchend( /* event */) {

        if (this.config.enabled === false) return;

        this.dispatchEvent(this._endEvent);
        this._state = STATE.NONE;

    }
}

let STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5
};