import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202212081217_insert_table_dict_add_param_datatype_bits
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
                'BITS', 
                '位组(bits)', 
                'bits', 
                '{"unsigned":true,"length":0,"formatable":true}'
            )`
        );
    }
}