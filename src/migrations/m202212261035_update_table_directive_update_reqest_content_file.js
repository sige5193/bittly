import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202212261035_update_table_directive_update_reqest_content_file
extends DatabaseMigrationBase {
    /**
     * update
     */
    async up() {
        let directives = await this.query('SELECT * FROM app_directives');
        for ( let i=0; i<directives.length; i++ ) {
            let content = JSON.parse(directives[i].request_content);
            if ( 'string' !== typeof(content.file) ) {
                continue;
            }

            delete content.file;
            await this.exec(`UPDATE app_directives SET request_content=? WHERE id="${directives[i].id}"`,[
                JSON.stringify(content)
            ]);
        }
    }
}