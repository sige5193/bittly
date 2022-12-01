<template>
    <a-table class="directive-response-form-table" bordered 
      :columns="tableColumns" 
      :data-source="fields" 
      :pagination="false"
    >
      <!-- Field Name -->
      <div slot="name" slot-scope="text, record, index">
        <a-input size="small" class="border-none" disabled
          :ref="`inputName_${index}`"
          :value="fields[index]['name']" 
        />
      </div>
      
      <!-- Field Data Type -->
      <div slot="type" slot-scope="text, record, index">
        <a-input size="small" disabled
          :class="0 == $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'length',0) ? 'border-none w-80' : 'border-none'"
          :ref="`inputDataType_${index}`"
          :value="$t(`directive.parameter.form.dataType.${record.type}`)" 
        />

        <!-- Data Type Length -->
        <a-input size="small" class="w-20 border-none" disabled
          v-if="0 == $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'length',0)" 
          :value="fields[index]['length']"
          :ref="`inputDataLength_${index}`"
        />
      </div>
      
      <!-- Field Value -->
      <div slot="value" slot-scope="text, record, index">
        <a-input size="small" class="border-none"
          v-if="$dict.match('DIRECTIVE_PARAM_DATATYPE','STRING',record.type)" 
          :value="values[index]"
          disabled
          :ref="`inputValueString_${index}`"
        />
        <a-input size="small" class="border-none"
          v-else-if="false === $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'unsigned', false)" 
          :value="values[index]" 
          disabled
          :ref="`inputValue_${index}`"
        />
        <div v-else class="d-flex flex-dir-row">
          <a-select :ref="`selectValueFormat_${index}`"
            v-model="fields[index]['format']" size="small" 
            class="border-none bg-light-2 rounded text-muted-2"
            disabled
          >
            <a-select-option value="bin">BIN</a-select-option>
            <a-select-option value="oct">OCT</a-select-option>
            <a-select-option value="dec">DEC</a-select-option>
            <a-select-option value="hex">HEX</a-select-option>
          </a-select>

          <a-input size="small" class="border-none ml-1" disabled 
            :value="values[index]"
            :ref="`inputValueUnsigned_${index}`"
          />
        </div>
      </div>

      <!-- Field Description -->
      <div slot="desc" slot-scope="text, record, index">
        <a-input size="small" disabled
          class="border-none"
          :value="fields[index]['desc']"
          :ref="`inputDesc_${index}`"
        />
      </div>
    </a-table>
</template>
<script>
import ViewerMixin from '../ViewerMixin.js'
import Common from '@/utils/Common.js'
import ResponseParser from './ResponseParser.js'
export default {
    name : 'DirectiveResponseViewerFormReadOnly',
    mixins : [ViewerMixin],
    props: {
        /**
         * the directive model to edit
         * @property {MdbDirective}
         */
        directive:{},
        /**
         * response data buffer
         * @property {Buffer}
         */
        content:{},
    },
    data() {
        return {
            /**
             * @property {Array<Object>}
             */
            fields : [],
            /**
             * values of single response
             * @property {Array}
             */
            values : [],
        };
    },
    computed : {
        /**
         * @returns {Array<Object>}
         */
        tableColumns() {
            return [
                {title: this.$t('directive.response.form.fieldName'), dataIndex: 'name',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.response.form.fieldType'),dataIndex: 'type',scopedSlots: { customRender: 'type' }},
                {title: this.$t('directive.response.form.fieldValue'),dataIndex: 'value',scopedSlots: { customRender: 'value' }},
                {title: this.$t('directive.response.form.fieldDesc'),dataIndex: 'desc',scopedSlots: { customRender: 'desc' }},
            ];
        },
    },
    watch : {
        directive() {
            this.init();
        },
        content() {
            this.init();
        },
    },
    mounted () {
        this.init();
    },
    methods : {
        /**
         * init
         */
        init() {
            this.fields = [];
            if ( undefined != this.directive.responseFormatter.fields ) {
                this.fields = Common.objCopy(this.directive.responseFormatter.fields);
            }
            
            this.values = [];
            let parser = new ResponseParser(this.directive, this.content, false);
            parser.parse();
            this.values = parser.getValues();
            this.$forceUpdate();
        },
    },
}
</script>
<style>
.directive-response-form-table td {padding: 3px 3px !important;}
.directive-response-form-table th {padding: 3px 3px !important;}
</style>