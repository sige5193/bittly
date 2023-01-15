import ModelBase from '../utils/database/ModelBase.js'
import MyString from '../utils/datatype/MyString.js';
class MdbPanel extends ModelBase {
    // 构造函数
    constructor() {
        super();
    }

    // 表名
    tablename() {
        return 'app_panels';
    }

    /** 属性列表 */
    attributes() {
        return {
            id : {type:'string',default:MyString.uuidV4()},
            name : {type:'string',default:''},
            widgets : {type:'array',default:[]},
            variables : {type:'array',default:[]},
            projectId : {type:'string',default:''},
        }
    }

    /**
     * 获取发布数据
     * @param {*} projectId 
     * @returns 
     */
     static async getPublishData(projectId) {
        let panels = await MdbPanel.findAll({project_id : projectId});
        for ( let i=0; i<panels.length; i++ ) {
            let panel = panels[i];
            panel = panel.getData();
            panels[i] = panel;
        }
        return panels;
    }
}
export default MdbPanel;