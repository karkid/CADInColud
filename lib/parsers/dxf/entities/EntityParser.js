import DXFScanner from "../../../scanners/DXFScanner";

/**
 * @interface
 * @public
 */
export default class EntityParser {
    /**
     * @constructor
     */
    constructor() {}

    /**
     * Attempts to parse codes common to all entities.
     * @public 
     * @param {DXFScanner} scanner - object to be parsed
     * @return {Object} parsed object
     */
    parse(scanner) {
        let entity = {};
        //Default
        entity.lineType = "BYLAYER";
        entity.colorIndex = "BYLAYER";
        entity.lineTypeScale = 1.0;
        entity.visible = true;
        entity.inPaperSpace = false;
        while (!scanner.isEOF()) {
            let group = scanner.next().peek();
            if (group.code === 100) break;
            switch (group.code) {
                case 0:
                    entity.type = group.value;
                    break;
                case 5:
                    entity.handle = group.value;
                    break;
                case 6:
                    entity.lineType = group.value;
                    break;
                case 8:
                    entity.layer = group.value;
                    break;
                case 48:
                    entity.lineTypeScale = group.value;
                    break;
                case 60:
                    entity.visible = group.value === 0;
                    break;
                case 62: // Acad Index Color. 0 inherits ByBlock. 256 inherits ByLayer. Default is bylayer
                    entity.colorIndex = group.value;
                    //entity.color = getAcadColor(Math.abs(group.value));
                    break;
                case 67:
                    entity.inPaperSpace = group.value !== 0;
                    break;
                case 102:
                    entity[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return entity;
    };

    /**
     * Indicates the start of an extension dictionary group. This g roup exists
     * only if persistent reactors have been attached to this object (optional)
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} appGroup object
     */
    __parseAppGroup(scanner) {
        let appGroup = {};
        while (!scanner.isEndOfAppGroup()) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 360:
                    appGroup.softOwnerHandel = group.value;
                    break;
                case 330:
                    appGroup.hardOwnerHandel = group.value;
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return appGroup;
    }

    /**
     * Parses a 2D or 3D point, returning it as an object with x, y, and
     * (sometimes) z property if it is 3D. It is assumed the current group
     * is x of the point being read in, and scanner.next() will return the
     * y. The parser will determine if there is a z point automatically.
     * @param {DXFScanner} scanner - scanner object
     * @return {Object} The 2D or 3D point as an object with x, y[, z]
     */
    __parsePoint(scanner) {
        let point = {},
            group = scanner.peek(),
            code = group.code; // group code for X-Coordinate

        point.x = group.value;
        code += 10; // group code for Y-Coordinate is at 10 code offset from X-Coordinate
        group = scanner.next().peek();
        if (group.code != code) {
            scanner.rewind();
            return point;
        }

        point.y = group.value;
        code += 10; // group code for Z-Coordinate is at 10 code offset from Y-Coordinate
        group = scanner.next().peek();
        if (group.code != code) {
            scanner.rewind();
            return point;
        }

        point.z = group.value;

        return point;
    };
}