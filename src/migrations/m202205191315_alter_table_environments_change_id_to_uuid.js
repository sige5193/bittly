import { v4 as uuidV4 } from 'uuid';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191315_alter_table_environments_change_id_to_uuid 
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.addColumn('app_environments','uuid', {type:'TEXT',default:''});
        let envs = await this.query('SELECT id from app_environments');
        for ( let i=0; i<envs.length; i++ ) {
            let eid = envs[i].id;
            let uuid = uuidV4();
            await this.exec('UPDATE app_environments SET uuid = ? WHERE id= ?', [uuid, eid]);
        }
        await this.dropColumn('app_environments', 'id');
        await this.renameColumn('app_environments', 'uuid', 'id');
    }
}