import { v4 as uuidV4 } from 'uuid';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191311_alter_table_panels_change_id_to_uuid
extends DatabaseMigrationBase {
    /**
     * 
     */
    async up() {
        await this.addColumn('app_panels','uuid', {type:'TEXT',default:''});
        let panels = await this.query('SELECT id from app_panels');
        for ( let i=0; i<panels.length; i++ ) {
            let pid = panels[i].id;
            let uuid = uuidV4();
            await this.exec('UPDATE app_panels SET uuid = ? WHERE id= ?', [uuid, pid]);
        }
        await this.dropColumn('app_panels', 'id');
        await this.renameColumn('app_panels', 'uuid', 'id');
    }
}