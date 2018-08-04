import Scanner from './Scanner'
/**
 * Using AutoCad 2012 DXF Reference(See pages 3 - 10)
 * http://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf
 * 
 * @public
 * @extends {Scanner}
 * @example 
 * let dxfScanner = new DXFScanner()
 */
export default class DXFScanner extends Scanner {

    constructor(dxfData) {
        super(dxfData || []);
    }

    /**
     * Increment the file pointer
     * @public
     * @override
     * @return {this} refrence to Scanner object
     * @throws {Error} throw error when no data to read
     */
    next() {
        if (!this.hasNext()) {
            if (!this._eof)
                throw new Error('Unexpected end of input: EOF group not read before end of file. Ended on code ' + this._data[this._pointer]);
            else
                throw new Error('Cannot call \'next\' after EOF group has been read');
        }

        this._pointer += 2; // Why ? Group code composed of pairs of codes and associated values    
        if (this.isCurrentGroup(0, 'EOF')) this._eof = true;

        return this;
    }

    /**
     * Read the current position group in the file
     * @public
     * @override
     * @return {{code: Number}|*} the first is the group code, the second is the value
     * @throws {Error} throw error when unable to read the group data from file
     */
    peek() {
        if (!this.hasNext()) {
            if (!this.isEOF())
                throw new Error('Unexpected end of input: EOF group not read before end of file. Ended on code ' + this._data[this._pointer]);
            else
                throw new Error('Cannot call \'next\' after EOF group has been read');
        }

        var group = {
            code: parseInt(this._data[this._pointer])
        };

        group.value = this.__parseGroupValue(group.code, this._data[this._pointer + 1].trim());

        return group;
    }

    /**
     * Set the position file pointer
     * @public
     * @override
     * @param {Number} numberOfGroups - number of group
     */
    rewind(numberOfGroups) {
        numberOfGroups = numberOfGroups || 1;
        this._pointer = this._pointer - numberOfGroups * 2;
    }

    /**
     * Return true if only if there is data to read
     * @public
     * @override
     * @returns {boolean} true/false
     */
    hasNext() {
        // Check if we have read EOF group code
        if (this._eof) {
            return false;
        }

        // We need to be sure there are two lines available
        if (this._pointer > this._data.length - 2) {
            return false;
        }
        return true;
    }

    /**
     * Return true if only if there is End of file
     * @public
     * @override
     * @returns {boolean} true/false
     */
    isEOF() {
        return this._eof;
    }

    /**
     * Gives current position in the file
     * @public
     * @override
     * @returns {Number} current position
     */
    ftell() {
        return this._pointer;
    }

    /**
     * Return true only if the current group of scanner is specified one
     * @public
     * @param {Number} code - group code 
     * @param {*} value - goup value
     * @param { function(currentGroup: Object, supplyGroup: Object): boolean } comp - describe your comparatoe
     * @returns {boolean} true/false
     */
    isCurrentGroup(code, value, comp = null) {
        let curGroup = this.peek();
        if (!comp)
            return curGroup.code === code && curGroup.value === value;
        else
            return comp(curGroup, {
                code: code,
                value: value
            });
    }

    /**
     * Return if Section block start
     * @public
     * @returns {boolean} true/false
     */
    isStartOfSection() {
        return this.isCurrentGroup(0, 'SECTION');
    }

    /**
     * Return if Section block end
     * @public
     * @returns {boolean} true/false
     */
    isEndOfSection() {
        return this.isCurrentGroup(0, 'ENDSEC');
    }

    /**
     * Return if Table block start
     * @public
     * @returns {boolean} true/false
     */
    isStartOfTable() {
        return this.isCurrentGroup(0, 'TABLE');
    }

    /**
     * Return if Table block end
     * @public
     * @returns {boolean} true/false
     */
    isEndOfTable() {
        return this.isCurrentGroup(0, 'ENDTAB');
    }

    /**
     * Return if Table block start
     * @public
     * @returns {boolean} true/false
     */
    isStartOfBlock() {
        return this.isCurrentGroup(0, 'BLOCK');
    }

    /**
     * Return if Table block end
     * @public
     * @returns {boolean} true/false
     */
    isEndOfBlock() {
        return this.isCurrentGroup(0, 'ENDBLK');
    }

    /**
     * Return if Group start {application_name
     * @example
     * {ACAD_REACTORS / {ACAD_XDICTIONARY
     * @public
     * @returns {boolean} true/false
     */
    isStartOfAppGroup() {
        return this.isCurrentGroup(102, '^{[A-Za-z]+_[A-Za-z]+$', (g1, g2) => g1.code === g2.code && g2.value.test(g1));
    }

    /**
     * Return if Group end
     * @public
     * @returns {boolean} true/false
     */
    isEndOfAppGroup() {
        return this.isCurrentGroup(102, '}');
    }

    /**
     * Parse a value to its proper type.
     * @private
     * @param {Number} code - dxf group code
     * @param {String} value - value aginst group code in string
     * @returns {*} cast a value to its proper type
     * @throws {TypeError} throw error when str incompatible with the type expected 
     */
    __parseGroupValue(code, value) {
        if (code <= 9) return value;
        if (code >= 10 && code <= 59) return parseFloat(value);
        if (code >= 60 && code <= 99) return parseInt(value);
        if (code >= 100 && code <= 109) return value;
        if (code >= 110 && code <= 149) return parseFloat(value);
        if (code >= 160 && code <= 179) return parseInt(value);
        if (code >= 210 && code <= 239) return parseFloat(value);
        if (code >= 270 && code <= 289) return parseInt(value);
        if (code >= 290 && code <= 299) return this.parseBool(value);
        if (code >= 300 && code <= 369) return value;
        if (code >= 370 && code <= 389) return parseInt(value);
        if (code >= 390 && code <= 399) return value;
        if (code >= 400 && code <= 409) return parseInt(value);
        if (code >= 410 && code <= 419) return value;
        if (code >= 420 && code <= 429) return parseInt(value);
        if (code >= 430 && code <= 439) return value;
        if (code >= 440 && code <= 459) return parseInt(value);
        if (code >= 460 && code <= 469) return parseFloat(value);
        if (code >= 470 && code <= 481) return value;
        if (code === 999) return value;
        if (code >= 1000 && code <= 1009) return value;
        if (code >= 1010 && code <= 1059) return parseFloat(value);
        if (code >= 1060 && code <= 1071) return parseInt(value);

        console.warn('WARNING: Group code does not have a defined type: %j', {
            code: code,
            value: value
        });
        return value;
    }

    /**
     * Parse a boolean according to a 1 or 0 value
     * @private
     * @param {String} str - 0 or 1
     * @returns {boolean} - true if str 1 , false if 0 else throw type error
     * @throws {TypeError} throw error when str is not 0 or 1
     */
    parseBool(str) {
        if (str === '0') return false;
        if (str === '1') return true;
        throw TypeError('String \'' + str + '\' cannot be cast to Boolean type');
    }
}