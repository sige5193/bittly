import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205192118_alter_table_project_add_column_source_uuid
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.addColumn('app_projects','source_uuid',{type:'TEXT',default:''});
    }
}