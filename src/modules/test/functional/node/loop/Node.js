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
        this.counter = null;

        // setup input and output
        this.addInput(this.$t('execute'), LiteGraph.ACTION);
        this.addInput(this.$t('next'), LiteGraph.EVENT);
        this.addInput(this.$t('count'), 'string');
        this.addOutput(this.$t('done'), LiteGraph.EVENT);
        this.addOutput(this.$t('execute'), LiteGraph.EVENT);
        this.addOutput(this.$t('index'), 'string');

        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.addWidget(
            'button',
            this.$t('setting'),
            null, 
            () => this.onBtnSettingClicked(this)
        );

        // value viewer
        this.counterWidget = this.addWidget('text',this.$t('count'),'',()=>{},{disabled:true});
        this.counterWidget.disabled = true;
    }

    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Loop';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            count : 5,
        };
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        this.counterWidget.value = this.options.count;
        this.refresh();
    }

    /**
     * node action handler
     * @returns {void}
     */
    onAction() {
        debugger
        if ( null === this.counter ) {
            this.counter = this.getInputData(2);
            if ( undefined === this.counter ) {
                this.counter = this.options.count;
            }
        }

        if ( 0 <= this.counter ) {
            this.counter --;
            this.counterWidget.value = this.counter;
            this.log(`counter = ${this.counter}`);
            this.refresh();
            setTimeout(() => this.triggerSlot(1), 1);
        } else {
            this.counter = null;
            setTimeout(() => this.triggerSlot(0), 1);
        }
    }
}