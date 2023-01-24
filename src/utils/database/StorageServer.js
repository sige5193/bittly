import axios from 'axios'
import Environment from '../../environments/Environment';
import MyString from "../datatype/MyString";
export default class StorageServer {
    /**
     * @constructor
     */
    constructor() {
        this.uid = localStorage.databaseStorageServerUid;
        if ( undefined === this.uid ) {
            this.uid = MyString.uuidV4();
            localStorage.setItem('databaseStorageServerUid', this.uid);
        }
    }

    /**
     * execute data operation by given options
     * @param {*} action 
     * @param {*} options 
     */
    async execute( action, options ) {
        let apiUrl = 'https://bittly.sigechen.com/data';
        if ( 'dev' == Environment.getEnv().mode ) {
            apiUrl = 'http://server.bittly.local/data';
        }
        
        return new Promise((resolve, reject) => {
            let data = JSON.stringify(options);
            axios.post(`${apiUrl}/${action}`, data, {
                headers : {"Bittly-Database-Uid" : this.uid}
            })
            .then(response => {
                if ( response.data.success ) {
                    resolve(response.data.data);
                } else {
                    reject(Error(response.data.message))
                }
            })
            .catch(e => reject(e));
        });
    }
    
    /**
     * insert data by given options
     * @param {Object} options options to insert data
     * - table : (required) name of database table name to insert into
     * - data : Object of data row
     */
    async insert(options) {
        return await this.execute('insert', options);
    }

    /**
     * update data by given options
     * @param {*} options options for updating
     * - table : (required) name of database table 
     * - id : value of id to data
     * - data : updated values
     */
    async update(options) {
        return await this.execute('update', options);
    }

    /**
     * delete data by given options
     * @param {*} options options for deleting
     * - table : (required) name of database table 
     * - id : value of id to data
     */
    async delete( options ) {
        return await this.execute('delete', options);
    }

    /**
     * find all records by given options.
     * @param {*} options options to find data records
     * - table : (required) name of database table.
     * - conditions : conditions to query data rows.
     * - limit : limit to result rows
     * @returns {Array<Object>}
     */
    async find( options ) {
        return await this.execute('find', options);
    }
}