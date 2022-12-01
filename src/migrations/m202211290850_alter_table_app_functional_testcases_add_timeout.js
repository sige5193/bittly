import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202211290850_alter_table_app_functional_testcases_add_timeout
extends DatabaseMigrationBase {
    /**
     * update
     */
    async up() {
        await this.addColumn('app_functional_testcases', 'timeout', {type:'TEXT'});
    }
}