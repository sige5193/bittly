import { v4 as uuidV4 } from 'uuid';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191248_alter_table_testcases_change_id_to_uuid
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.alterColumn('app_testcases', 'directive_id', {type:'TEXT',default:''});
        
        await this.addColumn('app_testcases','uuid', {type:'TEXT',default:''});
        let testcases = await this.query('SELECT id from app_testcases');
        for ( let i=0; i<testcases.length; i++ ) {
            let cid = testcases[i].id;
            let uuid = uuidV4();
            await this.exec('UPDATE app_testcases SET uuid = ? WHERE id= ?', [uuid, cid]);
        }
        await this.dropColumn('app_testcases', 'id');
        await this.renameColumn('app_testcases', 'uuid', 'id');
    }
}