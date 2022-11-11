import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202207181036_update_table_directive_change_parameter_format_from_string_to_text
extends DatabaseMigrationBase {
    /**
     * 更新
     */
     async up() {
        let data = await this.query('SELECT id,request_content FROM app_directives WHERE request_format = "string"');
        for ( let i=0; i<data.length; i++ ) {
            let content = JSON.parse(data[i].request_content);
            content.text = content.string;
            content = JSON.stringify(content);
            await this.exec('UPDATE app_directives SET request_content= ?, request_format = "text" WHERE id = ?', [content, data[i].id]);
        }
    }
}