import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
import MdbEnvironment from '../models/MdbEnvironment.js'
import MdbProject from '../models/MdbProject.js'
export default class m202205181334_alter_table_environments_add_column_project_uuid extends DatabaseMigrationBase {
    /**
     * 
     */
    async up() {
        await this.addColumn('app_environments', 'project_uuid', {type:'TEXT',default:''});

        let envs = await MdbEnvironment.findAll({project_uuid:''});
        for ( let i=0; i<envs.length; i++ ) {
            let project = await MdbProject.findOne(envs[i].projectId);
            envs[i].projectUuid = project.uuid;
            await envs[i].save();
            this.log(`UPDATE app_environments SET project_uuid = ${envs[i].uuid} WHERE id=${envs[i].id}`);
        }
    }
}