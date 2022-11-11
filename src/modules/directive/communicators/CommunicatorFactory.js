import BluetoothCommunicator from './bluetooth/Communicator.js'
import SerialPortCommunicator from './serialport/Communicator.js'
import NetworkCommunicator from './network/Communicator.js'
import WebsocketCommunicator from './websocket/Communicator.js'
import HttpCommunicator from './http/Communicator.js'
import MqttCommunicator from './mqtt/Communicator.js'
import ModbusCommunicator from './modbus/Communicator.js'
/**
 * an factory class to generate communicators
 * @author sige
 */
export default class CommunicatorFactory {
    /**
     * get communicaotr by target options
     * @param {Object} target
     */
    static async getCommunicator( target ) {
        let coms = {
            serialport : async (options) => { return await SerialPortCommunicator.setup(options) },
            network : async (options) => { return await NetworkCommunicator.setup(options) },
            bluetooth : async (options) => { return await BluetoothCommunicator.setup(options) },
            websocket : async (options) => { return await WebsocketCommunicator.setup(options) },
            http : async (options) => { return await HttpCommunicator.setup(options) },
            mqtt : async (options) => { return await MqttCommunicator.setup(options) },
            modbus : async (options) => { return await ModbusCommunicator.setup(options) },
        };

        if ( undefined === target.type ) {
            throw Error('communicator target type is not defined.');
        }
        let type = target.type.toLowerCase();
        if ( undefined === coms[type] ) {
            throw Error(`communicator type ${type} is not supported`);
        }
        return coms[type](target);
    }
}