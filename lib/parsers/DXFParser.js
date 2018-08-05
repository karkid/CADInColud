import DXFScanner from "../scanners/DXFScanner";
import Parser from "./Parser";
import AUTO_CAD_COLOR_INDEX from './dxf/AutoCadColorIndex';
import LINE from "./dxf/entities/Line";
import ARC from "./dxf/entities/Arc";
import CIRCLE from "./dxf/entities/Circle";
import MTEXT from "./dxf/entities/Mtext";
import POINT from "./dxf/entities/Point";
import VERTEX from "./dxf/entities/Vertex";
import TEXT from "./dxf/entities/Text";
import SPLINE from "./dxf/entities/Spline";
import ELLIPSE from "./dxf/entities/Ellipse";
import INSERT from "./dxf/entities/Insert";
import SOLID from "./dxf/entities/Solid";
import ATTDEF from "./dxf/entities/AttDef";
import DIMENSION from "./dxf/entities/Dimension";

/**
 * @public
 * @extends {Parser}
 * @example 
 * let dxfParser = new DXFParser()
 */
export default class DXFParser extends Parser {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Parse the DXF data
     * @override
     * @public
     * @param {String} dxfString - DXF data
     */
    parse(dxfString) {
        let scanner = new DXFScanner(dxfString.split(/\r\n|\r|\n/g));
        if (!scanner.hasNext()) throw Error("Empty File");
        return this.__pasrseSections(scanner);
    }

    /**
     * General information about the drawing is found in various section. 
     * 1. HEADER
     * 2. CLASS
     * 3. TABLES
     * 4. BLOCKS
     * 5. ENTITIES
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} dxfString
     */
    __pasrseSections(scanner) {
        let dxf = {};
        while (!scanner.isEOF()) {
            if (scanner.isStartOfSection()) {
                let group = scanner.next().peek();
                // Be sure we are reading a section code
                if (group.code !== 2) {
                    console.error('Unexpected code %s after 0:SECTION %j', group);
                    continue;
                }

                if (group.value === 'HEADER') {
                    console.log('> HEADER');
                    dxf.header = this.__parseHeaderSection(scanner);
                    console.log('<');
                } else if (group.value === 'BLOCKS') {
                    console.log('> BLOCKS');
                    dxf.blocks = this.__parseBlockSection(scanner);
                    console.log('<');
                } else if (group.value === 'ENTITIES') {
                    console.log('> ENTITIES');
                    dxf.entities = this.__parseEntitiesSection(scanner);
                    console.log('<');
                } else if (group.value === 'TABLES') {
                    console.log('> TABLES');
                    dxf.tables = this.__parseTablesSection(scanner);
                    console.log('<');
                } else if (group.value === 'EOF') {
                    console.log('EOF');
                } else {
                    console.warn('Skipping section \'%s\'', group.value);
                }
            } else {
                scanner.next();
            }
        }
        return dxf;
    }

    /**
     * General information about the drawing is found in this section. 
     * It consists of an DXF database version number and a number of system variables. 
     * Each parameter contains a variable name and its associated value.
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} header section
     */
    __parseHeaderSection(scanner) {
        let header = {}
        console.log(this);
        while (!scanner.isEndOfSection()) {
            let group = scanner.next().peek();
            if (group.code === 9) {
                let variableName = group.value;
                group = scanner.next().peek();
                if (group.code === 10) {
                    header[variableName] = this.__parsePoint(scanner);
                } else {
                    header[variableName] = group.value;
                }
            }
        }
        return header;
    }

    /**
     * This section contains definitions for the following symbol tables.
     * 1. APPID (application identification table)
     * 2. BLOCK_RECORD (block reference table)
     * 3. DIMSTYLE (dimension style table)
     * 4. LAYER (layer table)
     * 5. LTYPE (linetype table)
     * 6. STYLE (text style table)
     * 7. UCS (User Coordinate System table)
     * 8. VIEW (view table)
     * 9. VPORT (tableRecord configuration table)
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} table section
     */
    __parseTablesSection(scanner) {
        let tables = {};
        while (!scanner.isEndOfSection()) {
            let group = scanner.next().peek();
            if (scanner.isStartOfTable()) {
                group = scanner.next().peek();
                tables[group.value] = this.__parseTable(scanner);
            }
        }
        return tables;
    }

