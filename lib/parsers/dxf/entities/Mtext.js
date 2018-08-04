import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Mtext extends EntityParser {
    constructor() {
        super();
        if (!Mtext.instance) {
            Mtext.instance = this;
        }
        return Mtext.instance;
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
                case 1:
                    entity.text = group.value;
                    break;
                case 3:
                    entity.text += group.value;
                    break;
                case 10:
                    entity.position = this.__parsePoint(scanner);
                    break;
                case 40:
                    //Note: this is the text height
                    entity.height = group.value;
                    break;
                case 41:
                    entity.width = group.value;
                    break;
                case 50:
                    entity.rotation = group.value;
                    break;
                case 71:
                    entity.attachmentPoint = group.value;
                    break;
                case 72:
                    entity.drawingDirection = group.value;
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Mtext();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;