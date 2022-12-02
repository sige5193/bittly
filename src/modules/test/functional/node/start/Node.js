import {LGraph, LiteGraph} from 'litegraph.js'
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
     * envet callback before node added. return false to break the addition.
     * @param {LGraph} graph
     * @returns {Boolean}
     */
    beforeAdded(graph) {
        for ( let i=0; i<graph._nodes.length; i++ ) {
            let node = graph._nodes[i];
            if ( node instanceof Node ) {
                this.alert('info', this.$t('alreadyExists'));
                return false;
            }
        }
        return true;
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