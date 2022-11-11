import MdbDirective from '../models/MdbDirective.js'
import MdbDirectiveEntry from '../models/MdbDirectiveEntry.js'
import MdbProject from '../models/MdbProject.js'
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205181025_alter_table_directives_add_column_project_uuid extends DatabaseMigrationBase {
    /**
     * 
     */
    async up() {
        await this.addColumn('app_directives', 'project_uuid', {type:'TEXT',default:''});
        
        let directives = await MdbDirective.findAll({project_uuid:''});
        for ( let i=0; i<directives.length; i++ ) {
            let entry = await MdbDirectiveEntry.findOne({
                type : 'directive',
                target : directives[i].id
            });
            let project = await MdbProject.findOne(entry.projectId);
            directives[i].projectUuid = project.uuid;
            await directives[i].save();
            this.log(`UPDATE directive SET project_uuid = ${project.uuid} WHERE id=${directives[i].id}`);
        }
    }
}