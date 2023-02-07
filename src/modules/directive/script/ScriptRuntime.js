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
     * get parameters by row numbers.
     * @param  {any} nums 
     * @example parametersGetByRowNums([5,6,{from:1,to:2}])
     * @returns 
     */
    parameterFormItemsGetByRowNums( nums ) {
        if ( !Array.isArray(nums) ) {
            throw Error('row number list should be an array');
        }

        let rows = [];
        let errMessagePrefixKey = 'directive.script.parameterFormItemsGetByRowNums';
        for ( let i=0; i<nums.length; i++ ) {
            let num  = nums[i];
            if ( 'number' === typeof(num) ) {
                let param = this.parameterFormItemGetByIndex(num);
                if ( null === param ) {
                    throw Error(window.app.$t(`${errMessagePrefixKey}NumNotExists`,[num]));
                }
                rows.push(param);
                continue;
            } 
            
            if ( 'object' === typeof(num) ) {
                if ( undefined === num.from ) {
                    throw Error(window.app.$t(`${errMessagePrefixKey}FromNotSet`));
                }
                if ( undefined === num.to ) {
                    throw Error(window.app.$t(`${errMessagePrefixKey}ToNotSet`));
                }
                for ( let ni=num.from; ni<=num.to; ni++ ) {
                    let param = this.parameterFormItemGetByIndex(ni);
                    if ( null === param ) {
                        throw Error(window.app.$t(errMessageKey,[ni]));
                    }
                    rows.push(param);
                }
                continue;
            }
        }
        return rows;
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