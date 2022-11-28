import {LGraph} from 'litegraph.js'
import NodeStart from './node/start/Node.js'
export default class WorkspaceGraph extends LGraph {
    /**
     * @constructor
     */
    constructor() {
        super();
        /**
         * @property {Function}
         */
        this.execStartNodeResolve = null;
        /**
         * @property {Function}
         */
        this.execStartNodeReject = null;
    }

    /**
     * update node context menu
     * @param {*} options 
     * @param {*} node 
     */
    onGetNodeMenuOptions(options, node) {
        let items = {};
        for ( let i=0; i<options.length; i++ ) {
            if ( null === options[i] ) {
                continue;
            }
            items[options[i].content] = options[i];
        }
        
        options.splice(0, options.length);
        items.Inputs.content = window.app.$t('test.functional.contextMenuInput');
        options.push(items.Inputs);
        items.Outputs.content = window.app.$t('test.functional.contextMenuOutput');
        options.push(items.Outputs);
        options.push(null);
        items.Remove.content = window.app.$t('test.functional.contextMenuRemove');
        options.push(items.Remove);
    }

    /**
     * execute start node
     * @param {*} startNode 
     * @returns {Promise}
     */
    executeStartNode( startNode ) {
        return new Promise((resolve, reject) => {
            this.execStartNodeResolve = resolve;
            this.execStartNodeReject = reject;
            startNode.start();
        });
    }

    /**
     * execute nodes
     */
    async run() {
        this.execStartNodeReject = null;
        this.execStartNodeResolve = null;
        let nodes = this.computeExecutionOrder(false);
        for ( let i=0; i<nodes.length; i++ ) {
            let node = nodes[i];
            if ( !(node instanceof NodeStart) ) {
                continue ;
            }
            await this.executeStartNode(node);
        }
    }
}