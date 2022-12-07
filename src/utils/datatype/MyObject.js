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
        if ( typeof(objA) !== typeof(objB) ) {
            return false;
        }
        if ( 'object' !== typeof(objA) ) {
            return objA === objB;
        }
        if ( null === objA || null === objB ) {
            return objA === objB;
        }
        
        let keysA = Object.keys(objA);
        let keysB = Object.keys(objB);
        if ( keysA.length != keysB.length ) {
            return false;
        }
        
        for ( let key of keysA ) {
            if ( !MyObject.isEqual(objA[key], objB[key]) ) {
                return false;
            }
        }
        return true;
    }
}