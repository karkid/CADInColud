import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Circle extends EntityParser {
    constructor() {
        super();
        if (!Circle.instance) {
            Circle.instance = this;
        }
        return Circle.instance;
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
                    endAngle = Math.PI / 180 * group.value;
                    if (endAngle < entity.startAngle)
                        entity.angleLength = endAngle + 2 * Math.PI - entity.startAngle;
                    else
                        entity.angleLength = endAngle - entity.startAngle;
                    entity.endAngle = endAngle;
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Circle();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;