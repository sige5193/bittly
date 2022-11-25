import {LiteGraph} from 'litegraph.js'
import NodeBase from '../NodeBase';
/**
 * The node use to start the flow
 */
export default class Node extends NodeBase{
    /**
     * @constructor
     */
    constructor() {
        super();
        this.title = this.$t('name');
        this.addInput(this.$t('execute'), LiteGraph.EVENT);
        this.addOutput(this.$t('execute'), LiteGraph.EVENT);
        this.size = [120,30];
    }
    
    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'ActHub';
    }

    /**
     * get input pins
     * @override
     * @returns {Array<[]>}
     */
    onGetInputs() {
        return [
            [this.$t('execute'), LiteGraph.EVENT]
        ];
    }
    
    /**
     * node action handler
     * @returns {void}
     */
    onAction() {
        this.log('execute');
        setTimeout(() => this.triggerSlot(0), 1);
    }
}