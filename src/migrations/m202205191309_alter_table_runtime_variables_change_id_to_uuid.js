import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191309_alter_table_runtime_variables_change_id_to_uuid
extends DatabaseMigrationBase {
    async up () {
        await this.exec('DELETE FROM app_runtime_variables');
        await this.alterColumn('app_runtime_variables','project_id', {type:'TEXT',default:''});
        await this.dropColumn('app_runtime_variables','id');
        await this.addColumn('app_runtime_variables','id', {type:'TEXT',default:''});
    }
}