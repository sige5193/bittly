import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
import MdbDirectiveEntry from '../models/MdbDirectiveEntry.js'
import MdbProject from '../models/MdbProject.js'
export default class m202205181140_alter_table_directive_folders_add_column_project_uuid 
extends DatabaseMigrationBase {
    /**
     * 
     */
    async up() {
        await this.addColumn('app_directive_folders', 'project_uuid', {type:'TEXT',default:''});

        let folders = await this.query(`SELECT id FROM app_directive_folders WHERE project_uuid=''`);
        for ( let i=0; i<folders.length; i++ ) {
            let entry = await MdbDirectiveEntry.findOne({
                type : 'folder',
                target : folders[i].id
            });
            let project = await MdbProject.findOne(entry.projectId);
            await this.exec(`UPDATE app_directive_folders SET project_uuid = '${project.uuid}' WHERE id = ${folders[i].id}`);
        }

    }
}