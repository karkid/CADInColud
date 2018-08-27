import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Point extends EntityParser {
    constructor() {
        super();
        if (!Point.instance) {
            Point.instance = this;
        }
        return Point.instance;
    }

    /**
     * Parse the input object
     * @public 
     * @param {DXFScanner} scanner - object to be parsed
     * @return {Object} parsed object
     */
    parse(scanner) {
        let entity = super.parse(scanner);
        while (!scanner.isEOF()) {
            let group = scanner.next().peek();
            if (group.code === 0) { scanner.rewind(); break; }
            switch (group.code) {
                case 10:
                    entity.position = this.__parsePoint(scanner);
                    break;
                case 39:
                    entity.thickness = group.value;
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

const instance = new Point();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;