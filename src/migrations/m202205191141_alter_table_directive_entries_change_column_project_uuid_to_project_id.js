import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191141_alter_table_directive_entries_change_column_project_uuid_to_project_id
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.dropColumn('app_directive_entries','project_id');
        await this.renameColumn('app_directive_entries','project_uuid', 'project_id');
    }
}