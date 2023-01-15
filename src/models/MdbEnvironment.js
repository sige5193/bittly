import ModelBase from '../utils/database/ModelBase.js'
import MyString from '../utils/datatype/MyString.js';
class MdbEnvironment extends ModelBase {
    // 构造函数
    constructor() {
        super();
    }

    // 表名
    tablename() {
        return 'app_environments';
    }

    /** 属性列表 */
    attributes() {
        return {
            id : {type:'string',default:MyString.uuidV4()},
            name : {type:'string',default:''},
            content : {type:'object',default:{}},
            projectId : {type:'string',default:''},
        }
    }

    /**
     * 获取发布数据
     * @param {*} projectUuid 
     * @returns 
     */
     static async getPublishData(projectId) {
        let envs = await MdbEnvironment.findAll({project_id : projectId});
        for ( let i=0; i<envs.length; i++ ) {
            let env = envs[i];
            env = env.getData();
            envs[i] = env;
        }
        return envs;
    }
}
export default MdbEnvironment;