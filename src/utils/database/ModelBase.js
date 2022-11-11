export default class ModelBase {
    /**
     * constructor of database table model
     */
    constructor() {
        this.isInited = false;
        this.attrs = this.attributes();
        for ( let attrName in this.attrs ) {
            // set model setter and getter
            Object.defineProperty(this, attrName, {
                get : function() {
                    return this.getAttr(attrName);
                },
                set : function(value) {
                    this.setAttr(attrName, value);
                },
            });
            this.setupDefaultValue(attrName);
        }

        this.errors = {};
        this.isNew = true;
        this.tbname = this.tablename();
        this.eventHandlers = {};
        this.isInited = true;
    }

    /**
     * set default value of attribute
     * @param {*} attrName 
     * @returns 
     */
    setupDefaultValue( attrName ) {
        if ( undefined == this.attrs[attrName].default ) {
            return ;
        }
        this.setAttr(attrName, this.attrs[attrName].default);
    }

    /**
     * callback handler on data inserted.
     * @overide
     * @returns {Promise}
     */
    afterInsert() { 
        return Promise.resolve();
    }

    /**
     * callback handler before data deleted
     * @overide
     * @returns {Promise}
     */
    beforeDelete() { 
        return Promise.resolve();
    }

    /**
     * callback handler after datab deleted
     * @returns 
     */
    afterDelete() {
        return ;
    }

    /**
     * register event handler on event
     * @param {String} event 
     * @param {CallableFunction} callback 
     */
    on( event, callback ) {
        if ( undefined == this.eventHandlers[event] ) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    /**
     * remove event handler on event
     * @param {String} event 
     * @param {CallableFunction} callback 
     */
    off ( event, callback ) {
        if ( undefined == this.eventHandlers[event] ) {
            return;
        }

        for ( let i=0; i<this.eventHandlers[event].length; i++ ) {
            if ( callback == this.eventHandlers[event][i] ) {
                this.eventHandlers[event].splice(i,1);
            }
        }
    }

    /**
     * trigger event by given name
     * @param {String} event 
     */
    trigger( event ) {
        if ( undefined == this.eventHandlers[event] ) {
            return ;
        }
        for ( let i=0; i<this.eventHandlers[event].length; i++ ) {
            this.eventHandlers[event][i]();
        }
    }

    /**
     * get table name of this model
     * @overide
     * @returns {String} 
     */
    tablename() {
        return null;
    }
    
    /**
     * get all attribute definations of this model.
     * @overide
     * @returns {Object}
     */
    attributes() {
        return {};
    }

    /**
     * set attribute value
     * @param {String} name 
     * @param {any} value 
     * @fires ModelBase#change
     */
    setAttr(name, value) {
        name = this.convertSnakeToCamelCase(name);
        if ( undefined == this.attrs[name] ) {
            return;
        }

        this.attrs[name].value = value;
        if ( this.isInited ) {
            this.trigger('change');
        }
    }

    /**
     * get data object of this model, the key of data object is attribute's
     * name and value is value of attribute value.
     * @returns {Object}
     */
    getData() {
        let data = {};
        for ( let name in this.attrs ) {
            data[name] = this.getAttributeValue(name);
        }
        return data;
    }

    /**
     * get value by given attribute name
     * @param {String} name 
     * @returns {any}
     */
    getAttr( name ) {
        return this.attrs[name].value;
    }

    /**
     * get value by given attribute name, same as {ModelBase.getAttr}
     * @param {String} name 
     * @returns {any}
     */
    getAttributeValue( name ) {
        return this.attrs[name].value;
    }

    /**
     * get prop value of attribute by given prop name
     * @param {String} name 
     * @param {String} defaultValue 
     * @returns {any}
     */
    getAttributeProp(name, prop, defaultValue) {
        return undefined == this.attrs[name][prop] 
            ? defaultValue 
            : this.attrs[name][prop];
    }

    /**
     * set attribute values by given object
     * @param {Object} attrs 
     */
    setAttributes( attrs ) {
        for ( let key in attrs ) {
            if ( undefined === attrs[key] ) {
                continue;
            }
            this.setAttr(key, attrs[key]);
        }
    }

    /**
     * save data of this model to database
     * @returns {Promise}
     */
    async save() {
        if ( ! await this.validate() ) {
            console.log("model validate failed : ",this.errors);
            return false;
        }
        return this.isNew 
        ? await this.insert() 
        : await this.update();
    }

    /**
     * save data or throw {Error} on failed
     * @returns {Promise}
     */
    async saveOrThrowStringMessage() {
        if ( await this.save() ) {
            return;
        }

        let messages = [];
        for ( let attr in this.errors ) {
            let attrMessage = `${attr} : ${this.errors[attr].join(',')}`;
            messages.push(attrMessage);
        } 
        messages.join(';');
        throw Error(messages);
    }

    /**
     * add error message to attribute
     * @param {String} name 
     * @param {String} message 
     */
    addError( name, message ) {
        if ( undefined == this.errors[name] ) {
            this.errors[name] = [];
        }
        this.errors[name].push(message);
    }

    /**
     * check error on attribute by given attribute name, or check
     * the error on this model.
     * @param {String} name 
     * @returns {Boolean}
     */
    hasError( name ) {
        if ( undefined == name ) {
            return 0 < Object.keys(this.errors).length;
        } else {
            if ( undefined == this.errors[name] ) {
                return false;
            }
            return 0 < this.errors[name].length;
        }
    }

    /**
     * get error message of attribute by given attribute name
     * @returns {String}
     */
    getErrorSummary ( name ) {
        if ( undefined == this.errors[name] ) {
            return '';
        }
        return this.errors[name].join(';');
    }

    /**
     * validate this model
     * @public
     * @async
     * @returns {boolean}
     */
    async validate() {
        this.errors = {};
        for ( let name in this.attrs ) {
            this.validateDataType(name);
            await this.validateUnique(name);
        }
        return 0 == Object.keys(this.errors).length;
    }

    /**
     * validate attribute value unique
     * @param {String} name 
     */
    async validateUnique(name) {
        if ( true != this.getAttributeProp(name,'unique',false) ) {
            return;
        }

        let value = this.getAttributeValue(name);
        let uniqueCheck = null;
        if ( this.isNew ) {
            uniqueCheck = await this.query(`SELECT COUNT(*) AS DataCount FROM ${this.tbname} WHERE ${name} = ?`, [value]);
        } else {
            uniqueCheck = await this.query(`SELECT COUNT(*) AS DataCount FROM ${this.tbname} WHERE ${name} = ? AND id != ?`, [value, this.id]);
        }
        if ( 0 != uniqueCheck[0].DataCount ) {
            this.addError(name, `${value} 已经存在`);
        }
    }

    /**
     * validate data type by given attribute name.
     * @param {String} name 
     */
    validateDataType( name ) {
        if ( undefined == this.attrs[name].type ) {
            return;
        }

        let typeValidator = {
            string : function( model, attrName ) {
                let val = model.getAttributeValue(attrName);
                let maxLength = model.getAttributeProp(attrName,'maxLength');
                if ( undefined != maxLength && val.length > maxLength ) {
                    model.addError(attrName, `内容长度超出 ${val.length - maxLength} 个字符`);
                }
                let isRequired = model.getAttributeProp(attrName, 'required', false);
                if ( isRequired && 0 == val.trim().length ) {
                    model.addError(attrName, `内容不能为空`);
                }
            },
        };
        if ( undefined != typeValidator[this.attrs[name].type] ) {
            typeValidator[this.attrs[name].type](this, name);
        }
    }

    /**
     * update data value to database.
     * @fires ModelBas#update
     * @returns {Promise}
     */
    update() {
        let attrs = [];
        let values = [];
        for ( let name in this.attrs ) {
            let aName = this.convertCamelToSnakeCase(name);
            attrs.push(`${aName} = ?`)
            values.push(this.formatAttributeValue(this.attrs[name], this.attrs[name].value));
        }
        
        values.push(this.id);
        let $this = this;
        let sql = `UPDATE ${this.tbname} SET ${attrs.join(',')} WHERE id = ?`;
        return new Promise(function( resolve, reject ) {
            window.database.run(sql, values, function( err ) {
                if ( null != err ) {
                    reject(false);
                    return;
                }
                $this.trigger('update');
                resolve(true);
            });
        });
    }

    /**
     * insert new data to data
     * @fires ModelBase#inserte
     * @returns {Promise}
     */
    insert() {
        let holders = [];
        let names = [];
        let values = [];
        for ( let name in this.attrs ) {
            names.push(this.convertCamelToSnakeCase(name));
            holders.push('?');
            values.push(this.formatAttributeValue(this.attrs[name], this.attrs[name].value));
        }
        
        let sql = `INSERT INTO ${this.tbname} (${names.join(',')}) VALUES (${holders.join(',')})`;
        let $this = this;
        return new Promise(function( resolve, reject ) {
            window.database.run(sql, values, function( err ) {
                if ( null != err ) {
                    reject(false);
                    return;
                }
                if ( undefined == $this.id ) {
                    $this.id = this.lastID;
                }
                $this.isNew = false;
                $this.trigger('inserte');
                $this.afterInsert().then(function() {
                    resolve(true);
                });
            });
        });
    }

    /**
     * format attribute value for sql query.
     * @protect
     * @param {Object} attr 
     * @param {any} value 
     * @returns {String}
     */
    formatAttributeValue( attr, value ) {
        if ( undefined == attr.type ) {
            return value;
        }
        switch ( attr.type ) {
        case 'integer' : return value;
        case 'string' : return value;
        case 'array' : return JSON.stringify(value);
        case 'object' : return JSON.stringify(value);
        default : throw Error(`value type ${attr.type} does not supportted.`);
        }
    }

    /**
     * convert snake to camel case
     * @param {String} str 
     * @returns {String}
     */
    convertSnakeToCamelCase( str ) {
        return str.replace(/([-_][a-z])/g, group => group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
        );
    }

    /**
     * convert camel to snake case
     * @param {String} str 
     * @returns {String}
     */
    convertCamelToSnakeCase( str ) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    /**
     * delete this model from database
     * @returns {Promise}
     */
    delete() {
        let sql = `DELETE FROM ${this.tbname} WHERE id = ?`;
        let $this = this;
        return new Promise(function( resolve, reject ) {
            $this.beforeDelete().then(function() {
                window.database.run(sql, [$this.id], function( err ) {
                    if ( null != err ) {
                        reject(false);
                        return;
                    }
                    $this.isNew = true;
                    $this.afterDelete();
                    resolve(true);
                });
            })
        });
    }

    /** 
     * delete all data by given options.
     * @static
     * @param {Object} options options to filter data.
     * - {Object} conditions
     * - {Number} limit
     * @returns {Promise}
     */
    static deleteAll( options ) {
        if ( undefined == options ) {
            options = {};
        }

        let model = new this;
        let params = [];

        let conditions = (undefined === options.conditions) ? options : options.conditions;
        let conditionList = [];
        for ( let i in conditions ) {
            params.push(conditions[i]);
            conditionList.push(`${i} = ?`);
        }
        conditionList = 0 == conditionList.length ? '' : `WHERE ${conditionList.join(' AND ')}`;

        let limit = '';
        if ( undefined != options.limit ) {
            limit = `LIMIT ${options.limit}`
        }

        let $this = this;
        let sql = `DELETE FROM ${model.tbname} ${conditionList} ${limit}`;
        return new Promise(function( resolve, reject ) {
            window.database.run(sql, params, function( err ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }

    /**
     * find record by given condition
     * @static
     * @param {Object|String} condition conditions to filter data.
     * - {Object} conditions
     * - {Number} limit
     * @returns {Promise}
     */
    static async findOne( condition ) {
        if ( 'object' != typeof(condition) ) {
            condition = {id:condition};
        }
        let options = {
            conditions : condition,
            limit : 1,
        };
        let models = await this.findAll(options);
        return 0 == models.length ? null : models[0];
    }

    /**
     * find all records by given condition
     * @static
     * @param {Object|String} condition conditions to filter data.
     * - {Object} conditions
     * - {Number} limit
     * @returns {Promise}
     */
    static findAll( options ) {
        if ( undefined == options ) {
            options = {};
        }

        let model = new this;
        let params = [];

        let conditions = (undefined === options.conditions) ? options : options.conditions;
        let conditionList = [];
        for ( let i in conditions ) {
            params.push(conditions[i]);
            conditionList.push(`${i} = ?`);
        }
        conditionList = 0 == conditionList.length ? '' : `WHERE ${conditionList.join(' AND ')}`;

        let order = 'ORDER BY id DESC';

        let limit = '';
        if ( undefined != options.limit ) {
            limit = `LIMIT ${options.limit}`
        }

        let $this = this;
        let sql = `SELECT * FROM ${model.tbname} ${conditionList} ${order} ${limit}`;
        return new Promise(function( resolve, reject ) {
            window.database.all(sql, params, function( err, rows ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }

                let models = [];
                for ( let i=0; i<rows.length; i++ ) {
                    let instance = new $this();
                    instance.isInited = false;
                    instance.fillModel(rows[i]);
                    instance.isNew = false;
                    instance.isInited = true;
                    models.push(instance);
                }
                resolve(models);
            });
        });
    }

    /**
     * fill model data
     * @param {Object} data 
     */
    fillModel( data ) {
        for ( let key in data ) {
            let value = data[key];
            key = this.convertSnakeToCamelCase(key);
            if ( undefined === this.attrs[key] ) {
                continue;
            }
            switch ( this.attrs[key].type ) {
            case 'object' :
            case 'array' :
                this.attrs[key].value = JSON.parse(value);
                break;
            default : 
                this.attrs[key].value = value;
                break;
            }
        }
    }

    /**
     * execute sql query and resolve result data
     * @param {String} sql 
     * @param {Array} params 
     * @returns {Promise}
     */
    query( sql, params ) {
        return new Promise(function( resolve, reject ) {
            window.database.all(sql, params, function( err, rows ) {
                if ( null != err ) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * execute sql query
     * @param {String} sql 
     * @param {Array} params
     * @returns {Promise} 
     */
    static executeSQL ( sql, params ) {
        return new Promise(function( resolve, reject ) {
            window.database.run(sql, params, function( err ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    /**
     * start a database transaction
     * @returns {Promise}
     */
    static async transactionBegin() {
        await ModelBase.executeSQL('BEGIN TRANSACTION;');
    } 

    /**
     * commit a database transaction
     * @returns {Promise}
     */
    static async transactionCommit() {
        await ModelBase.executeSQL('END TRANSACTION;');
    }

    /**
     * rollback a database transaction
     * @returns {Promise}
     */
    static async transactionRollback() {
        await ModelBase.executeSQL('ROLLBACK;');
    }

    /**
     * clone this model
     * @returns {ModelBase}
     */
    clone() {
        let instance = new this.constructor();
        instance.isInited = false;
        instance.setAttributes(this.getData());
        instance.isNew = false;
        instance.isInited = true;
        return instance;
    }

    /**
     * @param {*} data 
     * @returns {this} 
     */
    static async create( data, save=false ) {
        let instance = new this();
        instance.fillModel(data);
        if ( save ) {
            await instance.save();
        }
        return instance;
    }

    /**
     * 
     */
    toJSON() {
        return this.getData();
    }
}