    /**
     * @private
     * @param {DXFScanner} scanner 
     */
    __parseTable(scanner) {
        let table = {};
        while (!scanner.isEndOfTable()) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 5:
                    table.handel = group.value;
                    break;
                case 70:
                    table.maxEntries = group.value;
                    break;
                case 330:
                    table.softOwnerHandel = group.value;
                    break;
                case 102:
                    table[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 0:
                    table[group.value] = this.__parseTableRecords(scanner);
                    break;
                case 100:
                default:
                    console.log("Unhandel group %j", group);
            }
        }
        return table;
    }

    /**
     * Table entries
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} appGroup object
     */
    __parseTableRecords(scanner) {
        let group = scanner.peek();
        switch (group.value) {
            case 'LTYPE':
                return this.__parseLineTypeRecords(scanner);
            case 'VPORT':
                return this.__parseViewPortRecords(scanner);
            case 'LAYER':
                return this.__parseLayerRecords(scanner);
            case 'DIMSTYLE':
                return this.__parseDimStyleRecords(scanner);
            case 'BLOCK_RECORD ':
            case 'STYLE':
            case 'UCS':
            case 'VIEW':
            case 'APPID':
            default:
                console.log('Unhandel group %j', group);
        }
    }

    /**
     * Parese line type records
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} line type records object
     */
    __parseLineTypeRecords(scanner) {
        let length,
            tableRecords = {},
            tableRecord = {};
        while (!scanner.isEndOfTable()) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 5:
                    tableRecord.handel = group.value;
                    break;
                case 102:
                    tableRecord[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 2:
                    tableRecord.name = group.value;
                    break;
                case 3:
                    tableRecord.description = group.value;
                    break;
                case 73: // Number of elements for this line type (dots, dashes, spaces);
                    tableRecord.elements = group.value;
                    if (tableRecord.elements > 0) tableRecord.pattern = [];
                    break;
                case 40: // total pattern length
                    tableRecord.patternLength = group.value;
                    break;
                case 49:
                    tableRecord.pattern.push(group.value);
                    break;
                case 0:
                    if (tableRecord.elements > 0 && tableRecord.elements !== tableRecord.pattern.length)
                        log.warn('lengths do not match on LTYPE pattern');
                    tableRecords[tableRecord.name] = tableRecord;
                    tableRecord = {};
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return tableRecords;
    }

    /**
     * Parse view ports records
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} view ports records object
     */
    __parseViewPortRecords(scanner) {
        var tableRecords = [], // Multiple table entries may have the same name indicating a multiple tableRecord configuration
            tableRecord = {};
        while (!scanner.isEndOfTable()) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 2: // layer name
                    tableRecord.name = group.value;
                    break;
                case 5:
                    tableRecord.handel = group.value;
                    break;
                case 10:
                    tableRecord.lowerLeftCorner = this.__parsePoint(scanner);
                    break;
                case 11:
                    tableRecord.upperRightCorner = this.__parsePoint(scanner);
                    break;
                case 12:
                    tableRecord.center = this.__parsePoint(scanner);
                    break;
                case 13:
                    tableRecord.snapBasePoint = this.__parsePoint(scanner);
                    break;
                case 14:
                    tableRecord.snapSpacing = this.__parsePoint(scanner);
                    break;
                case 15:
                    tableRecord.gridSpacing = this.__parsePoint(scanner);
                    break;
                case 16:
                    tableRecord.viewDirectionFromTarget = this.__parsePoint(scanner);
                    break;
                case 17:
                    tableRecord.viewTarget = this.__parsePoint(scanner);
                    break;
                case 42:
                    tableRecord.lensLength = group.value;
                    break;
                case 43:
                    tableRecord.frontClippingPlane = group.value;
                    break;
                case 44:
                    tableRecord.backClippingPlane = group.value;
                    break;
                case 45:
                    tableRecord.viewHeight = group.value;
                    break;
                case 50:
                    tableRecord.snapRotationAngle = group.value;
                    break;
                case 51:
                    tableRecord.viewTwistAngle = group.value;
                    break;
                case 79:
                    tableRecord.orthographicType = group.value;
                    break;
                case 102:
                    tableRecord[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 110:
                    tableRecord.ucsOrigin = this.__parsePoint(scanner);
                    break;
                case 111:
                    tableRecord.ucsXAxis = this.__parsePoint(scanner);
                    break;
                case 112:
                    tableRecord.ucsYAxis = this.__parsePoint(scanner);
                    break;
                case 110:
                    tableRecord.ucsOrigin = this.__parsePoint(scanner);
                    break;
                case 281:
                    tableRecord.renderMode = group.value;
                    break;
                case 281:
                    // 0 is one distant light, 1 is two distant lights
                    tableRecord.defaultLightingType = group.value;;
                    break;
                case 292:
                    tableRecord.defaultLightingOn = group.value;
                    break;
                case 330:
                    tableRecord.ownerHandle = group.value;
                    break;
                case 63:
                case 421:
                case 431:
                    tableRecord.ambientColor = group.value;
                    break;
                case 0:
                    tableRecords.push(tableRecord);
                    tableRecord = {};
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return tableRecords;
    }

    /**
     * Parse layer records
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} layer records object
     */
    __parseLayerRecords(scanner) {
        var tableRecords = {},
            tableRecord = {};
        while (!scanner.isEndOfTable()) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 2: // layer name
                    tableRecord.name = group.value;
                    break;
                case 5:
                    tableRecord.handel = group.value;
                    break;
                case 6: // Linetype name
                    tableRecord.lineType = group.value;
                    break;
                case 62: // color, visibility
                    tableRecord.visible = group.value >= 0; //Color number (if negative, layer is Off)
                    // TODO 0 and 256 are BYBLOCK and BYLAYER respectively. Need to handle these values for layers?.
                    let trueColor = this.__getAcadColor(Math.abs(group.value));
                    if (trueColor)
                        tableRecord.trueColor = trueColor;
                    break;
                case 70: // frozen layer
                    //1 = Layer is frozen, otherwise layer is thawed 
                    //2 = Layer is frozen by default in new viewports
                    //4 = Layer is locked
                    tableRecord.frozen = ((group.value & 1) != 0 || (group.value & 2) != 0);
                    break;
                case 102:
                    tableRecord[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 0:
                    tableRecords[tableRecord.name] = tableRecord;
                    tableRecord = {};
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return tableRecords;
    }

    /**
     * Parse dim style records
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} dim style records object
     */
    __parseDimStyleRecords(scanner) {
        var tableRecords = {},
            tableRecord = {};
        while (!scanner.isEndOfTable()) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 2: // layer name
                    tableRecord.name = group.value;
                    break;
                case 3:
                    tableRecord.DIMPOST = group.value;
                    break;
                case 4:
                    tableRecord.DIMAPOST = group.value;
                    break;
                case 5:
                    tableRecord.DIMBLK = group.value;
                    break;
                case 6:
                    tableRecord.DIMBLK1 = group.value;
                    break;
                case 7:
                    tableRecord.DIMBLK2 = group.value;
                    break;
                case 40:
                    tableRecord.DIMSCALE = group.value;
                    break;
                case 41:
                    tableRecord.DIMASZ = group.value;
                    break;
                case 42:
                    tableRecord.DIMEXO = group.value;
                    break;
                case 43:
                    tableRecord.DIMDLI = group.value;
                    break;
                case 44:
                    tableRecord.DIMEXE = group.value;
                    break;
                case 45:
                    tableRecord.DIMRND = group.value;
                    break;
                case 46:
                    tableRecord.DIMDLE = group.value;
                    break;
                case 47:
                    tableRecord.DIMTP = group.value;
                    break;
                case 48:
                    tableRecord.DIMTM = group.value;
                    break;
                case 140:
                    tableRecord.DIMTXT = group.value;
                    break;
                case 141:
                    tableRecord.DIMCEN = group.value;
                    break;
                case 142:
                    tableRecord.DIMTSZ = group.value;
                    break;
                case 143:
                    tableRecord.DIMALTF = group.value;
                    break;
                case 144:
                    tableRecord.DIMLFAC = group.value;
                    break;
                case 145:
                    tableRecord.DIMTVP = group.value;
                    break;
                case 146:
                    tableRecord.DIMTFAC = group.value;
                    break;
                case 147:
                    tableRecord.DIMGAP = group.value;
                    break;
                case 71:
                    tableRecord.DIMTOL = group.value;
                    break;
                case 72:
                    tableRecord.DIMLIM = group.value;
                    break;
                case 73:
                    tableRecord.DIMTIH = group.value;
                    break;
                case 74:
                    tableRecord.DIMTOH = group.value;
                    break;
                case 75:
                    tableRecord.DIMSE1 = group.value;
                    break;
                case 76:
                    tableRecord.DIMSE2 = group.value;
                    break;
                case 77:
                    tableRecord.DIMTAD = group.value;
                    break;
                case 78:
                    tableRecord.DIMZIN = group.value;
                    break;
                case 170:
                    tableRecord.DIMALT = group.value;
                    break;
                case 171:
                    tableRecord.DIMALTD = group.value;
                    break;
                case 172:
                    tableRecord.DIMTOFL = group.value;
                    break;
                case 173:
                    tableRecord.DIMSAH = group.value;
                    break;
                case 174:
                    tableRecord.DIMTIX = group.value;
                    break;
                case 175:
                    tableRecord.DIMSOXD = group.value;
                    break;
                case 176:
                    tableRecord.DIMDLRD = group.value;
                    break;
                case 177:
                    tableRecord.DIMCLRE = group.value;
                    break;
                case 178:
                    tableRecord.DIMCLRT = group.value;
                    break;
                case 270:
                    tableRecord.DIMUNIT = group.value;
                    break;
                case 271:
                    tableRecord.DIMDEC = group.value;
                    break;
                case 272:
                    tableRecord.DIMTDEC = group.value;
                    break;
                case 273:
                    tableRecord.DIMALTU = group.value;
                    break;
                case 274:
                    tableRecord.DIMALTTD = group.value;
                    break;
                case 275:
                    tableRecord.DIMAUNIT = group.value;
                    break;
                case 280:
                    tableRecord.DIMJUST = group.value;
                    break;
                case 281:
                    tableRecord.DIMSD1 = group.value;
                    break;
                case 282:
                    tableRecord.DIMSD2 = group.value;
                    break;
                case 283:
                    tableRecord.DIMTOLJ = group.value;
                    break;
                case 284:
                    tableRecord.DIMTZIN = group.value;
                    break;
                case 285:
                    tableRecord.DIMALTZ = group.value;
                    break;
                case 286:
                    tableRecord.DIMALTTZ = group.value;
                    break;
                case 287:
                    tableRecord.DIMFIT = group.value;
                    break;
                case 288:
                    tableRecord.DIMUPT = group.value;
                    break;
                case 340:
                    tableRecord.textStyleHandel = group.value;
                    break;
                case 105:
                    tableRecord.handel = group.value;
                    break;
                case 70:
                    tableRecord.stdFlag = group.value;
                    break;
                case 102:
                    tableRecord[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 0:
                    tableRecords[tableRecord.name] = tableRecord;
                    tableRecord = {};
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return tableRecords;
    }

    /**
     * Contains block definition and drawing entities that make up each block 
     * reference in the drawing.
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} block section
     */
    __parseBlockSection(scanner) {
        return this.__parseBlocks(scanner);;
    }

    /**
     * Contains block definition and drawing entities that make up each block 
     * reference in the drawing.
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} block section
     */
    __parseBlocks(scanner) {
        let blocks = {},
            block = {};
        while (!scanner.isEndOfSection()) {
            scanner.next();
            if (scanner.isStartOfBlock()) {
                block.beginBlock = this.__parseBeginBlock(scanner);
            } else if (scanner.isEndOfBlock()) {
                block.endBlock = this.__parseEndBlock(scanner);
                if (!block.beginBlock.name)
                    console.error('block with handle "' + block.beginBlock.handle + '" is missing a name.');
                else
                    blocks[block.beginBlock.name] = block;
                block = {};
            } else if (scanner.peek().code == 0) {
                let entity = this.__parseEntity(scanner);
                if (entity) {
                    if (!block.entities)
                        block.entities = [];
                    block.entities.push(entity);
                    scanner.rewind();
                }
            } else {
                console.log('Unhandel group %j', scanner.peek());
            }
        }
        return blocks;
    }

    /**
     * Begins each block entry (a block entity definition)
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} a block entity definition
     */
    __parseBeginBlock(scanner) {
        let block = {};
        while (true) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 0:
                    scanner.rewind();
                    return block;
                case 1:
                    block.xrefPath = group.value;
                    break;
                case 2:
                    block.name = group.value;
                    break;
                case 3:
                    block.altName = group.value;
                    break;
                case 5:
                    block.handle = group.value;
                    break;
                case 8:
                    block.layer = group.value;
                    break;
                case 10:
                    block.position = this.__parsePoint(scanner);
                    break;
                case 67:
                    block.paperSpace = (group.value && group.value == 1) ? true : false;
                    break;
                case 70:
                    if (group.value != 0) {
                        block.type = group.value;
                    }
                    break;
                case 102:
                    block[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 330:
                    block.ownerHandle = group.value;
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
    }

    /**
     * End of each block entry (an endblk entity definition)
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} an endblk entity definition
     */
    __parseEndBlock(scanner) {
        let block = {};
        while (!scanner.isCurrentGroup(100, 'AcDbBlockEnd')) {
            let group = scanner.next().peek();
            switch (group.code) {
                case 5:
                    block.handle = group.value;
                    break;
                case 102:
                    block[group.value.slice(1)] = this.__parseAppGroup(scanner);
                    break;
                case 330:
                    block.ownerHandle = group.value;
                    break;
                default:
                    console.log('Unhandel group %j', group);
            }
        }
        return block;
    }

    /**
     * This section contains the graphical objects (entities) in the drawing,
     * including block references (insert entities).
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} entities section
     */
    __parseEntitiesSection(scanner) {
        let entities = [];
        while (!scanner.isEndOfSection()) {
            let group = scanner.next().peek();
            if (group.code === 0) {
                let entity = this.__parseEntity(scanner);
                if (entity)
                    entities.push(entity);
            }
        }
        return entities;
    }

    /**
     * Parse drawing entity
     * @private
     * @param {DXFScanner} scanner - scanner object
     * @returns {Object} entity object
     */
    __parseEntity(scanner) {
        let group = scanner.peek();
        let entity = null;
        switch (group.value) {
            case 'LINE':
                scanner.rewind();
                entity = LINE.parse(scanner);
                break;
            case 'ARC':
                scanner.rewind();
                entity = ARC.parse(scanner);
                break;
            case 'CIRCLE':
                scanner.rewind();
                entity = CIRCLE.parse(scanner);
                break;
            case 'MTEXT':
                scanner.rewind();
                entity = MTEXT.parse(scanner);
                break;
            case 'POINT':
                scanner.rewind();
                entity = POINT.parse(scanner);
                break;
            case 'VERTEX':
                scanner.rewind();
                entity = VERTEX.parse(scanner);
                break;
            case 'SPLINE':
                scanner.rewind();
                entity = SPLINE.parse(scanner);
                break;
            case 'TEXT':
                scanner.rewind();
                entity = TEXT.parse(scanner);
                break;
            case 'ELLIPSE':
                scanner.rewind();
                entity = ELLIPSE.parse(scanner);
                break;
            case 'INSERT':
                scanner.rewind();
                entity = INSERT.parse(scanner);
                break;
            case 'SOLID':
                scanner.rewind();
                entity = SOLID.parse(scanner);
                break;
            case 'ATTDEF':
                scanner.rewind();
                entity = ATTDEF.parse(scanner);
                break;
            case 'DIMENSION':
                scanner.rewind();
                entity = DIMENSION.parse(scanner);
                break;
        }
        return entity;
    }

    /**
     * Returns the truecolor value of the given AutoCad color index value
     * @private
     * @param {Number} index - color index
     * @return {Number} truecolor value as a number
     */
    __getAcadColor(index) {
        return AUTO_CAD_COLOR_INDEX[index];
    }

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
    }
}