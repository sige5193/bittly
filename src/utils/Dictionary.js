class Dictionary {
    /** 
     * @var {object}
     */
    static dict = null;

    /**
     * 配置 Vue
     */
    static setupVue( vue ) {
        // 字典
        vue.prototype.$dict = {
            // 获取条目
            items : function(name) {
                return Dictionary.getItems(name);
            },
            // 匹配
            match : function(group,key, value) {
                return Dictionary.match(group, key, value);
            },
            // 名称
            name : function( group, value ) {
                return Dictionary.name(group, value);
            },
            value : function( group, key ) {
                return Dictionary.value(group, key);
            },
            koption : function( group, key, prop, defaultValue ) {
                return Dictionary.koption(group, key, prop, defaultValue);
            },
            voption : function( group, value, prop, defaultValue ) {
                return Dictionary.voption(group, value, prop, defaultValue);
            },
        };
    }

    /**
     * get group items
     * @param {String} group 
     * @returns {Array<String>}
     */
    static getItems( group ) {
        if ( undefined === Dictionary.dict[group] ) {
            throw Error(`unable to get items from dictionary group "${group}"`);
        }
        return Dictionary.dict[group].items;
    }

    /**
     * 判断给定的值是否匹配字典的项目
     * @param {*} group 
     * @param {*} keys 
     * @param {*} value 
     */
    static match( group, keys, value ) {
        if ( 'string' === typeof(keys) ) {
            keys = [keys];
        }
        for ( let i=0; i<keys.length; i++ ) {
            if ( undefined !== Dictionary.dict[group] 
            && undefined !== Dictionary.dict[group].items[keys[i]]
            && value == Dictionary.dict[group].items[keys[i]].value ){
                return true;
            }
        }
        return false;
    }

    /**
     * 取值
     * @param {*} group 
     * @param {*} key 
     * @returns 
     */
    static value ( group, key ) {
        if ( undefined == Dictionary.dict[group] 
        || undefined == Dictionary.dict[group].items[key] ){
            return null;
        }
        return Dictionary.dict[group].items[key].value;
    }

    /**
     * 获取值对应的名称
     * @param {*} group 
     * @param {*} value 
     */
    static name ( group, value ) {
        if ( undefined === Dictionary.dict[group] ) {
            return null;
        }
        for ( let key in Dictionary.dict[group].items ) {
            if ( Dictionary.dict[group].items[key].value == value ) {
                return Dictionary.dict[group].items[key].name;
            }
        }
        return null;
    }

    /**
     * 通过键名获取配置项
     * @param {*} group 
     * @param {*} key 
     * @param {*} prop 
     * @param {*} defaultValue 
     * @returns 
     */
    static koption( group, key, prop, defaultValue ) {
        if ( undefined === Dictionary.dict[group] 
        || undefined === Dictionary.dict[group].items[key]
        || undefined === Dictionary.dict[group].items[key].options[prop]) {
            return defaultValue;
        }
        return Dictionary.dict[group].items[key].options[prop];
    }

    /**
     * 通过键值获取配置项
     * @param {*} group 
     * @param {*} value 
     * @param {*} prop 
     * @param {*} defaultValue 
     */
    static voption( group, value, prop, defaultValue ) {
        if ( undefined === Dictionary.dict[group] ) {
            return defaultValue;
        }
        let propValue = defaultValue;
        for ( let key in Dictionary.dict[group].items ) {
            if ( Dictionary.dict[group].items[key].value != value ) {
                continue;
            }
            if ( undefined === Dictionary.dict[group].items[key].options[prop] ) {
                break;
            }
            propValue = Dictionary.dict[group].items[key].options[prop];
            break;
        }
        return propValue;
    }

    /**
     * 加载字典
     * @returns 
     */
    static async load() {
        let resultHandler = function( result, resolve ) {
            let dict = {};
            for ( let i=0; i<result.length; i++ ) {
                if ( undefined == dict[result[i].group] ) {
                    dict[result[i].group] = {
                        name : result[i].group_name,
                        items : {}
                    };
                }
                dict[result[i].group].items[result[i].key] = result[i];
                dict[result[i].group].items[result[i].key].options = JSON.parse(result[i].options);
            }
            Dictionary.dict = dict;
            resolve();
        };

        let sql = `SELECT * FROM app_dictionary`;
        return new Promise(function( resolve, reject ) {
            window.database.all(sql, [], function( err, rows ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }
                resultHandler(rows, resolve);
            });
        });
    }
}

export default Dictionary;