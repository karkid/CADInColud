import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Line extends EntityParser {
    constructor() {
        super();
        if (!Line.instance) {
            Line.instance = this;
        }
        return Line.instance;
    }

    /**
     * Parse the input object
     * @public 
     * @param {DXFScanner} scanner - object to be parsed
     * @return {Object} parsed object
     */
    parse(scanner) {
        let entity = super.parse(scanner);
        entity.vertices = [];
        while (!scanner.isEOF()) {
            let group = scanner.next().peek();
            if (group.code === 0) { scanner.rewind(); break; }
            switch (group.code) {
                case 10: // X coordinate of point
                    entity.vertices.unshift(this.__parsePoint(scanner));
                    break;
                case 11:
                    entity.vertices.push(this.__parsePoint(scanner));
                    break;
                case 210:
                    entity.extrusionDirection = this.__parsePoint(scanner);
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Line();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;