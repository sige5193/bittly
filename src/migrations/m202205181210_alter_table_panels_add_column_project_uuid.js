import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
import MdbPanel from '../models/MdbPanel.js'
import MdbProject from '../models/MdbProject';
export default class m202205181210_alter_table_panels_add_column_project_uuid extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.addColumn('app_panels', 'project_uuid', {type:'TEXT', default:''});

        let panels = await MdbPanel.findAll({project_uuid:''});
        for ( let i=0; i<panels.length; i++ ) {
            let project = await MdbProject.findOne(panels[i].projectId);
            panels[i].projectUuid = project.uuid;
            await panels[i].save();
            this.log(`UPDATE panels  SET project_uuid = ${panels[i].uuid} WHERE id=${panels[i].id}`);
        }
    }
}