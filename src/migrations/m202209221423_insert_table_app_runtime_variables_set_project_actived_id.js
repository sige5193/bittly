import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202209221423_insert_table_app_runtime_variables_set_project_actived_id
extends DatabaseMigrationBase {
    /**
     * update
     */
     async up() {
        let projectActivedId = await this.query('SELECT * FROM app_runtime_variables WHERE `key`="project_actived_id"');
        if ( 0 < projectActivedId.length ) {
            return ;
        }

        let projects = await this.query('SELECT * FROM app_projects LIMIT 1');
        await this.exec(`INSERT INTO "app_runtime_variables" ("key", "value", "project_id", "id") VALUES ('project_actived_id', '${projects[0].id}', '', '9a797e5a-0000-4479-8953-cdcecd0ba503')`);
    }
}