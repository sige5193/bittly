import MdbDirective from '../../../models/MdbDirective.js'
export default class ScriptRuntime {
    /**
     * constructor of ScriptRuntime
     * @param {MdbDirective} directive
     */
    constructor ( directive ) {
        this.scriptResult = {};
        this.params = null;
        this.directive = directive;
    }

    /**
     * set directive status
     * @param {*} name 
     * @param {*} value 
     */
    statusSet(name, value) {
        this.directive.statusSet(name, value);
    }

    /**
     * get directive status
     * @param {*} name 
     * @param {*} defaultVal 
     * @returns 
     */
    statusGet(name, defaultVal=undefined) {
        return this.directive.statusGet(name, defaultVal);
    }

    /**
     * clear directive status
     */
    statusClear() {
        this.directive.statusClear();
    }

    /**
     * set parameter to this runtime
     * @param {any} params 
     */
    parametersSet( params ) {
        this.params = params;
    }

    /**
     * get parameters
     * @returns {any}
     */
    parametersGet() {
        return this.params;
    }

    /**
     * set variable value
     * @param {String} name 
     * @param {any} value 
     */
    variableSet (name, value) {
        this.scriptResult[name] = value;
    }

    /**
     * get form param value by given name.
     * @param {string} name
     * @returns {string} 
     */
    parameterFormValueGetByName(name) {
        let item = this.parameterFormItemGetByName(name);
        return null === item ? '' : item.value;
    }

    /**
     * get form param item by given name.
     * @param {string} name
     * @returns {Object} 
     */
    parameterFormItemGetByName( name ) {
        if ( !Array.isArray(this.params) ) {
            return null;
        }
        for ( let i=0; i<this.params.length; i++ ) {
            if ( this.params[i].name === name ) {
                return this.params[i];
            }
        }
        return null;
    }

    /**
     * get form param item by given index.
     * @param {Number} index
     * @returns {Object} 
     */
     parameterFormItemGetByIndex( index ) {
        if ( !Array.isArray(this.params) ) {
            return null;
        }
        return undefined == this.params[index-1] 
        ? null : this.params[index-1];
    }

    /**
     * get form param item by given index.
     * @param {Number} index
     * @returns {String} 
     */
    parameterFormItemValueGetByIndex( index ) {
        let item = this.parameterFormItemGetByIndex(index);
        return null === item ? '' : item.value;
    }
}