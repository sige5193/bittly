import {LGraphNode, LiteGraph} from 'litegraph.js'
import MyObject from '../../../../utils/datatype/MyObject.js'
export default class NodeBase extends LGraphNode {
    /**
     * @constructor
     */
    constructor() {
        super();
        /**
         * options of this nodes to execute
         * @property {Object}
         */
        this.options = this.getInitOptions();
        this.addProperty('options', JSON.stringify(this.options), 'object');
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {};
    }

    /**
     * setup node by given config information 
     * @override
     * @param {Object} info 
     */
    configure( info ) {
        super.configure(info);
        this.options = JSON.parse(info.properties.options);
        this.onOptionUpdate();
    }

    /**
     * translate message to current language
     * @param {String} message 
     * @returns {String}
     */
    $t( ... args ) {
        let type = this.getTypeName();
        args[0] = `test.functionalNode.${type}.${args[0]}`;
        return window.app.$t(... args);
    }

    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return null;
    }

    /**
     * set output data by given name
     * @param {*} name 
     * @param {*} data 
     */
    setOutputDataByName( name, data ) {
        for ( let i=0; i<this.outputs.length; i++ ) {
            if ( name === this.outputs[i].name ) {
                this.setOutputData(i, data);
            }
        }
    }

    /**
     * get option object
     * @returns {Object}
     */
    getOptions() {
        return MyObject.copy(this.options);
    }

    /**
     * set options to node
     * @param {Object} options 
     */
    setOptions( options ) {
        this.options = MyObject.copy(options);
        this.properties.options = JSON.stringify(options);
        this.onOptionUpdate();
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        return ;
    }

    /**
     * refresh the node
     */
    refresh() {
        this.graph.list_of_graphcanvas[0].drawFrontCanvas();
    }

    /**
     * display notive message
     * @param {String} type 
     * @param {String} message 
     */
    alert(type, message) {
        window.app.$message[type](message);
    }

    /**
     * log message to console
     * @param  {...any} message 
     */
    log(... message) {
        message.unshift(`> [${this.title}] :`);
        console.log(message.join(' '));
    }

    /**
     * check whether input name exists.
     * @param {String} name 
     * @returns {Boolean}
     */
    hasInputName( name ) {
        for ( let i=0; i<this.inputs.length; i++ ) {
            if ( this.inputs[i].name === name ) {
                return true;
            }
        }
        return false;
    }

    /**
     * check whether output name exists.
     * @param {String} name 
     * @returns {Boolean}
     */
    hasOutputName( name ) {
        for ( let i=0; i<this.outputs.length; i++ ) {
            if ( this.outputs[i].name === name ) {
                return true;
            }
        }
        return false;
    }

    /**
     * update data pin list by given name list.
     * @param {String} type 
     * @param {Array<String>} names 
     */
    updateDataPinsByNameList(type, names) {
        let handlerMap = {
            input : {data:'inputs',remove:'removeInput',add:'addInput'},
            output : {data:'outputs',remove:'removeOutput',add:'addOutput'},
        };

        let pins = this[handlerMap[type].data];
        let newNames = MyObject.copy(names);
        let index = 0;
        while ( index < pins.length ) {
            let pin = pins[index];
            if ( LiteGraph.EVENT == pin.type || !pin.isCustom ) {
                index ++;
                continue;
            }

            let newNameIndex = newNames.indexOf(pin.name);
            if ( -1 === newNameIndex ) {
                this[handlerMap[type].remove](index);
            } else {
                newNames.splice(newNameIndex, 1);
                index ++;
            }
        }

        for ( let i=0; i<newNames.length; i++ ) {
            this[handlerMap[type].add](newNames[i], 'string', {isCustom:true});
        }
    }
}