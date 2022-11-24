import NodeBase from './NodeBase';
/**
 * The node use to start the flow
 */
export default class NodeStart extends NodeBase{
    /**
     * @property {integer}
     */
    static OUTPUT_EXEC = 0;

    /**
     * @constructor
     */
    constructor() {
        super();
        this.title = this.$t('functionalFlowNodeStart');
        this.addOutput(this.$t('functionalFlowNodeOutputExecute'), 'boolean');
        this.size = [80,30];
    }
    
    /**
     * execute this node
     * @overide
     */
    executeAction () {
        this.setOutputData(NodeStart.OUTPUT_EXEC, true);
    }
}