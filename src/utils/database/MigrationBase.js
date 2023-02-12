import StorageSqlite from "./StorageSqlite";

export default class MigrationBase {
    /**
     * execute database update
     */
    async executeUp() {
        this.log(`> execute migrate up [${this.constructor.name}] start`);
        await this.up();
        this.log(`> execute migrate up [${this.constructor.name}] done`);
    }

    /**
     * rename table
     * @param {String} tableName 
     * @param {String} newTableName 
     */
    async renameTable( tableName, newTableName ) {
        await this.exec(`ALTER TABLE "${tableName}" RENAME TO "${newTableName}"`);
    }

    /**
     * delete table column
     * @param {String} tableName 
     * @param {String} columnName 
     */
    async dropColumn( tableName, columnName ) {
        let createStatement = await this.query(`SELECT sql FROM sqlite_master WHERE name = '${tableName}'`);
        createStatement = createStatement[0].sql;
        let columns = createStatement.substr(createStatement.indexOf('(') + 1);
        columns = columns.substr(0, columns.lastIndexOf(')'));
        columns = columns.split(',');
        
        let newColumnNames = [];
        let newColumns = [];
        for ( let i=0; i<columns.length; i++ ) {
            let column = columns[i].trim();
            if ( column.startsWith(`"${columnName}"`) ) {
                continue;
            }
            newColumns.push(column);

            let name = column.substr(0, column.indexOf(' '));
            newColumnNames.push(name);
        }
        newColumns = newColumns.join(',');
        newColumnNames = newColumnNames.join(',');

        let tmpTableName = `__tmp__${tableName}`;
        await this.renameTable(tableName, tmpTableName);
        await this.exec(`CREATE TABLE "${tableName}" ( ${newColumns} )`);
        await this.exec(`INSERT INTO "${tableName}" ( ${newColumnNames} ) SELECT ${newColumnNames} FROM "${tmpTableName}"`);
        await this.exec(`DROP TABLE "${tmpTableName}"`);
    }

    /**
     * rename table column
     * @param {String} tableName 
     * @param {String} columnName 
     * @param {String} newName 
     */
    async renameColumn( tableName, columnName, newName ) {
        await this.exec(`ALTER TABLE ${tableName} RENAME COLUMN "${columnName}" to "${newName}"`);
    }

    /**
     * alter table column
     * @param {String} tableName 
     * @param {String} columnName 
     * @param {Object} defination {@see MigrationBase.addColumn}
     */
    async alterColumn ( tableName, columnName, defination ) {
        let tmpColumnName = `__TMP__${columnName}`;
        await this.renameColumn(tableName, columnName, tmpColumnName);
        await this.addColumn(tableName, columnName, defination);
        await this.exec(`UPDATE "${tableName}" SET \`${columnName}\` = \`${tmpColumnName}\``);
        await this.dropColumn(tableName, tmpColumnName);
    }

    /**
     * add new column
     * @param {String} tableName 
     * @param {String} colName 
     * @param {Object} defination column defination object.
     * - {String} type
     * - {Boolean} notNull
     * - {Boolean} primaryKey
     * - {Boolean} autoIncrement
     * - {String} default
     */
    async addColumn ( tableName, colName, defination ) {
        if ( 'object' == typeof(defination) ) {
            let defParts = [];
            defParts.push(defination.type);
            if ( undefined != defination.notNull && defination.notNull ) {
                defParts.push('NOT NULL')
            }
            if ( undefined != defination.primaryKey && defination.primaryKey ) {
                defParts.push('PRIMARY KEY')
            }
            if ( undefined != defination.autoIncrement && defination.autoIncrement ) {
                defParts.push('AUTOINCREMENT');
            }
            if ( undefined != defination.default ) {
                if ( 'string' == typeof(defination.default) ) {
                    defParts.push(`DEFAULT '${defination.default}'`);
                } else {
                    defParts.push(`DEFAULT ${defination.default}`);
                }
            }
            defination = defParts.join(' ');
        }

        await this.exec(`ALTER TABLE ${tableName} ADD COLUMN "${colName}" ${defination}`);
    }

    /**
     * execute sql
     * @param {String} sql 
     * @returns {Promise}
     */
    exec(sql, params) {
        let $this = this;
        if ( undefined == params ) {
            params = [];
        }
        return new Promise(function( resolve, reject ) {
            $this.log(sql);
            StorageSqlite.getDatabase().run(sql, params, function( err ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }

    /**
     * execute sql query and returns result
     * @param {String} sql
     * @returns {Promise} 
     */
    query( sql, params ) {
        if ( undefined == params ) {
            params = [];
        }

        return new Promise(function( resolve, reject ) {
            StorageSqlite.getDatabase().all(sql, params, function( err, rows ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    /**
     * execute sql qury and get first result.
     * @param {*} sql 
     * @param {*} params 
     * @returns 
     */
    async findOne( sql, params ) {
        let rows = await this.query( sql, params );
        return 0 === rows.length ? null : rows[0];
    }

    /**
     * output log message
     * @param {String} message 
     */
    log( message ) {
        if ( 'test' === window.envName ) {
            return ;
        }
        console.log(message);
    }
}