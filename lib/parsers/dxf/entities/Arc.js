import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Arc extends EntityParser {
    constructor() {
        super();
        if (!Arc.instance) {
            Arc.instance = this;
        }
        return Arc.instance;
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
            if (group.code === 0) break;
            switch (group.code) {
                case 10: // X coordinate of point
                    entity.center = this.__parsePoint(scanner);
                    break;
                case 40: // radius
                    entity.radius = group.value;
                    break;
                case 50: // start angle
                    entity.startAngle = Math.PI / 180 * group.value;
                    break;
                case 51: // end angle
                    entity.endAngle = Math.PI / 180 * group.value;
                    entity.angleLength = group.endAngle - group.startAngle; // angleLength is deprecated
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Arc();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;