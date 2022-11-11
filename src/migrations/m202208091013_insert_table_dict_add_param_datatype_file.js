import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202208091013_insert_table_dict_add_param_datatype_file
extends DatabaseMigrationBase {
    /**
     * update
     */
     async up() {
        await this.exec(`
          INSERT INTO "app_dictionary" VALUES (
            null, 
            'DIRECTIVE_PARAM_DATATYPE', 
            '指令请求参数类型', 
            'FILE', 
            '文件', 
            'file', 
            '{}'
          )`
        );
    }
}