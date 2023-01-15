import ModelBase from '../utils/database/ModelBase.js'
import MyString from '../utils/datatype/MyString.js';
class MdbTestcase extends ModelBase {
    // 构造函数
    constructor() {
        super();
    }

    // 表名
    tablename() {
        return 'app_testcases';
    }

    /** 属性列表 */
    attributes() {
        return {
            id : {type:'string', default:MyString.uuidV4(),},
            projectId : {type:'string',default:''},
            directiveId : {type:'string',default:''},
            title : {type:'string',default:''},
            paramFormat : {type:'string',default:'hex'},
            params : {type:'object',default:{}},
            expectFormat : {type:'string',default:'hex'},
            expect : {type:'object',default:{}},
            timeout : {type:'integer',default:2000},
            beforeScript : {type:'string',default:''},
            afterScript : {type:'string',default:''},
        };
    }

    /**
     * 获取发布数据
     * @param {*} projectId 
     * @returns 
     */
     static async getPublishData(projectId) {
        let testcases = await MdbTestcase.findAll({project_id : projectId});
        for ( let i=0; i<testcases.length; i++ ) {
            let testcase = testcases[i];
            testcase = testcase.getData();
            testcases[i] = testcase;
        }
        return testcases;
    }
}
export default MdbTestcase;