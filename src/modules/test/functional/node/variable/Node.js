import NodeBase from "../NodeBase";
import {LiteGraph} from 'litegraph.js'
/**
 * functional test flow node "variable"
 * the "variable" node read value from input, and execute the 
 * expression and the send the result to output
 */
export default class Node extends NodeBase {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.title = this.$t('name');
        this.inputExec = this.$t('execute');
        this.outputExec = this.$t('execute');
        this.inputName = this.$t('input');
        this.outputName = this.$t('output');

        // setup input and output
        this.addInput(this.inputExec, LiteGraph.ACTION);
        this.addInput(this.inputName, 'string');
        this.addOutput(this.outputExec, LiteGraph.EVENT);
        this.addOutput(this.outputName, 'string');

        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );

        // value viewer
        this.valueWidget = this.addWidget('text',this.$t('value'),'',()=>{},{disabled:true});
        this.valueWidget.disabled = true;

        this.onOptionUpdate();
    }

    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Variable';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            name : this.$t('unnamed'),
            defaultValue : undefined,
            expression : '{{value}}',
        };
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        this.title = this.$t('name') + ' : ' + this.options.name;
        this.valueWidget.value = '';
        this.refresh();
    }

    /**
     * node action handler
     * @returns {void}
     */
    onAction() {
        this.valueWidget.value = '';
        this.refresh();

        let inputValue = this.getInputData(1);
        if ( undefined === inputValue ) {
            inputValue = this.options.defaultValue;
        }

        let value = null;
        if ( 0 != this.options.expression.trim().length ) {
            try {
                let expr = this.options.expression.replaceAll('{{value}}', JSON.stringify(inputValue));
                let exprFunc = Function(`return ${expr};`);
                value = exprFunc.call({});
            } catch ( e ) {
                this.alert('error', this.$t('expressionExecFailed', e.message));
                return ;
            }
        }

        this.valueWidget.value = value;
        this.setOutputData(1, value);
        this.refresh();
        
        this.log(`input = ${inputValue}; output = ${value}`);
        setTimeout(() => this.triggerSlot(0), 1);
    }
}