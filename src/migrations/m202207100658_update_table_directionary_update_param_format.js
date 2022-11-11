import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202207100658_update_table_directionary_update_param_format
extends DatabaseMigrationBase {
    /**
     * 更新
     */
     async up() {
        await this.exec('UPDATE app_dictionary SET `value`="text" WHERE `group`="DIRECTIVE_PARAM_FORMAT" AND `key`="STRING"');
        await this.exec('UPDATE app_dictionary SET `key`="TEXT" WHERE `group`="DIRECTIVE_PARAM_FORMAT" AND `key`="STRING"');
    }
}