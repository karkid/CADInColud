import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Dimension extends EntityParser {
    constructor() {
        super();
        if (!Dimension.instance) {
            Dimension.instance = this;
        }
        return Dimension.instance;
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
                case 2: // Referenced block name
                    entity.block = group.value;
                    break;
                case 10: // X coordinate of 'first alignment point'
                    entity.anchorPoint = this.__parsePoint(scanner);
                    break;
                case 11:
                    entity.middleOfText = this.__parsePoint(scanner);
                    break;
                case 71: // 5 = Middle center
                    entity.attachmentPoint = group.value;
                    break;
                case 42: // Actual measurement
                    entity.actualMeasurement = group.value;
                    break;
                case 1: // Text entered by user explicitly
                    entity.text = group.value;
                    break;
                case 50: // Angle of rotated, horizontal, or vertical dimensions
                    entity.angle = group.value;
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Dimension();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;