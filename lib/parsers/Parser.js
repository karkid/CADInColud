import assert from 'assert';

/**
 * Parse the input data
 * @interface
 * 
 */
export default class Parser {
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
    };

    /**
     * Parse the input object
     * @abstract
     * @public 
     * @param {Object} obj - object to be parsed
     * @return {Object} parsed object
     */
    parse(obj) {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

}