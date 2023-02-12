export default class ScriptParameterHandler {
    /**
     * @constructor
     */
    constructor() {
        this.fields = [];
    }

    /**
     * get form param item by given name.
     * @param {string} name
     * @returns {Object|null}
     */
    itemGetByName( name ) {
        for ( let i=0; i<this.fields.length; i++ ) {
            if ( this.fields[i].name === name ) {
                return this.fields[i];
            }
        }
        return null;
    }

    /**
     * get form param item by given index.
     * @param {Number} index
     * @returns {Object} 
     */
    itemGetByIndex( index ) {
        return undefined == this.fields[index-1] 
        ? null : this.fields[index-1];
    }

    /**
     * get parameters by row numbers.
     * @param  {any} indexes 
     * @example parametersGetByRowNums([5,6,{from:1,to:2}])
     * @returns 
     */
    itemsGetByIndexes( ... indexes ) {
        let items = [];
        let errMessagePrefixKey = 'directive.script.parameterFormItemsGetByRowNums';
        for ( let i=0; i<indexes.length; i++ ) {
            let index  = indexes[i];
            if ( 'number' === typeof(index) ) {
                let param = this.itemGetByIndex(index);
                if ( null === param ) {
                    throw Error(window.app.$t(`${errMessagePrefixKey}NumNotExists`,[index]));
                }
                items.push(param);
                continue;
            } 
            
            if ( 'object' === typeof(index) ) {
                if ( undefined === index.from ) {
                    throw Error(window.app.$t(`${errMessagePrefixKey}FromNotSet`));
                }
                if ( undefined === index.to ) {
                    throw Error(window.app.$t(`${errMessagePrefixKey}ToNotSet`));
                }
                for ( let ni=index.from; ni<=index.to; ni++ ) {
                    let param = this.itemGetByIndex(ni);
                    if ( null === param ) {
                        throw Error(window.app.$t(`${errMessagePrefixKey}NumNotExists`,[ni]));
                    }
                    items.push(param);
                }
                continue;
            }
        }
        return items;
    }

    /**
     * get form param value by given name.
     * @param {string} name
     * @returns {string} 
     */
    valueGetByName(name) {
        let item = this.itemGetByName(name);
        return null === item ? '' : item.value;
    }

    /**
     * get form param item by given index.
     * @param {Number} index
     * @returns {String} 
     */
    valueGetByIndex( index ) {
        let item = this.itemGetByIndex(index);
        return null === item ? '' : item.value;
    }
}