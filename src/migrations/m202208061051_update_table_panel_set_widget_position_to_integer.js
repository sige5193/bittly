import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202208061051_update_table_panel_set_widget_position_to_integer
extends DatabaseMigrationBase {
    /**
     * update
     */
     async up() {
        let data = await this.query('SELECT id,widgets FROM app_panels');
        for ( let i=0; i<data.length; i++ ) {
            let widgets = JSON.parse(data[i].widgets);
            for ( let wi=0; wi<widgets.length; wi++ ) {
                widgets[wi].pos.x = Math.floor(widgets[wi].pos.x.replace('px','')*1);
                widgets[wi].pos.y = Math.floor(widgets[wi].pos.y.replace('px','')*1);
            }
            widgets = JSON.stringify(widgets);
            await this.exec('UPDATE app_panels SET widgets= ? WHERE id = ?', [widgets, data[i].id]);
        }
    }
}