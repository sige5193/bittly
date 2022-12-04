import {LiteGraph} from 'litegraph.js'
import NodeBase from '../NodeBase';
import Common from '../../../../../utils/Common.js';
import DirectiveExecutor from '../../../../directive/Executor.js'
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
        this.addInput(this.$t('executor'), 'string');
        this.addOutput(this.$t('execute'), LiteGraph.EVENT);
        this.addOutput(this.$t('executor'), 'string');

        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );

        this.onOptionUpdate();
    }
    
    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Write';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            title : '',
            mode : 'text',
            content : '',
        };
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        this.title = `${this.$t('name')} : ${this.options.title}`;
        this.refresh();
    }
    
    /**
     * execute node action
     * @override
     */
    async action() {
        let data = this.options.content;
        if ( 'hex' === this.options.mode ) {
            data = Common.convertStringToHex(this.options.content);
        }
        data = Buffer.from(data);

        let executor = this.getInputData(1);
        if ( ! ( executor instanceof DirectiveExecutor) ) {
            throw Error(this.$t('executorNotAvailable'));
        }
        await executor.write(data);
        this.setOutputData(1, executor);
        this.triggerSlot(0);
    }
}