import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class LWPolyline extends EntityParser {
    constructor() {
        super();
        if (!LWPolyline.instance) {
            LWPolyline.instance = this;
        }
        return LWPolyline.instance;
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
        entity.numberOfVertices = 0;
        while (!scanner.isEOF()) {
            let group = scanner.next().peek();
            if (group.code === 0) break;
            switch (group.code) {
                case 38:
                    entity.elevation = group.value;
                    break;
                case 39:
                    entity.depth = group.value;
                    break;
                case 70: // 1 = Closed shape, 128 = plinegen?, 0 = default
                    entity.shape = (group.value & 1) === 1;
                    entity.hasContinuousLinetypePattern = (group.value & 128) === 128;
                    break;
                case 90:
                    entity.numberOfVertices = group.value;
                    break;
                case 10: // X coordinate of point
                    scanner.rewind();
                    entity.vertices = this.__parseLWPolylineVertices(scanner, entity.numberOfVertices);
                    break;
                case 43:
                    if (group.value !== 0) entity.width = group.value;
                    break;
                case 210:
                    entity.extrusionDirectionX = group.value;
                    break;
                case 220:
                    entity.extrusionDirectionY = group.value;
                    break;
                case 230:
                    entity.extrusionDirectionZ = group.value;
                    break;
                default:
                    // ignored attribute
                    console.log("Unhandel group %j", group);
                    break;
            }
        }
        return entity;
    }

    __parseLWPolylineVertices(scanner, n) {
        if (!n || n <= 0) {
            throw Error("n must be greater than 0 verticies");
        }
        let vertices = [];
        let vertexIsStarted = false;
        let vertexIsFinished = false;

        for (let i = 0; i < n; i++) {
            let vertex = {};
            while (!scanner.isEOF()) {
                if (vertexIsFinished) {
                    scanner.rewind();
                    break;
                }
                let group = scanner.next().peek();
                if (group.code === 0) {
                    scanner.rewind();
                    break;
                }

                switch (group.code) {
                    case 10: // X
                        if (vertexIsStarted) {
                            scanner.rewind();
                            vertexIsFinished = true;
                            continue;
                        }
                        vertex.x = group.value;
                        vertexIsStarted = true;
                        break;
                    case 20: // Y
                        vertex.y = group.value;
                        break;
                    case 30: // Z
                        vertex.z = group.value;
                        break;
                    case 40: // start width
                        vertex.startWidth = group.value;
                        break;
                    case 41: // end width
                        vertex.endWidth = group.value;
                        break;
                    case 42: // bulge
                        if (group.value != 0) vertex.bulge = group.value;
                        break;
                    default:
                        scanner.rewind();
                        // if we do not hit known code return vertices.  Code might belong to entity
                        if (vertexIsStarted) {
                            vertices.push(vertex);
                        }
                        return vertices;
                }
            }
            // See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E
            vertices.push(vertex);
            vertexIsStarted = false;
            vertexIsFinished = false;
        }
        return vertices;
    }
}

const instance = new LWPolyline();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;