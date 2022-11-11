import Common from '../Common.js'
export default class MyObject {
    /**
     * set value to object property if the property's value is empty.
     * @param {Object} srcObj 
     * @param {Object} defaultValues
     * @returns {Boolean} 
     */
    static applyDefaultValues( srcObj, defaultValues ) {
        let isChanged = false;
        for ( let key in defaultValues ) {
            if ( undefined === srcObj[key] ) {
                srcObj[key] = defaultValues[key];
                isChanged = true;
            }
        }
        return isChanged;
    }

    /**
     * copy given object to new object
     * @returns {Object}
     */
    static copy ( obj ) {
        if ( undefined === obj ) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * compare two objects, check if they are same
     * @param {Object} objA 
     * @param {Object} objB 
     * @returns {Boolean}
     */
    static isEqual( objA, objB ) {
        let keysA = Object.keys(objA);
        let keysB = Object.keys(objB);
        if ( keysA.length != keysB.length ) {
            return false;
        }

        for ( let key of keysA ) {
            let datatype = typeof(objA[key]);
            if ( datatype != typeof(objB[key]) ) {
                return false;
            }
            
            if ( 'object' === datatype ) {
                if ( !MyObject.isEqual(objA[key], objB[key]) ) {
                    return false;
                }
            } else {
                if ( objA[key] !== objB[key] ) {
                    return false;
                }
            }
        }

        return true;
    }
}