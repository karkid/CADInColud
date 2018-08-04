import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Spline extends EntityParser {
    constructor() {
        super();
        if (!Spline.instance) {
            Spline.instance = this;
        }
        return Spline.instance;
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
                case 10:
                    if (!entity.controlPoints) entity.controlPoints = [];
                    entity.controlPoints.push(this.__parsePoint(scanner));
                    break;
                case 11:
                    if (!entity.fitPoints) entity.fitPoints = [];
                    entity.fitPoints.push(this.__parsePoint(scanner));
                    break;
                case 12:
                    entity.startTangent = this.__parsePoint(scanner);
                    break;
                case 13:
                    entity.endTangent = this.__parsePoint(scanner);
                    break;
                case 40:
                    if (!entity.knotValues) entity.knotValues = [];
                    entity.knotValues.push(group.value);
                    break;
                case 70:
                    if ((group.value & 1) != 0) entity.closed = true;
                    if ((group.value & 2) != 0) entity.periodic = true;
                    if ((group.value & 4) != 0) entity.rational = true;
                    if ((group.value & 8) != 0) entity.planar = true;
                    if ((group.value & 16) != 0) {
                        entity.planar = true;
                        entity.linear = true;
                    }
                    break;

                case 71:
                    entity.degreeOfSplineCurve = group.value;
                    break;
                case 72:
                    entity.numberOfKnots = group.value;
                    break;
                case 73:
                    entity.numberOfControlPoints = group.value;
                    break;
                case 74:
                    entity.numberOfFitPoints = group.value;
                    break;
                case 210:
                    entity.normalVector = this.__parsePoint(scanner);
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Spline();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;