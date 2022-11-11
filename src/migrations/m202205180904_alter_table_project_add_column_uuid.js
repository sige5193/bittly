import { v4 as uuidV4 } from 'uuid';
import MdbProject from '../models/MdbProject.js';
import MigrationBase from '../utils/database/MigrationBase.js'
export default class m202205180904_alter_table_project_add_column_uuid extends MigrationBase {
    /**
     * 更新数据库
     */
    async up() {
        await this.addColumn('app_projects', 'uuid', {type:'TEXT', default:''});
        let projects = await this.query(`SELECT id FROM app_projects WHERE uuid = ''`);
        for ( let i=0; i<projects.length; i++ ) {
            await this.exec('UPDATE app_projects SET uuid = ? WHERE id = ?', [uuidV4(), projects[i].id]);
        }
    }
}