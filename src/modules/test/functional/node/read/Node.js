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

        this.onOptionUpdate();
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
            title : this.$t('unnamed'),
            mode : 'AllChars',
            length : 1,
            timeout : 1000,
        };
    }
    
    /**
     * handler on option updated
     */
    onOptionUpdate() {
        this.title = `${this.$t('name')} : ${this.$t('unnamed')}`;
        this.refresh();
    }

    /**
     * execute node action
     * @override
     */
    async action() {
        await Common.msleep(this.options.timeout);
        
        debugger
        let executor = this.getInputData(1);
        if ( ! ( executor instanceof DirectiveExecutor) ) {
            throw Error(this.$t('executorNotAvailable'));
        }
        
        let data = null;
        let readHandler = `read${this.options.mode}`;
        data = this[readHandler](executor);

        this.setOutputData(1, executor);
        this.setOutputData(2, data);
        this.triggerSlot(0);
    }

    /**
     * read all as text
     * @param {DirectiveExecutor} executor 
     */
    readAllChars(executor) {
        let data = executor.read(null);
        executor.moveCursor(data.length);
        data = data.toString();
        return data;
    }

    /**
     * read all as bytes
     * @param {DirectiveExecutor} executor 
     */
    readAllBytes(executor) {
        let data = executor.read(null);
        executor.moveCursor(data.length);
        data = data.toString('hex').toUpperCase();
        return data;
    }

    /**
     * read chars from executor
     * @param {*} executor 
     * @returns 
     */
    readChars(executor) {
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
        let buffer = Buffer.from(bytes);
        let text = buffer.toString();
        return text;
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