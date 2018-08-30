import assert from 'assert';

/**
 * Parse the input data
 * @interface
 * 
 */
export default class Viewer {
    /**
     * @constructor
     */
    constructor() { }

    /**
     * @public
     * @param {String} source 
     */
    parseSync(source) {
        if (typeof (source) === 'string') {
            return this.parse(source);
        } else {
            console.error('Cannot read dxf source of type `' + typeof (source));
            return null;
        }
    }

    /**
     * Render the scene
     * @abstract
     * @public 
     */
    render() {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

}