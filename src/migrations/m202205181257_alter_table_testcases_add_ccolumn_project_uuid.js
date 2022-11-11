import MdbTestcase from '../models/MdbTestcase.js'
import MdbProject from '../models/MdbProject';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
import MdbDirective from '../models/MdbDirective';
export default class m202205181257_alter_table_testcases_add_ccolumn_project_uuid extends DatabaseMigrationBase {
    /**
     * 
     */
    async up() {
        await this.addColumn('app_testcases','project_uuid', {type:'TEXT',default:''});

        let testcases = await MdbTestcase.findAll({project_uuid:''});
        for ( let i=0; i<testcases.length; i++ ) {
            let directive = await MdbDirective.findOne(testcases[i].directiveId);
            if ( null == directive ) {
                continue;
            }
            let project = await MdbProject.findOne({uuid:directive.projectUuid});
            testcases[i].projectUuid = project.uuid;
            await testcases[i].save();
            this.log(`UPDATE testcases  SET project_uuid = ${testcases[i].projectUuid} WHERE id=${testcases[i].id}`);
        }
    }
}