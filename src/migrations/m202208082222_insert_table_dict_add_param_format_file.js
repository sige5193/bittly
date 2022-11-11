import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202208082222_insert_table_dict_add_param_format_file
extends DatabaseMigrationBase {
    /**
     * update
     */
     async up() {
        await this.exec(`
          INSERT INTO "app_dictionary" VALUES (
            null, 'DIRECTIVE_PARAM_FORMAT', 
            '指令请求参数格式', 'FILE', '文件', 'file', '{}'
          )`
        );
    }
}