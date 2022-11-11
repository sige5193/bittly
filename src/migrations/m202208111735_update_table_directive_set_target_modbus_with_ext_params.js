import DatabaseMigrationBase from "../utils/database/MigrationBase.js"
export default class m202208111735_update_table_directive_set_target_modbus_with_ext_params
extends DatabaseMigrationBase {
    /**
     * update
     */
     async up() {
        let data = await this.query('SELECT id,target FROM app_directives');
        for ( let i=0; i<data.length; i++ ) {
            let target = JSON.parse(data[i].target);
            if ( 'Modbus' != target.type ) {
                continue;
            }
            target.modbusDataBits = "8";
            target.modbusStopBits = "1";
            target.modbusParity = "none";
            target = JSON.stringify(target);
            await this.exec('UPDATE app_directives SET target= ? WHERE id = ?', [target, data[i].id]);
        }
    }
}