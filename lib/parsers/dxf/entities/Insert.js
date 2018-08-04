import EntityParser from "./EntityParser";
import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @public
 * @extends {EntityParser}
 */
class Insert extends EntityParser {
    constructor() {
        super();
        if (!Insert.instance) {
            Insert.instance = this;
        }
        return Insert.instance;
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
                case 2:
                    entity.name = group.value;
                    break;
                case 41:
                    entity.xScale = group.value;
                    break;
                case 42:
                    entity.yScale = group.value;
                    break;
                case 43:
                    entity.zScale = group.value;
                    break;
                case 10:
                    entity.position = this.__parsePoint(scanner);
                    break;
                case 50:
                    entity.rotation = group.value;
                    break;
                case 70:
                    entity.columnCount = group.value;
                    break;
                case 71:
                    entity.rowCount = group.value;
                    break;
                case 44:
                    entity.columnSpacing = group.value;
                    break;
                case 45:
                    entity.rowSpacing = group.value;
                    break;
                case 210:
                    entity.extrusionDirection = this.__parsePoint(scanner);
                    break;
                default: // ignored attribute
                    console.log('Unhandel group %j', group);
                    break;
            }
        }
        return entity;
    }
}

const instance = new Insert();

// prevents new properties from being added to the object
Object.freeze(instance);

export default instance;