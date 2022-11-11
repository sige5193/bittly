import { v4 as uuidV4 } from 'uuid';
import MdbDirective from './MdbDirective.js'
import ModelBase from '../utils/database/ModelBase.js'
import MdbDirectiveEntry from './MdbDirectiveEntry.js';
import MdbDirectiveFolder from './MdbDirectiveFolder.js';
import MdbPanel from './MdbPanel.js'
import MdbTestcase from './MdbTestcase.js';
import MdbEnvironment from './MdbEnvironment.js'
/**
 * 项目 Model
 * @property {integer} id ID
 * @property {string} name 名称
 * @property {string} description 描述
 * @property {string} charset 字符集
 * @property {string} endianness 字节序
 */
export default class MdbProject extends ModelBase {
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
        return 'app_projects';
    }

    /**
     * 属性列表
     * @overide
     * @returns 
     */
    attributes() {
        return {
            id : {type:'string',default:uuidV4()},
            name : {type:'string',default:'',maxLength:64,required:true},
            description : {type:'string',default:'',maxLength:200},
            charset : {type:'string',default:'utf8'},
            endianness : {type:'string',default:'big-endian'},
            remoteUuid : {type:'string',default:''},
            sourceUuid : {type:'string',default:''},
            version : {type:'integer', default:0},
            script : {type:'string',default:''},
            defaultTargetType : {type:'string',default:'SerialPort'},
        }
    }

    /**
     * 删除之前回调
     */
    async beforeDelete () {
        await MdbDirective.deleteAll({project_id:this.id});
        await MdbDirectiveEntry.deleteAll({project_id:this.id});
        await MdbDirectiveFolder.deleteAll({project_id:this.id});
        await MdbPanel.deleteAll({project_id:this.id});
        await MdbTestcase.deleteAll({project_id:this.id});
        await MdbEnvironment.deleteAll({project_id:this.id});
    }

    /**
     * 生成项目发布数据
     */
    async generatePublishData() {
        let project = this.getData();
        project.directives = await MdbDirective.getPublishData(this.id);
        project.directiveEntries = await MdbDirectiveEntry.getPublishData(this.id);
        project.directiveFolders = await MdbDirectiveFolder.getPublishData(this.id);
        project.panels = await MdbPanel.getPublishData(this.id);
        project.testcases = await MdbTestcase.getPublishData(this.id);
        project.envs = await MdbEnvironment.getPublishData(this.id);
        return JSON.stringify(project);
    }

    /**
     * 将发布的数据应用到当前项目
     */
    async applyPublishData( content, progressCallback ) {
        if ( undefined === progressCallback ) {
            progressCallback = function() { 
                return new Promise(( resolve ) => {
                    resolve();
                }) 
            };
        }

        // 更新项目表
        this.setAttributes(content);
        await this.saveOrThrowStringMessage();
        await progressCallback('project');

        // 更新指令表
        await MdbDirective.deleteAll({project_id:this.id});
        for ( let i=0; i<content.directives.length; i++ ) {
            let directiveData = content.directives[i];
            let directive = new MdbDirective();
            directive.setAttributes(directiveData);
            await directive.saveOrThrowStringMessage();
        }
        await progressCallback('directive');

        // 更新指令文件夹表
        await MdbDirectiveFolder.deleteAll({project_id:this.id});
        for ( let i=0; i<content.directiveFolders.length; i++ ) {
            let itemData = content.directiveFolders[i];
            let item = new MdbDirectiveFolder();
            item.setAttributes(itemData);
            await item.saveOrThrowStringMessage();
        }
        await progressCallback('directive-folder');

        // 更新指令条目表
        await MdbDirectiveEntry.deleteAll({project_id : this.id});
        for ( let i=0; i<content.directiveEntries.length; i++ ) {
            let itemData = content.directiveEntries[i];
            let item = new MdbDirectiveEntry();
            item.setAttributes(itemData);
            await item.saveOrThrowStringMessage();
        }
        await progressCallback('directive-entry');

        // 更新面板
        await MdbPanel.deleteAll({project_id : this.id});
        for ( let i=0; i<content.panels.length; i++ ) {
            let itemData = content.panels[i];
            let item = new MdbPanel();
            item.setAttributes(itemData);
            await item.saveOrThrowStringMessage();
        }
        await progressCallback('panel');
        
        // 更新测试用例
        await MdbTestcase.deleteAll({project_id : this.id});
        for ( let i=0; i<content.testcases.length; i++ ) {
            let itemData = content.testcases[i];
            let item = new MdbTestcase();
            item.setAttributes(itemData);
            await item.saveOrThrowStringMessage();
        }
        await progressCallback('testcase');

        // 更新环境变量
        await MdbEnvironment.deleteAll({project_id : this.id});
        for ( let i=0; i<content.envs.length; i++ ) {
            let itemData = content.envs[i];
            let item = new MdbEnvironment();
            item.setAttributes(itemData);
            await item.saveOrThrowStringMessage();
        }
        await progressCallback('environment');
    }
}