import MdbDirectiveEntry from '../models/MdbDirectiveEntry';
import MdbProject from '../models/MdbProject';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205181052_alter_table_directive_entries_add_column_project_uuid extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.addColumn('app_directive_entries', 'project_uuid', {type:'TEXT',default:''});

        let entries = await MdbDirectiveEntry.findAll({'project_uuid':''});
        for ( let i=0; i<entries.length; i++ ) {
            let project = await MdbProject.findOne(entries[i].projectId);
            entries[i].projectUuid = project.uuid;
            await entries[i].save();
            this.log(`UPDATE directive_entries SET project_uuid = ${project.uuid} WHERE id=${entries[i].id}`);
        }
    }
}