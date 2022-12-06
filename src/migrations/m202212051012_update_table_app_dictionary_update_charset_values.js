import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202212051012_update_table_app_dictionary_update_charset_values
extends DatabaseMigrationBase {
    /**
     * update
     */
    async up() {
        await this.exec('UPDATE app_dictionary SET `key`="GB2312", `name`="GB2312", `value`="gb2312" WHERE `group`="CHARSET" AND `key`="GB2313"');
    }
}