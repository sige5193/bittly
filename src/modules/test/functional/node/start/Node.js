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
        this.addOutput(this.$t('execute'), LiteGraph.EVENT);
        this.size = [80,30];
    }
    
    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Start';
    }

    /**
     * execute this node
     * @overide
     */
    start () {
        this.log(`start functional flow`);
        this.triggerSlot(0);
    }
}