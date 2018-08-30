import assert from 'assert';

/**
 * Scan the input data
 * @interface
 * 
 */
export default class Scanner {

    /**
     * @constructor
     * @param {Object} data - Object
     */
    constructor(data) {
        /**
         * @private
         * @type {Number} 
         */
        this._pointer = 0;
        /**
         * @private 
         * @type {Array} 
         */
        this._data = data;
        /**
         * @private 
         * @type {Boolean} 
         */
        this._eof = false
    }

    /**
     * Increment the file pointer
     * @public
     * @abstract
     */
    next() {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

    /**
     * Read the current position data
     * @public
     * @abstract
     */
    peek() {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

    /**
     * Set the position to the begining point
     * @public
     * @abstract
     * @param {Number} step - number of step
     */
    rewind(step) {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

    /**
     * Return true if only if there is data to read
     * @public
     * @abstract
     * @returns {boolean} true/false
     */
    hasNext() {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

    /**
     * Return true if only if there is End of file
     * @public
     * @abstract
     * @returns {boolean} true/false
     */
    isEOF() {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

    /**
     * Gives current position in the file
     * @public
     * @abstract
     * @returns {Number} position
     */
    ftell() {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

    /**
     * Set Object which need to scan
     * @public
     * @param {Object} data - object which need to scan
     */
    setData(data) {
        this._data = data;
    }
}