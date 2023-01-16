import ModelBase from '../utils/database/ModelBase.js'
import MyString from '../utils/datatype/MyString.js';
export default class MdbMock extends ModelBase {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * name of mapped database table.
     * @overide
     * @returns {String}
     */
    tablename() {
        return 'app_mocks';
    }

    /**
     * attributes of model
     * @overide
     * @returns {Object}
     */
    attributes() {
        return {
            id : {type:'string', default:MyString.uuidV4(),},
            projectId : {type:'string',default:''},
            name : {type:'string',default:''},
            type : {type:'string',default:''},
            summary : {type:'string',default:''},
            options : {type:'object',default:{}},
        };
    }
}