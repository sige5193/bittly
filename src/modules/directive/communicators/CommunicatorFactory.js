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
     * @property {CommunicatorFactory}
     */
    static factory = null;
    
    /**
     * get communicaotr by target options
     * @param {Object} target
     */
    static async getCommunicator( target ) {
        if ( null === CommunicatorFactory.factory ) {
            CommunicatorFactory.factory = new CommunicatorFactory();
        }
        return CommunicatorFactory.factory.getCommunicatorByTarget(target);
    }

    /**
     * @constructor
     */
    constructor() {
        this.coms = {
            serialport : async (options) => { return await SerialPortCommunicator.setup(options) },
            network : async (options) => { return await NetworkCommunicator.setup(options) },
            bluetooth : async (options) => { return await BluetoothCommunicator.setup(options) },
            websocket : async (options) => { return await WebsocketCommunicator.setup(options) },
            http : async (options) => { return await HttpCommunicator.setup(options) },
            mqtt : async (options) => { return await MqttCommunicator.setup(options) },
            modbus : async (options) => { return await ModbusCommunicator.setup(options) },
        };
        window.app.$eventBus.$emit('app-communicator-factory-init', this);
    }

    /**
     * @param {*} name 
     * @returns {Function}
     */
    getCommunicatorByTarget( target ) {
        if ( undefined === target.type ) {
            throw Error('communicator target type is not defined.');
        }
        let type = target.type.toLowerCase();
        if ( undefined === this.coms[type] ) {
            throw Error(`communicator type ${type} is not supported`);
        }
        return this.coms[type](target);
    }

    /**
     * register new communicator getter.
     * @param {*} name 
     * @param {*} getter 
     */
    communicatorGetterRegister( name, getter ) {
        this.coms[name] = getter;
    }
}