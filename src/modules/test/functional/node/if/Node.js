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
        this.addOutput(this.$t('true'), LiteGraph.EVENT);
        this.addOutput(this.$t('false'), LiteGraph.EVENT);
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
        return 'If';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            title : '',
            inputs : [],
            expression : '',
        };
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        if ( 0 !== this.options.title.trim().length ) {
            this.title = `${this.$t('name')} : ${this.options.title}`;
        }
        this.updateDataPinsByNameList('input', this.options.inputs);
        this.refresh();
    }
    
    /**
     * node action handler
     * @returns {void}
     */
    async onAction() {
        this.log('start');
        
        let expression = this.options.expression;
        let regex = /\{\{(?<input>.*?)\}\}/gm;
        let match = null;
        while ((match = regex.exec(expression)) !== null) {
            let inputName = match.groups.input;
            let inputValue = this.getInputDataByName(inputName);
            expression = expression.replaceAll(match[0], JSON.stringify(inputValue));
        }

        let value = null;
        try {
            let exprFunc = Function(`return ${expression};`);
            value = exprFunc.call({});
        } catch ( e ) {
            this.alert('error', this.$t('expressionExecFailed', e.message));
            return ;
        }

        if ( value ) {
            setTimeout(() => this.triggerSlot(0), 1);
        } else {
            setTimeout(() => this.triggerSlot(1), 1);
        }
    }
}