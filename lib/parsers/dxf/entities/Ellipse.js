import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Ellipse extends EntityParser {
    constructor() {
        super();
        if (!Ellipse.instance) {
            Ellipse.instance = this;
        }
        return Ellipse.instance;
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
                    entity.center = this.__parsePoint(scanner);
                    break;
                case 11:
                    entity.majorAxisEndPoint = this.__parsePoint(scanner);
                    break;
                case 40:
                    entity.axisRatio = group.value;
                    break;
                case 41:
                    entity.startAngle = group.value;
                    break;
                case 42:
                    entity.endAngle = group.value;
                    break;
                case 2:
                    entity.name = group.value;
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Ellipse();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;