import NodeBase from "../NodeBase";
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
        this.inputName = this.$t('input');
        this.outputName = this.$t('output');

        // setup input and output
        this.addInput(this.inputName, 'string');
        this.addOutput(this.outputName, 'string');

        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.btnDirectiveSelect = this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );

        // value viewer
        this.valueWidget = this.addWidget('text',this.$t('value'),'',()=>{},{disabled:true});
        this.valueWidget.disabled = true;
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
            expression : '',
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
     * execute the node
     */
    async executeAction () {
        this.valueWidget.value = '';
        this.refresh();

        let value = this.getInputDataByName(this.inputName);
        if ( undefined === value ) {
            value = this.options.defaultValue;
        }

        if ( 0 != this.options.expression.trim().length ) {
            try {
                let expr = this.options.expression.replaceAll('{{value}}', value);
                let exprFunc = Function(`return ${expr};`);
                value = exprFunc.call({});
            } catch ( e ) {
                this.alert('error', this.$t('expressionExecFailed', e.message));
                return ;
            }
        }

        this.valueWidget.value = value;
        this.setOutputDataByName(this.outputName, value);
        this.refresh();
    }
}