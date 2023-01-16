import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202301161807_update_table_app_mocks_add_column_summary
extends DatabaseMigrationBase {
    /**
     * update
     */
    async up() {
        await this.addColumn('app_mocks','summary',{type:'TEXT',default:''});
    }
}