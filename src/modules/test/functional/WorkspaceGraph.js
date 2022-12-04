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
        /**
         * @property {Boolean}
         */
        this.isBatchMode = false;
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
        let $this = this;
        return new Promise((resolve, reject) => {
            $this.execStartNodeResolve = resolve;
            $this.execStartNodeReject = reject;
            startNode.start();
        });
    }

    /**
     * execute nodes
     */
    async run(timeout) {
        let startNode = null;
        let nodes = this.computeExecutionOrder(false);
        for ( let i=0; i<nodes.length; i++ ) {
            let node = nodes[i];
            if ( !(node instanceof NodeStart) ) {
                continue ;
            }
            startNode = node;
            break;
        }
        
        if ( null === startNode ) {
            throw Error(window.app.$t('test.functional.startNodeRequired'));
        }

        this.timeout = timeout;
        this.execError = null;
        this.execStartNodeReject = null;
        this.execStartNodeResolve = null;
        this.execTimeoutTimer = setTimeout(()=>this.runTimeout(), timeout);
        await this.executeStartNode(startNode);
    }

    runTimeout() {
        if ( null === this.execTimeoutTimer ) {
            return ;
        }
        this.error(window.app.$t('test.functional.executeTimeout',[this.timeout]));
    }

    error(error) {
        clearTimeout(this.execTimeoutTimer);
        this.execError = {message:error};
        if ( 'object' === typeof(error) ) {
            this.execError = error;
        }
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