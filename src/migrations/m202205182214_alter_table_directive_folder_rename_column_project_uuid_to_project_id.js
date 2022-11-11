import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205182214_alter_table_directive_folder_rename_column_project_uuid_to_project_id extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.renameColumn('app_directive_folders', 'project_uuid', 'project_id');
    }
}