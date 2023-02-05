<!--
 - directive parameter form viewer
 - @author sige
-->
<template>
  <div>
    <a-table 
      bordered
      class="directive-parameter-viewer-form-table"
      :columns="tableColumns"
      :data-source="fields"
      :pagination="false" 
    >
      <!-- field name -->
      <div slot="name" slot-scope="text, record, index">
        <a-input size="small"
          disabled
          class="border-none" 
          :ref="`inputName_${index}`"
          v-model="fields[index]['name']" 
        />
      </div>
      
      <!-- field type -->
      <div slot="type" slot-scope="text, record, index">
        <a-select size="small" class="border-none w-100"
          disabled
          :ref="`selectDataType_${index}`"
          :showArrow="false"
          v-model="fields[index]['type']" 
        >
          <a-select-option 
            v-for="(item, itemKey) in $dict.items('DIRECTIVE_PARAM_DATATYPE')"
            :key="itemKey"
            :value="item.value"
          >{{ $t(`directive.parameter.form.dataType.${item.value}`)}}</a-select-option>
        </a-select>
      </div>
      
      <!-- field value -->
      <div slot="value" slot-scope="text, record, index">
        <a-input size="small" class="border-none"
          disabled
          v-if="$dict.match('DIRECTIVE_PARAM_DATATYPE','STRING',record.type)" 
          v-model="values[index]"
          :ref="`inputValueString_${index}`"
        />
        <a-input size="small" class="border-none"
          disabled
          v-else-if="false === $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'unsigned', false)" 
          v-model="values[index]" 
          :ref="`inputValueSigned_${index}`"
        />
        <a-input size="small" class="w-100 border-none"
          v-else 
          disabled
          v-model="values[index]"
          :ref="`inputValueUnsigned_${index}`"
        >
          <a-select size="small" class="border-none"
            disabled
            slot="addonBefore" 
            style="width: 60px"
            v-model="fields[index]['format']"
            :showArrow="false"
            :ref="`selectValueDataType_${index}`"
          >
            <a-select-option value="bin">BIN</a-select-option>
            <a-select-option value="oct">OCT</a-select-option>
            <a-select-option value="dec">DEC</a-select-option>
            <a-select-option value="hex">HEX</a-select-option>
          </a-select>
        </a-input>
      </div>

      <!-- description -->
      <div slot="desc" slot-scope="text, record, index">
        <a-input size="small"
          disabled 
          class="border-none"
          v-model="fields[index]['desc']"
          :ref="`inputDesc_${index}`"
        />
      </div>
    </a-table>
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
export default {
    name : 'DirectiveParameterFormViewer',
    props: {
        /**
         * instance of directive model
         * @property {MdbDirective}
         */
        directive : Object,
        /**
         * instance of executor that this command ran with.
         * @property {Executor}
         */
        executor : {},
    },
    data() {
        return {
            fields : [],
            values : [],
        };
    },
    computed : {
        tableColumns() {
            return [
                {title: this.$t('directive.parameter.form.fieldName'), dataIndex: 'name',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.parameter.form.filedType'),dataIndex: 'type',scopedSlots: { customRender: 'type' }},
                {title: this.$t('directive.parameter.form.filedValue'),dataIndex: 'value',scopedSlots: { customRender: 'value' }},
                {title: this.$t('directive.parameter.form.filedDesc'),dataIndex: 'desc',scopedSlots: { customRender: 'desc' }},
            ];
        },
    },
    mounted () {
        this.init();
    },
    methods : {
        /**
         * init display data
         */
        init() {
            this.fields = [];
            if ( !Common.isEmpty(this.directive.requestContent.form) ) {
                this.fields = Common.objCopy(this.directive.requestContent.form);
            }
            
            let paramBuilder = this.executor.getParamBuilder();
            if ( null === paramBuilder ) {
                return ;
            }

            let formData = [];
            let builder = paramBuilder.getBuildHandler();
            if ( 'form' == builder.getTypeName() ) {
                formData = builder.getFormRawData();
                if ( null === formData ) {
                    formData = [];
                }
            }

            this.values = [];
            for ( let i=0; i<formData.length; i++ ) {
                this.values.push(formData[i].value);
            }
            
            this.$forceUpdate();
        },
    },
}
</script>
<style>
.directive-parameter-viewer-form-table td {padding: 3px 3px !important;}
.directive-parameter-viewer-form-table th {padding: 3px 3px !important;}
</style>