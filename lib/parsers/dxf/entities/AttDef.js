import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class AttDef extends EntityParser {
    constructor() {
        super();
        if (!AttDef.instance) {
            AttDef.instance = this;
        }
        return AttDef.instance;
    }

    /**
     * Parse the input object
     * @public 
     * @param {DXFScanner} scanner - object to be parsed
     * @return {Object} parsed object
     */
    parse(scanner) {
        let entity = super.parse(scanner);
        entity.scale = 1;
        entity.textStyle = 'STANDARD';

        while (!scanner.isEOF()) {
            let group = scanner.next().peek();
            if (group.code === 0) break;
            switch (group.code) {
                case 1:
                    entity.text = group.value;
                    break;
                case 2:
                    entity.tag = group.value;
                    break;
                case 3:
                    entity.prompt = group.value;
                    break;
                case 7:
                    entity.textStyle = group.value;
                    break;
                case 10: // X coordinate of 'first alignment point'
                    entity.startPoint = this.__parsePoint(scanner);
                    break;
                case 11: // X coordinate of 'second alignment point'
                    entity.endPoint = this.__parsePoint(scanner);
                    break;
                case 39:
                    entity.thickness = group.value;
                    break;
                case 40:
                    entity.textHeight = group.value;
                    break;
                case 41:
                    entity.scale = group.value;
                    break;
                case 50:
                    entity.rotation = group.value;
                    break;
                case 51:
                    entity.obliqueAngle = group.value;
                    break;
                case 70:
                    entity.invisible = !!(group.value & 0x01);
                    entity.constant = !!(group.value & 0x02);
                    entity.verificationRequired = !!(group.value & 0x04);
                    entity.preset = !!(group.value & 0x08);
                    break;
                case 71:
                    entity.backwards = !!(group.value & 0x02);
                    entity.mirrored = !!(group.value & 0x04);
                    break;
                case 72:
                    // TODO: enum values?
                    entity.horizontalJustification = group.value;
                    break;
                case 73:
                    entity.fieldLength = group.value;
                    break;
                case 74:
                    // TODO: enum values?
                    entity.verticalJustification = group.value;
                    break;
                case 100:
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
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new AttDef();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;