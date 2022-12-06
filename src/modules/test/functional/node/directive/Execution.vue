<template>
    <a-drawer :title="$t('test.functionalNode.Directive.execInfoTitle')" placement="right"
      :visible="visible"
      get-container="#test-functional-flow-container" 
      :wrap-style="{ position: 'absolute' }"
      :width="500"
      @close="actionClose"
    >
      <template v-if="null !== node">
        <!-- summary -->
        <a-descriptions :title="$t('test.functionalNode.Directive.execInfoBasic')" :column="2">
          <a-descriptions-item :label="$t('test.functionalNode.Directive.directiveName')" span="2">
            {{node.directive.name}}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('test.functionalNode.Directive.execStatus')">
            <a-tag v-if="node.comparator.getIsMatched()" color="green">
              {{$t('test.functionalNode.Directive.execStatusSuccess')}}
            </a-tag>
            <a-tag v-else color="red">
              {{$t('test.functionalNode.Directive.execStatusFailed')}}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('test.functionalNode.Directive.timeout')">
            {{node.options.timeout}}ms
          </a-descriptions-item>
        </a-descriptions>

        <!-- inputs & outputs -->
        <a-row>
          <a-col :span="12">
            <h6 class="mb-4 mt-4"><strong>{{$t('test.functionalNode.Directive.inputs')}}</strong></h6>
            <a-empty v-if="0 == countDataPins('inputs')" :description="false"/>
            <div class="p-1" v-for="(item, pindex) in getDataPins('inputs')" :key="pindex">
              {{item.name}} : {{item.value}}
            </div>
          </a-col>
          <a-col :span="12">
            <h6 class="mb-4 mt-4"><strong>{{$t('test.functionalNode.Directive.outputs')}}</strong></h6>
            <a-empty v-if="0 == countDataPins('outputs')" :description="false"/>
            <div class="p-1" v-for="(item, pindex) in getDataPins('outputs')" :key="pindex">
              {{item.name}} : {{item.value}}
            </div>
          </a-col>
        </a-row>

        <!-- request parameter -->
        <h6 class="mb-4 mt-4"><strong>{{$t('test.functionalNode.Directive.requestParameters')}}</strong></h6>
        <component :is="`parameter-viewer-${node.options.parameterFormat}`" 
          :directive="node.directive" :executor="node.executor"
        />
        
        <!-- expect response content -->
        <h6 class="mb-4 mt-4"><strong>{{$t('test.functionalNode.Directive.expectResponseContent')}}</strong></h6>
        <a-table v-if="'form' == node.options.expectResponseFormat" 
          class="test-functional-expect-form-table" 
          bordered 
          :columns="expectFormTableColumns" 
          :data-source="getExpectResponseValueTableDataSource()" 
          :pagination="false"
        >
          <div slot="name" slot-scope="text, record">{{record.name}}</div>
          <div slot="type" slot-scope="text, record">
            {{$t(`directive.parameter.form.dataType.${record.type}`)}}
          </div>
          <div slot="value" slot-scope="text, record">
            {{record.prefix}}{{record.value}}
          </div>
          <div slot="comparator" slot-scope="text, record">
            {{$t(`test.editModal.comparator${record.comparator}`)}}
          </div>
        </a-table>
        <pre v-else class="border rounded p-1 pre-content"
        >{{node.options.expectResponseValue}}</pre>

        <!-- actual response data -->
        <h6 class="mb-4 mt-4"><strong>{{$t('test.functionalNode.Directive.actualResponseContent')}}</strong></h6>
        <response-form-viewer-readonly v-if="'form' == node.options.expectResponseFormat" 
          :directive="node.directive" :content="node.executor.getResponseBuffer()"
        />
        <pre v-else-if="'hex' == node.options.expectResponseFormat"
          class="pre-content border rounded p-1"
        >{{getResponseHexContent()}}</pre>
        <pre v-else-if="'text' == node.options.expectResponseFormat"
          class="pre-content border rounded p-1"
        >{{getResponseTextContent()}}</pre>

        <!-- response data comparison -->
        <h6 class="mb-4 mt-4"><strong>{{$t('test.functionalNode.Directive.comparison')}}</strong></h6>
        <a-table v-if="'form' == node.options.expectResponseFormat" bordered
          class="test-functional-expect-form-table" 
          :columns="compareFormTableColumns" 
          :data-source="getExpectResponseValueTableDataSource()" 
          :pagination="false"
        >
          <div slot="name" slot-scope="text, record">{{record.name}}</div>
          <div slot="compare" slot-scope="text, record,index">
            <a-tag class="mr-0">{{record.prefix}}{{record.value}}</a-tag>
            {{$t(`test.editModal.comparator${record.comparator}`)}}
            <a-tag>{{record.prefix}}{{node.executor.getResponseAsForm().getValueByIndex(index)}}</a-tag>
          </div>
          <div slot="result" slot-scope="text, record,index">
            <a-tag v-if="node.comparator.matchResult[index]" color="green">成功</a-tag>
            <a-tag v-else color="red">失败</a-tag>
          </div>
        </a-table>
        <div v-else-if="'hex' == node.options.expectResponseFormat"
          class="pre-content border rounded p-1"
        >
          <div v-for="(byte,index) in getCompareDataHex()" :key="index" 
            :class="'data-compare-hex-byte ' + (byte.match ? 'success' : 'failed')"
          >
            <div class="expect">{{byte.expect}}</div>
            <div class="actual">{{byte.actual}}</div>
          </div>
        </div>
        
        <!-- compare text with regex mode enabled -->
        <div v-else-if="'text' == node.options.expectResponseFormat && node.options.expectResponseTextRegexEnable"
          class="pre-content border rounded p-1"
        >
          <div>{{$t('test.functionalNode.Directive.comparisonTextRegex')}} : {{node.comparator.expectData}}</div>
          <div>{{$t('test.functionalNode.Directive.comparisonTextData')}} : {{getResponseTextContent()}}</div>
        </div>
        <!-- compare text without regex mode enabled -->
        <div v-else-if="'text' == node.options.expectResponseFormat"
          class="pre-content border rounded p-1"
        >
          <div>{{$t('test.functionalNode.Directive.expectResponseContent')}} : {{node.comparator.expectData}}</div>
          <div>{{$t('test.functionalNode.Directive.actualResponseContent')}} : {{getResponseTextContent()}}</div>
        </div>
  
        <div class="mt-4 text-right">
          <a-button type="primary" @click="actionClose">{{$t('button.ok')}}</a-button>
        </div>
      </template>
    </a-drawer>
