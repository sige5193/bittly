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
        this.addInput(this.$t('inputData'),'string');
        this.addOutput(this.$t('success'), LiteGraph.EVENT);
        
        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );

        // value viewer
        this.expectWidget = this.addWidget('text','','',()=>{},{disabled:true});
        this.expectWidget.disabled = true;
        
        this.onValidateFailed = () => {};
        this.onOptionUpdate();
    }
    
    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Expect';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            operator : 'Equal',
            expectValue : '',
        };
    }
    
    /**
     * handler on option updated
     */
    onOptionUpdate() {
        let expectValue = this.options.expectValue;
        if ( 5 < expectValue.length ) {
            expectValue = expectValue.substring(0, 5) + '...';
        }

        this.expectWidget.value = expectValue;
        this.expectWidget.name = this.$t(`validate${this.options.operator}`);
        this.refresh();
    }

    /**
     * node action handler
     * @returns {void}
     */
    async onAction() {
        debugger
        let actualValue = this.getInputData(1);
        let expectValue = this.options.expectValue;

        let isValidate = null;
        switch ( this.options.operator ) {
        case 'Equal' : isValidate = actualValue == expectValue; break;
        case 'NotEqual' : isValidate = actualValue != expectValue; break;
        case 'GreaterThan' : isValidate = actualValue > expectValue; break;
        case 'GreaterOrEqual' : isValidate = actualValue >= expectValue; break;
        case 'LessThan' : isValidate = actualValue < expectValue; break;
        case 'LessOrEqual' : isValidate = actualValue <= expectValue; break;
        default : {
                let handler = `validate${this.options.operator}`;
                isValidate = this[handler](expectValue,actualValue);
                break;
            }
        }
        
        if ( !isValidate ) {
            this.onValidateFailed({
                operator : this.options.operator,
                actual:actualValue, 
                expect:expectValue
            });
            this.graph.error({message:this.$t('validateFailed'), isModalDisplayed:true});
        }

        this.triggerSlot(0);
    }

    /**
     * validate by regex
     * @param {*} expect 
     * @param {*} actual 
     */
    validateRegex( expect, actual ) {
        let regex = new RegExp(expect,'g');
        return regex.test(actual);
    }
}