import {LiteGraph} from 'litegraph.js'
import NodeBase from '../NodeBase';
import Common from '../../../../../utils/Common.js';
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
        this.addOutput(this.$t('data'),'string');

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
        return 'Read';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            mode : 'lines',
            length : 1,
            timeout : 1000,
        };
    }
    
    /**
     * node action handler
     * @returns {void}
     */
    async onAction() {
        await Common.msleep(this.options.timeout);

        let executor = this.getInputData(1);
        let data = null;
        if ( 'lines' === this.options.mode ) {
            data = this.readLines(executor);
        } else if ( 'bytes' === this.options.mode ) {
            data = this.readBytes(executor);
        }

        this.setOutputData(1, data);
        setTimeout(() => this.triggerSlot(0), 1);
    }

    /**
     * read bytes from executor
     * @param {*} executor 
     * @returns 
     */
    readBytes(executor) {
        let bytes = [];
        let length = this.options.length;
        for ( let i=0; i<length; i++ ) {
            let char = executor.read(1);
            if ( 0 == char.length ) {
                break;
            }
            char = char[0];
            bytes.push(char);
            executor.moveCursor(1);
        }

        return Buffer.from(bytes);
    }

    /**
     * read lines from executor
     * @param {*} executor 
     * @returns 
     */
    readLines(executor) {
        let lines = [];
        let length = this.options.length;
        for ( let i=0; i<length; i++ ) {
            let char = null;
            do {
                char = executor.read(1);
                if ( 0 == char.length ) {
                    break;
                }
                char = char[0];
                lines.push(char);
                executor.moveCursor(1);
            } while (10 != char);
        }

        let textContent = Buffer.from(lines).toString();
        return textContent;
    }
}