import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Text extends EntityParser {
    constructor() {
        super();
        if (!Text.instance) {
            Text.instance = this;
        }
        return Text.instance;
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
                case 10: // X coordinate of 'first alignment point'
                    entity.startPoint = this.__parsePoint(scanner);
                    break;
                case 11: // X coordinate of 'second alignment point'
                    entity.endPoint = this.__parsePoint(scanner);
                    break;
                case 40: // Text height
                    entity.textHeight = group.value;
                    break;
                case 41:
                    entity.xScale = group.value;
                    break;
                case 50: // Rotation in degrees
                    entity.rotation = group.value;
                    break;
                case 1: // Text
                    entity.text = group.value;
                    break;
                // NOTE: 72 and 73 are meaningless without 11 (second alignment point)
                case 72: // Horizontal alignment
                    entity.halign = group.value;
                    break;
                case 73: // Vertical alignment
                    entity.valign = group.value;
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Text();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;