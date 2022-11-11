import { v4 as uuidV4 } from 'uuid';
import { NIL as NIL_UUID } from 'uuid';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191047_alter_table_directive_entries_change_id_to_uuid 
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.addColumn('app_directive_entries','uuid', {type:'TEXT',default:''});
        
        let entries = await this.query('SELECT id from app_directive_entries');
        for ( let i=0; i<entries.length; i++ ) {
            let eid = entries[i].id;
            let uuid = uuidV4();
            await this.exec('UPDATE app_directive_entries SET uuid = ? WHERE id= ?', [uuid, eid]);
            await this.exec('UPDATE app_directive_entries SET parent_id = ? WHERE parent_id = ?', [uuid, eid]);
        }
        await this.exec('UPDATE app_directive_entries SET parent_id = ? WHERE parent_id = 0', [NIL_UUID]);

        await this.dropColumn('app_directive_entries', 'id');
        await this.renameColumn('app_directive_entries', 'uuid', 'id');
    }
}