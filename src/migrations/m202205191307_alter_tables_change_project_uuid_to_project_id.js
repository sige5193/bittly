import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191307_alter_tables_change_project_uuid_to_project_id
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.dropColumn('app_environments', 'project_id');
        await this.renameColumn('app_environments', 'project_uuid', 'project_id');

        await this.dropColumn('app_panels', 'project_id');
        await this.renameColumn('app_panels', 'project_uuid', 'project_id');

        await this.renameColumn('app_testcases','project_uuid', 'project_id');
    }
}