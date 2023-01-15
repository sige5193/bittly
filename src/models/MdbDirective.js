import ModelBase from '../utils/database/ModelBase.js'
import MyString from '../utils/datatype/MyString.js';
/**
 * @property {string} id
 * @property {string} projectId
 * @property {string} name
 * @property {String} requestFormat Name of parameter type, [text|hex|file|form|none]
 */
export default class MdbDirective extends ModelBase {
    /**
     * constructor of directive
     */
    constructor() {
        super();
        /**
         * @property {Object<String : Object>}
         */
        this.status = {};
    }

    /**
     * 表名
     * @returns 
     */
    tablename() {
        return 'app_directives';
    }

    /**
     * 属性列表
     * @returns 
     */
    attributes() {
        return {
            id : { type:'string', default:MyString.uuidV4()},
            projectId : {type:'string',default:''},
            name : {type:'string',default:'未命名'},
            description : {type:'string',default:''},
            attributes : {type:'array',default:[]},
            endianness : {type:'string',default:''},
            target : {type:'object',default:{}},
            requestFormat : {type:'string',default:'form'},
            requestContent : {type:'object',default:{}},
            requestCharset : {type:'string',default:''},
            requestScriptLang : {type:'string',default:'javascript'},
            requestScript : {type:'string',default:''},
            responseCharset : {type:'string',default:''},
            responseScriptLang : {type:'string',default:''},
            responseScript : {type:'string',default:''},
            responseFormatter : {type:'object',default:{}},
            nlstyle : {type:'string',default:'DEFAULT'},
        }
    }

    /**
     * callback handler after datab deleted
     * @returns 
     */
    afterDelete() {
        window.app.$eventBus.$emit('directive-delete', this);
    }

    /**
     * 获取发布数据
     * @param {*} projectUuid 
     * @returns 
     */
    static async getPublishData(projectId) {
        let directives = await MdbDirective.findAll({project_id : projectId});
        for ( let i=0; i<directives.length; i++ ) {
            let directive = directives[i];
            directive = directive.getData();
            directives[i] = directive;
        }
        return directives;
    }

    /**
     * 根据路径查询指令
     * @param {*} projectId 
     * @param {*} name 
     */
    static async findByPathName(projectId, name) {
        let directiveModel = new MdbDirective();
        let path = name.split('/');
        let directiveName = path.pop();
        
        let folderQuery = `
            SELECT entries.id as entryId FROM app_directive_entries AS entries
            INNER JOIN app_directive_folders AS folder
            ON entries.target = folder.id
            WHERE entries.type = 'folder'
            AND entries.project_id = ?
            AND entries.parent_id = ?
            AND folder.name = ?
            LIMIT 1`;
        let folderEntryId = MyString.uuidNil();
        while ( 0 < path.length ) {
            let folderName = path.shift();
            let folder = await directiveModel.query(folderQuery, [projectId, folderEntryId, folderName]);
            if ( 0 == folder.length ) {
                return null;
            }
            folderEntryId = folder[0].entryId;
        }

        let directiveQuery = `
            SELECT entries.id, entries.target FROM app_directive_entries AS entries
            INNER JOIN app_directives AS directives
            ON entries.target = directives.id
            WHERE entries.type = 'directive'
            AND entries.project_id = ?
            AND entries.parent_id = ?
            AND name = ?
            LIMIT 1`;
        let entry = await directiveModel.query(directiveQuery, [projectId, folderEntryId, directiveName]);
        if ( 0 == entry.length ) {
            return null;
        }
        
        let directive = await MdbDirective.findOne(entry[0].target);
        return directive;
    }

    /**
     * set directive status value by given name
     * @param {String} name 
     * @param {String|Number} value 
     */
    statusSet(name, value ){
        if ( undefined === this.status[name] ) {
            this.status[name] = {};
        }
        this.status[name].value = value;
        this.trigger('status-update');
    }

    /**
     * get directive status value by given name
     * @param {String} name 
     * @param {String|Number} defaultVal 
     * @returns {String|Number}
     */
    statusGet(name, defaultVal=undefined){
        if ( undefined == this.status[name] ) {
            return defaultVal;
        }
        return this.status[name].value;
    }

    /**
     * clear all status of 
     */
    statusClear(){
        this.status = {};
        this.trigger('status-update');
    }

    /**
     * get statuses
     * @returns 
     */
    statusList() {
        return this.status;
    }
}