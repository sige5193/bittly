import MdbDirective from '../../../../../models/MdbDirective.js';
import DirectiveExecutor from '../../../../directive/Executor.js'
import Common from '../../../../../utils/Common.js'
import DataComparator from '../../../DataComparator.js';
import NodeBase from '../NodeBase.js';
import MyObject from '../../../../../utils/datatype/MyObject.js';
import {LiteGraph} from 'litegraph.js'
/**
 * The node use to execute directive.
 */
export default class Node extends NodeBase{
    /**
     * @constructor
     */
    constructor() {
        super();
        this.title = this.$t('name');
        /**
         * @property {MdbDirective}
         */
        this.directive = null;
        /**
         * @property {DirectiveExecutor}
         */
        this.executor = null;
        /**
         * @property {DataComparator}
         */
        this.comparator = null;

        // setup inputs and outputs
        this.addInput(this.$t('execute'), LiteGraph.ACTION);
        this.addOutput(this.$t('success'), LiteGraph.EVENT);
        this.addOutput(this.$t('failed'), LiteGraph.EVENT);
        this.addOutput(this.$t('executor'), 'string');
        
        // setup widget button for directive editting.
        this.onBtnSettingClicked = () => {};
        this.btnDirectiveSelect = this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );
        
        // setup widget button for exectuion detail
        this.onBtnExecutionInfoClicked = () => {};
        this.btnDirectiveExecute = this.addWidget(
            'button',
            this.$t('btnExecuteInfo'),
            null,
            () => this.onBtnExecutionInfoClicked(this)
        );
        this.btnDirectiveExecute.disabled = true;
    }

    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Directive';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            title : '',
            directiveId : null,
            inputs : [],
            outputs : [],
            parameterFormat : 'none',
            parameterValue : null,
            expectResponseFormat : 'text',
            expectResponseValue : '',
            expectDataLength : 0,
            timeout : 1000,
        };
    }

    /**
     * handler on option updated
     */
    async onOptionUpdate() {
        if ( !Common.isEmpty(this.options.directiveId) ) {
            this.directive = await MdbDirective.findOne(this.options.directiveId);
            this.title = `${this.$t('name')} ${this.options.title}`;
        }
        this.updateDataPinsByNameList('input', this.options.inputs);
        this.updateDataPinsByNameList('output', this.options.outputs);
        this.refresh();
    }

    /**
     * execute this node
     * @overide
     */
    async onAction () {
        this.btnDirectiveExecute.disabled = true;
        this.executor = null;
        this.comparator = null;
        
        if ( null === this.directive ) {
            return this.alert('error', this.$t('directiveNotBinded'));
        }
        
        let isSuccess = false;
        this.log(`start`);
        try {
            let executor = new DirectiveExecutor(this.directive);
            let parameterValue = this.applyInputVariablesToParameterValue();
            executor.setCustomParams(this.options.parameterFormat, parameterValue);
            await executor.execute();
            this.executor = executor;

            await Common.msleep(this.options.timeout);
            let comparator = new DataComparator();
            comparator.type = this.options.expectResponseFormat;
            comparator.executor = this.executor;
            comparator.expectData = this.options.expectResponseValue;
            comparator.dataLength = this.options.expectDataLength;
            comparator.textRegexEnable = this.options.expectResponseTextRegexEnable;
            isSuccess = comparator.compare();
            
            this.comparator = comparator;
            this.btnDirectiveExecute.disabled = false;
            this.refresh();
        } catch ( e ) {
            this.graph.error(this.$t('directiveError', [e.message]));
            return ;
        }
        
        if ( isSuccess ) {
            this.log(`success`);
            this.setOutputData(2, this.executor);
            this.sendDataToOutputPins();
            this.triggerSlot(0);
            return;
        }
        
        this.log(`failed`);
        if ( null !== this.getOutputNodes(1) ) {
            this.triggerSlot(1);
            return ;
        }
        
        this.graph.error(this.$t('responseValidateFailed',[this.directive.name]));
    }

    /**
     * apply input data to parameters
     * @returns {String|Array}
     */
    applyInputVariablesToParameterValue() {
        let value = MyObject.copy(this.options.parameterValue);
        if ( 'form' === this.options.parameterFormat ) {
            for ( let i=0; i<value.length; i++ ) {
                value[i].value = this.applyInputVariableToContent(value[i].value);
            }
        } else {
            value = this.applyInputVariableToContent(value);
        }
        return value;
    }

    /**
     * apply input data to string content
     * @param {String} content 
     * @returns {String}
     */
    applyInputVariableToContent( content ) {
        for ( let i=0; i<this.inputs.length; i++ ) {
            if ( this.inputs[i].type == LiteGraph.ACTION ) {
                continue ;
            }

            let name = this.inputs[i].name;
            let inputVal = this.getInputData(i);
            content = content.replaceAll(`{{${name}}}`, inputVal);
        }
        return content;
    }

    /**
     * send response data to output pins
     * @returns {void}
     */
    sendDataToOutputPins() {
        let response = this.comparator.actualData;
        if ( 'form' === this.options.expectResponseFormat ) {
            for ( let i=0; i<this.options.outputs.length; i++ ) {
                let name = this.options.outputs[i];
                let value = response.getReadableValueByName(name);
                this.setOutputDataByName(name, value);
            }
        } else if ( 'text' === this.options.expectResponseFormat 
        && true === this.options.expectResponseTextRegexEnable) {
            let regex = new RegExp(`^${this.options.expectResponseValue}$`, 'gm');
            let match = regex.exec(response);
            if ( null != match && undefined != match.groups ) {
                for ( let name in match.groups ) {
                    let value = match.groups[name];
                    this.setOutputDataByName(name, value);
                }
            }
        }
    }
}