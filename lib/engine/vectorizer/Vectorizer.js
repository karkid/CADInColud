import assert from 'assert';

/**
 * Represent Vectorizer
 * @interface Vectorizer
 */
export default class Vectorizer {
    /**
     * Creates an instance of DXFVectorizer.
     * @memberof Vectorizer
     */
    constructor() { }

    /**
     * Vectorize to draw
     * @param {Object} entity - entity object
     * @param {Object} dxfDb - database object
     * @return {THREE.Mesh}
     * @memberof DXFVectorizer
     */
    drawEntity(entity, db) {
        assert(false, 'Object is trying to call abstract method. Implement it in base class');
    }

}