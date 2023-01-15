import ModelBase from '../utils/database/ModelBase.js'
import MdbDirectiveFolder from './MdbDirectiveFolder.js'
import MdbDirective from './MdbDirective.js'
import MyString from '../utils/datatype/MyString.js';
/**
 * @property {string} id
 * @property {string} type
 * @property {string} target
 * @property {string} parentId
 * @property {string} projectId
 */
class MdbDirectiveEntry extends ModelBase {
    // 构造函数
    constructor() {
        super();
    }

    // 表名
    tablename() {
        return 'app_directive_entries';
    }

    /** 属性列表 */
    attributes() {
        return {
            id : { type:'string', default:MyString.uuidV4()},
            projectId : {type:'string',default:''},
            type : {type:'string',default:''},
            target : {type:'string',default:''},
            parentId : {type:'string',default:''},
        }
    }

    /**
     * 获取目标名称
     */
    async targetName() {
        let model = await this.getTargetModel();
        return model.name;
    }

    /**
     * 获取目标model
     * @returns 
     */
    async getTargetModel() {
        if ( 'folder' == this.type ) {
            return await MdbDirectiveFolder.findOne(this.target);
        } else if ( 'directive' == this.type ) {
            return await MdbDirective.findOne(this.target);
        } else {
            return null;
        }
    }

    /**
     * 递归删除该条目以及子条目
     */
    async deleteRecursively() {
        if ( 'folder' == this.type ) {
            let entries = await MdbDirectiveEntry.findAll({parent_id:this.id});
            for ( let i=0; i<entries.length; i++ ) {
                await entries[i].deleteRecursively();
            }
        }
        let target = await this.getTargetModel();
        await target.delete();
        await this.delete();
    }

    /**
     * 获取发布数据
     * @param {*} projectUuid 
     * @returns 
     */
     static async getPublishData(projectId) {
        let entries = await MdbDirectiveEntry.findAll({project_id : projectId});
        for ( let i=0; i<entries.length; i++ ) {
            let entry = entries[i];
            entry = entry.getData();
            entries[i] = entry;
        }
        return entries;
    }
}
export default MdbDirectiveEntry;