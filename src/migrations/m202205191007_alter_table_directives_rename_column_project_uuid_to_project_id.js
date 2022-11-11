import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191007_alter_table_directives_rename_column_project_uuid_to_project_id 
extends DatabaseMigrationBase {
    /**
     * 更新
     */
     async up() {
        await this.renameColumn('app_directives', 'project_uuid', 'project_id');
    }
}