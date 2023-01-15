import ModelBase from '../utils/database/ModelBase.js'
import MyString from '../utils/datatype/MyString.js';
/**
 * @property {string} id
 * @property {string} name
 * @property {string} projectId
 */
class MdbDirectiveFolder extends ModelBase {
    /**
     * 构造函数
     */
    constructor() {
        super();
    }

    /**
     * 表名
     * @returns {String}
     */
    tablename() {
        return 'app_directive_folders';
    }

    /**
     * 属性列表
     * @returns {Array}
     */
    attributes() {
        return {
            id : { type:'string', default:MyString.uuidV4() },
            name : { type:'string', default:'' },
            projectId : { type:'string', default:'' },
        }
    }

    /**
     * 获取发布数据
     * @param {*} projectId 
     * @returns {Array}
     */
    static async getPublishData(projectId) {
        let folders = await MdbDirectiveFolder.findAll({project_id : projectId});
        for ( let i=0; i<folders.length; i++ ) {
            let folder = folders[i];
            folder = folder.getData();
            folders[i] = folder;
        }
        return folders;
    }
}
export default MdbDirectiveFolder;