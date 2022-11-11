import { v4 as uuidV4 } from 'uuid';
import ModelBase from '../utils/database/ModelBase.js'
class MdbRuntimeVariable extends ModelBase {
    /** 构造函数 */
    constructor() {
        super();
    }

    /**
     * 表名
     * @overide
     * @returns 
     */
    tablename() {
        return 'app_runtime_variables';
    }

    /**
     * 属性列表
     * @overide
     * @returns 
     */
    attributes() {
        return {
            id : {type:'string', default:uuidV4(),},
            projectId : {type:'string',default:''},
            key : {type:'string',default:''},
            value : {type:'string',default:''},
        }
    }

    /**
     * 获取变量值
     * @param {*} name 
     * @param {*} defaultValue 
     */
    static async getVarValue( name, defaultValue, projectId ) {
        let condition = {};
        condition.key = name;
        if ( undefined != projectId ) {
            condition.project_id = projectId;
        }
        let variable = await MdbRuntimeVariable.findOne(condition);
        if ( null == variable ) {
            return defaultValue;
        } else {
            return variable.value;
        }
    }

    /**
     * 设置变量值
     * @param {*} name 
     * @param {*} value 
     */
    static async setVarValue( name, value, projectId ) {
        let condition = {};
        condition.key = name;
        if ( undefined != projectId ) {
            condition.project_id = projectId;
        }

        let variable = await MdbRuntimeVariable.findOne(condition);
        if ( null == variable ) {
            variable = new MdbRuntimeVariable();
            variable.key = name;
            if ( undefined != projectId ) {
                variable.projectId = projectId;
            }
        }
        
        variable.value = value;
        await variable.save();
    }
}
export default MdbRuntimeVariable;