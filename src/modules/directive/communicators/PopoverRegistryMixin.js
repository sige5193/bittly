import BluetoothPopover from './bluetooth/Popover.vue'
import NetworkPopover from './network/Popover.vue'
import SerialPortPopover from './serialport/Popover.vue'
import WebsocketPopover from './websocket/Popover.vue'
import MqttPopover from './mqtt/Popover.vue'
import ModbusPopover from './modbus/Popover.vue'
/**
 * Popover Registr Mixin
 * @author sige
 */
export default {
    /**
     * 
     */
    components : {
        'device-popover-serialport' : SerialPortPopover,
        'device-popover-network' : NetworkPopover,
        'device-popover-bluetooth' : BluetoothPopover,
        'device-popover-websocket' : WebsocketPopover,
        'device-popover-mqtt' : MqttPopover,
        'device-popover-modbus' : ModbusPopover,
    },
};