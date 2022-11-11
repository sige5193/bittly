import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202206161012_alter_table_project_add_column_script
extends DatabaseMigrationBase {
    /**
     * 更新
     */
     async up() {
        await this.addColumn('app_projects','script',{type:'TEXT',default:''});
    }
}