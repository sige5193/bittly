import { v4 as uuidV4 } from 'uuid';
import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202205190937_alter_table_directives_change_id_to_uuid 
extends DatabaseMigrationBase {
    /**
     * 更新
     */
    async up() {
        await this.addColumn('app_directives','uuid', {type:'TEXT',default:''});
        
        let directives = await this.query('SELECT id from app_directives');
        for ( let i=0; i<directives.length; i++ ) {
            let did = directives[i].id;
            let uuid = uuidV4();
            await this.exec('UPDATE app_directives SET uuid = ? WHERE id= ?', [uuid, did]);
            await this.exec('UPDATE app_directive_entries SET target = ? WHERE type="directive" AND target= ?', [uuid, did]);
            await this.exec(`UPDATE app_testcases SET directive_id = ? WHERE directive_id = ?`,[uuid, did]);
            await this.updatePanels(did, uuid);
        }
        
        await this.dropColumn('app_directives', 'id');
        await this.renameColumn('app_directives', 'uuid', 'id');
    }

    /**
     * 更新面板
     * @param {*} did 
     * @param {*} uuid 
     */
    async updatePanels( did, uuid ) {
        let panels = await this.query(`SELECT id, widgets FROM app_panels`);
        for ( let i=0; i<panels.length; i++ ) {
            let widgets = JSON.parse(panels[i].widgets);
            for ( let wi=0; wi<widgets.length; wi++ ) {
                if ( undefined != widgets[wi].directiveId && did == widgets[wi].directiveId ) {
                    widgets[wi].directiveId = uuid;
                }
            }
            widgets = JSON.stringify(widgets);
            await this.exec(`UPDATE app_panels SET widgets = ? WHERE id = ?`, [widgets, panels[i].id]);
        }
    }
}