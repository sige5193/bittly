import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205191115_alter_table_directive_entries_change_parent_id_target_to_text
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.alterColumn('app_directive_entries','target', {type:'TEXT',default:''});
        await this.alterColumn('app_directive_entries','parent_id', {type:'TEXT',default:''});
    }
}