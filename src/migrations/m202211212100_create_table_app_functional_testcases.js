import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202211212100_create_table_app_functional_testcases
extends DatabaseMigrationBase {
    /**
     * update
     */
    async up() {
        await this.exec(`CREATE TABLE "main"."app_functional_testcases" (
            "id" TEXT NOT NULL,
            "project_id" TEXT,
            "title" TEXT,
            "content" TEXT,
            PRIMARY KEY ("id")
        )`);
    }
}