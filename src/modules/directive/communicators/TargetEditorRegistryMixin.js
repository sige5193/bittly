import BluetoothTargetEditor from './bluetooth/TargetEditor.vue'
import SerialPortTargetEditor from './serialport/TargetEditor.vue'
import NetworkTargetEditor from './network/TargetEditor.vue'
import WebsocketTargetEditor from './websocket/TargetEditor.vue'
import HttpTargetEditor from './http/TargetEditor.vue'
import MqttTargetEditor from './mqtt/TargetEditor.vue'
import ModbusTargetEditor from './modbus/TargetEditor.vue'
export default {
    /**
     * componments list
     */
    components : {
        'target-Network' : NetworkTargetEditor,
        'target-SerialPort' : SerialPortTargetEditor,
        'target-Bluetooth' : BluetoothTargetEditor,
        'target-Websocket' : WebsocketTargetEditor,
        'target-Http' : HttpTargetEditor,
        'target-Mqtt' : MqttTargetEditor,
        'target-Modbus' : ModbusTargetEditor
    },
    data() {
        return {
            targetEditors : {
                SerialPort : SerialPortTargetEditor.editorConfig(),
                Network    : NetworkTargetEditor.editorConfig(),
                Bluetooth  : BluetoothTargetEditor.editorConfig(),
                Websocket  : WebsocketTargetEditor.editorConfig(),
                Http       : HttpTargetEditor.editorConfig(),
                Mqtt       : MqttTargetEditor.editorConfig(),
                Modbus     : ModbusTargetEditor.editorConfig(),
            },
        };
    },
    methods : {
        /**
         * register communicator target editor
         * @public
         * @param {Object} editor
         * @param {Class} elemClass
         */
        customEditorRegister( editor, elemClass ) {
            this.targetEditors[editor.name] = editor;
            editor.isCustom = true;
            let elemName = `directive-target-editor-${editor.name}`;
            if ( undefined === window.customElements.get(elemName) ) {
                window.customElements.define(elemName, elemClass);
            }
        },
    },
};