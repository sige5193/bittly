import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191207_alter_table_project_change_uuid_to_id 
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.dropColumn('app_projects', 'id');
        await this.renameColumn('app_projects', 'uuid', 'id');
    }
}