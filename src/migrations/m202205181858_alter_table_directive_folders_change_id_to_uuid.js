import { v4 as uuidV4 } from 'uuid';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205181858_alter_table_directive_folders_change_id_to_uuid extends DatabaseMigrationBase {
    /**
     * 将指令文件夹 id 由 整型 调整到 uuid
     */
    async up() {
        await this.addColumn('app_directive_folders','uuid', {type:'TEXT',default:''});
        
        let folders = await this.query('SELECT id from app_directive_folders');
        for ( let i=0; i<folders.length; i++ ) {
            let fid = folders[i].id;
            let uuid = uuidV4();
            await this.exec('UPDATE app_directive_folders SET uuid = ? WHERE id= ?', [uuid, fid]);
            await this.exec('UPDATE app_directive_entries SET target = ? WHERE type="folder" AND target= ?', [uuid, fid]);
        }
        
        await this.dropColumn('app_directive_folders', 'id');
        await this.renameColumn('app_directive_folders', 'uuid', 'id');
    }
}