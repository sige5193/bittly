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
        /**
         * @property {Number}
         */
        this.execTimeoutTimer = null;
        /**
         * @property {Object|null}
         */
        this.execError = null;
        /**
         * @property {Number}
         */
        this.timeout = 0;
    }

    /**
     * add node to graph
     * @override
     * @param {*} node 
     * @param {*} skip_compute_order 
     */
    add(node, skip_compute_order) {
        if ( node.beforeAdded && !node.beforeAdded(this)) {
            return ;
        }
        super.add(node, skip_compute_order);
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
    async run(timeout) {
        this.timeout = timeout;
        this.execError = null;
        this.execStartNodeReject = null;
        this.execStartNodeResolve = null;
        let nodes = this.computeExecutionOrder(false);
        this.execTimeoutTimer = setTimeout(()=>this.runTimeout(), timeout);
        for ( let i=0; i<nodes.length; i++ ) {
            let node = nodes[i];
            if ( !(node instanceof NodeStart) ) {
                continue ;
            }
            await this.executeStartNode(node);
        }
    }

    runTimeout() {
        if ( null === this.execTimeoutTimer ) {
            return ;
        }
        this.error(window.app.$t('test.functional.executeTimeout',[this.timeout]));
    }

    error(message) {
        clearTimeout(this.execTimeoutTimer);
        this.execError = {message};
        this.execStartNodeReject(this.execError);
    }

    /**
     * done executing
     */
    done() {
        clearTimeout(this.execTimeoutTimer);
        this.execTimeoutTimer = null;
        this.execStartNodeResolve();
    }
}