import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Solid extends EntityParser {
    constructor() {
        super();
        if (!Solid.instance) {
            Solid.instance = this;
        }
        return Solid.instance;
    }

    /**
     * Parse the input object
     * @public 
     * @param {DXFScanner} scanner - object to be parsed
     * @return {Object} parsed object
     */
    parse(scanner) {
        let entity = super.parse(scanner);
        entity.points = [];
        while (!scanner.isEOF()) {
            let group = scanner.next().peek();
            if (group.code === 0) { scanner.rewind(); break; }
            switch (group.code) {
                case 10:
                    entity.points[0] = this.__parsePoint(scanner);
                    break;
                case 11:
                    entity.points[1] = this.__parsePoint(scanner);
                    break;
                case 12:
                    entity.points[2] = this.__parsePoint(scanner);
                    break;
                case 13:
                    entity.points[3] = this.__parsePoint(scanner);
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

const instance = new Solid();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;