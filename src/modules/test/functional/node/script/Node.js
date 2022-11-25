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

        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );
    }
    
    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Script';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            inputs : [],
            outputs : [],
            script : '',
        };
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        this.updateDataPinsByNameList('input', this.options.inputs);
        this.updateDataPinsByNameList('output', this.options.outputs);
        this.refresh();
    }
    
    /**
     * node action handler
     * @returns {void}
     */
    async onAction() {
        this.log('start');
        
        try {
            let scriptContent = this.options.script;
            let func = new Function('$this' , scriptContent);
            func(this);
            setTimeout(() => this.triggerSlot(0), 1);
        } catch ( e ) {
            this.alert('error', this.$t('expressionExecFailed', e.message));
            return ;
        }
    }
}