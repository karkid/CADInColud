import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Vertex extends EntityParser {
    constructor() {
        super();
        if (!Vertex.instance) {
            Vertex.instance = this;
        }
        return Vertex.instance;
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
                case 10: // X
                    entity.x = group.value;
                    break;
                case 20: // Y
                    entity.y = group.value;
                    break;
                case 30: // Z
                    entity.z = group.value;
                    break;
                case 40: // start width
                case 41: // end width
                case 42: // bulge
                    if (group.value != 0) entity.bulge = group.value;
                    break;
                case 70: // flags
                    entity.curveFittingVertex = (group.value & 1) !== 0;
                    entity.curveFitTangent = (group.value & 2) !== 0;
                    entity.splineVertex = (group.value & 8) !== 0;
                    entity.splineControlPoint = (group.value & 16) !== 0;
                    entity.threeDPolylineVertex = (group.value & 32) !== 0;
                    entity.threeDPolylineMesh = (group.value & 64) !== 0;
                    entity.polyfaceMeshVertex = (group.value & 128) !== 0;
                    break;
                case 50: // curve fit tangent direction
                case 71: // polyface mesh vertex index
                case 72: // polyface mesh vertex index
                case 73: // polyface mesh vertex index
                case 74: // polyface mesh vertex index
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Vertex();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;