</template>
<script>
import {LiteGraph} from 'litegraph.js'
import NodeDirective from './Node.js'
import Common from '../../../../../utils/Common.js'
import ParameterViewerForm from '../../../../directive/parameters/form/Viewer.vue'
import ParameterViewerHex from '../../../../directive/parameters/hex/Viewer.vue'
import ParameterViewerText from '../../../../directive/parameters/text/Viewer.vue'
import ParameterViewerFile from '../../../../directive/parameters/file/Viewer.vue'
import ResponseFormViewerReadOnly from '../../../../directive/response/form/ViewerReadOnly.vue'
import NodeExecuteDirective from './Node.js'
import MyObject from '../../../../../utils/datatype/MyObject.js'
export default {
    components : {
        'parameter-viewer-form' : ParameterViewerForm,
        'parameter-viewer-hex' : ParameterViewerHex,
        'parameter-viewer-text' : ParameterViewerText,
        'parameter-viewer-file' : ParameterViewerFile,
        'response-form-viewer-readonly' : ResponseFormViewerReadOnly,
    },
    data() {
        return {
            /**
             * instance of node
             * @property {NodeExecuteDirective|null}
             */
            node : null,
            /**
             * @property {Boolean}
             */
            visible : false,
            /**
             * @property {Array<Object>}
             */
            expectFormTableColumns : [
                {title: this.$t('directive.response.form.fieldName'), dataIndex: 'name',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.response.form.fieldType'),dataIndex: 'type',scopedSlots: { customRender: 'type' }},
                {title: this.$t('test.functionalNode.Directive.comparisonOperator'),dataIndex: 'comparator',scopedSlots: { customRender: 'comparator' }},
                {title: this.$t('directive.response.form.fieldValue'),dataIndex: 'value',scopedSlots: { customRender: 'value' }},
            ],
            /**
             * @property {Array<Object>}
             */
            compareFormTableColumns : [
                {title: this.$t('test.functionalNode.Directive.comparisonName'),dataIndex: 'name',scopedSlots: { customRender: 'name' }},
                {title: this.$t('test.functionalNode.Directive.comparisonAction'),dataIndex: 'compare',scopedSlots: { customRender: 'compare' }},
                {title: this.$t('test.functionalNode.Directive.comparisonResult'),dataIndex: 'result',scopedSlots: { customRender: 'result' }},
            ],
        };
    },
    async mounted() {
        this.$parent.registerNodeAddHandler(node => this.onNodeAdded(node));
    },
    methods : {
        /**
         * callback handler on new node added.
         * @param {LGraphNode} node
         */
        onNodeAdded( node ) {
            if ( !(node instanceof NodeDirective) ) {
                return ;
            }
            node.onBtnExecutionInfoClicked = () => this.open(node);
        },
        
        /**
         * get data pin list by given type.
         * @returns {Array<Object>}
         */
        getDataPins( type ) {
            let pins = [];
            for ( let i=0; i<this.node[type].length; i++ ) {
                let pin = this.node[type][i];
                if ( LiteGraph.ACTION == pin.type 
                || LiteGraph.EVENT == pin.type 
                || true !== pin.isCustom ) {
                    continue ;
                }

                let value = null;
                if ( 'inputs' === type ) {
                    value = this.node.getInputData(i);
                } else {
                    value = this.node.getOutputData(i);
                }
                pins.push({name:pin.name,value:value});
            }
            return pins;
        },

        /**
         * counter the data pins by given type.
         * @returns {Number}
         */
        countDataPins( type ) {
            let count = 0;
            for ( let i=0; i<this.node[type].length; i++ ) {
                let pin = this.node[type][i];
                if ( LiteGraph.ACTION == pin.type || LiteGraph.EVENT == pin.type ) {
                    continue ;
                }
                count ++;
            }
            return count;
        },

        /**
         * open the execution detail drawer
         * @param {NodeExecuteDirective} node
         */
        open( node ) {
            this.node = node;
            this.visible = true;
            this.$forceUpdate();

            let $this = this;
            this.$nextTick(() => {
                if ( null === this.$el.parentElement ) {
                    return ;
                }

                $this.$el.parentElement.style.display = 'block';
                $this.$el.parentElement.style.position = 'absolute';
                $this.$el.parentElement.style.top = '0';
                $this.$el.parentElement.style.right = '0';
                $this.$el.parentElement.style.width = '100%';
                $this.$el.parentElement.style.height = '100%';
            })
        },

        /**
         * close execution detail drawer
         */
        actionClose() {
            this.node = null;
            this.visible = false;

            let $this = this;
            this.$nextTick(() => {
                $this.$el.parentElement.style.display = 'none';
            })
        },
        
        /**
         * get response hex content to show actual data
         * @retruns {String}
         */
        getResponseHexContent() {
            return Common.convertBufferToHexString(this.node.executor.getResponseBuffer());
        },

        /**
         * get response text content to show actual data
         * @retruns {String}
         */
        getResponseTextContent() {
            return Common.charsetConvert(
                this.node.executor.getResponseBuffer(), 
                'utf-8', 
                this.node.directive.responseCharset
            );
        },

        /**
         * get byte array of compare data
         * @returns {Array<Object>}
         */
        getCompareDataHex() {
            let comparator = this.node.comparator;
            let expectData = Common.convertStringToHex(comparator.expectData);

            let bytes = [];
            for ( let i=0; i<comparator.matchResult.length; i++ ) {
                let match = comparator.matchResult[i];
                let actual = comparator.actualData[i];
                if ( undefined !== actual ) {
                    actual = actual.toString(16).toUpperCase();
                } else {
                    actual = '--';
                }
                let expect = expectData[i];
                if ( undefined !== expect ) {
                    expect = expect.toString(16).toUpperCase();
                } else {
                    expect = '--';
                }
                bytes.push({actual,expect,match});
            }
            return bytes;
        },

        /**
         * get table data source for expect response value table.
         * @returns {Array<Object>}
         */
        getExpectResponseValueTableDataSource() {
            let source = [];
            for ( let i=0; i<this.node.options.expectResponseValue.length; i++ ) {
                let item = MyObject.copy(this.node.options.expectResponseValue[i]);
                item.key = `R_${i}`;
                source.push(item);
            }
            return source;
        }
    }
}
</script>
<style scoped>
.wrapper {width: 100%;height: 100%;position: absolute;display: none;top: 0px;right: 0px;}
.pre-content {background-color: #e9e9e9 !important;}
.data-compare-hex-byte {width:24px;border-radius: 5px;margin-right:2px;display:inline-block;text-align:center;}
.data-compare-hex-byte:hover {background: white !important;}
.data-compare-hex-byte.success {background: #cce2cc;}
.data-compare-hex-byte.failed {background: #ffd6d6;}
</style>
<style>
.test-functional-expect-form-table td {padding: 3px 3px !important;}
.test-functional-expect-form-table th {padding: 3px 3px !important;}
</style>