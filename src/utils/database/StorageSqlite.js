export default class StorageSqlite {
    /**
     * update data by given options
     * @param {*} options options for updating
     * - table : (required) name of database table 
     * - id : value of id to data
     * - data : updated values
     */
    update(options) {
        let attrs = [];
        let values = [];
        for ( let name in options.data ) {
            attrs.push(`${name} = ?`)
            values.push(options.data[name]);
        }
        
        values.push(options.id);
        let sql = `UPDATE ${options.table} SET ${attrs.join(',')} WHERE id = ?`;
        return new Promise(( resolve, reject ) => {
            window.database.run(sql, values, err => {
                if ( null != err ) {
                    return reject(false);
                }
                resolve(true);
            });
        });
    }

    /**
     * insert data by given options
     * @param {Object} options options to insert data
     * - table : (required) name of database table name to insert into
     * - data : Object of data row
     */
    insert(options) {
        let holders = [];
        let names = [];
        let values = [];
        
        for ( let name in options.data ) {
            names.push(name);
            holders.push('?');
            values.push(options.data[name]);
        }
        
        let sql = `INSERT INTO ${options.table} (${names.join(',')}) VALUES (${holders.join(',')})`;
        return new Promise(( resolve, reject ) => {
            window.database.run(sql, values,  err => {
                if ( null != err ) {
                    return reject(false);
                }
                resolve(true);
            });
        });
    }

    /**
     * find all records by given options.
     * @param {*} options options to find data records
     * - table : (required) name of database table.
     * - conditions : conditions to query data rows.
     * - limit : limit to result rows
     * @returns {Array<Object>}
     */
    find( options ) {
        let sql = [`SELECT * FROM ${options.table}`];
        let params = [];

        // generate condition
        if ( undefined != options.conditions ) {
            let conditionList = [];
            for ( let i in options.conditions ) {
                params.push(options.conditions[i]);
                conditionList.push(`${i} = ?`);
            }
            if ( 0 < conditionList.length ) {
                sql.push(`WHERE ${conditionList.join(' AND ')}`);
            }
        }
        
        // generate order
        sql.push('ORDER BY id DESC');
        
        // generate limit
        if ( undefined != options.limit && 0 != options.limit ) {
            sql.push(`LIMIT ${options.limit}`);
        }

        return new Promise(( resolve, reject ) => {
            window.database.all(sql.join(' '), params, ( err, rows ) => {
                if ( null != err ) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    /**
     * delete data by given options
     * @param {*} options options for updating
     * - table : (required) name of database table 
     * - id : value of id to data
     */
    delete( options ) {
        let sql = `DELETE FROM ${options.table} WHERE id = ?`;
        return new Promise(( resolve, reject ) => {
            window.database.run(sql, [options.id], err => {
                if ( null != err ) {
                    return reject(false);
                }
                resolve(true);
            });
        });
    }
}