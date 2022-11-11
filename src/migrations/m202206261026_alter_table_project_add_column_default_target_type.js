import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202206261026_alter_table_project_add_column_default_target_type
extends DatabaseMigrationBase {
    /**
     * 更新
     */
     async up() {
        await this.addColumn('app_projects','default_target_type',{type:'TEXT',default:'SerialPort'});
        await this.exec(`UPDATE app_projects SET default_target_type = "SerialPort"`);
    }
}