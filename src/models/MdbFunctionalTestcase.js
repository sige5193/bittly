import { v4 as uuidV4 } from 'uuid';
import ModelBase from '../utils/database/ModelBase.js'
export default class MdbFunctionalTestcase extends ModelBase {
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
        return 'app_functional_testcases';
    }

    /**
     * attributes of model
     * @overide
     * @returns {Object}
     */
    attributes() {
        return {
            id : {type:'string', default:uuidV4(),},
            projectId : {type:'string',default:''},
            title : {type:'string',default:''},
            content : {type:'string',default:'{}'},
            timeout : {type:'string',default:'5000'},
        };
    }

    /**
     * get publish data of testcases
     * @param {*} projectId 
     * @returns {Array<Object>}
     */
     static async getPublishData(projectId) {
        let testcases = await MdbFunctionalTestcase.findAll({project_id : projectId});
        for ( let i=0; i<testcases.length; i++ ) {
            let testcase = testcases[i];
            testcase = testcase.getData();
            testcases[i] = testcase;
        }
        return testcases;
    }
}