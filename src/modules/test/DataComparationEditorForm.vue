<template>
  <div>
    <a-row v-for="(item, index) in content" :key="index" class="mt-1">
      <!-- name -->
      <a-col :span="6" style="line-height:43px;">
        {{item.name}} [ {{$t(`directive.parameter.form.dataType.${item.type}`)}} ]
      </a-col>
      
      <!-- opertaotr -->
      <a-col :span="4" class="pr-1" style="line-height:43px;">
        <a-select v-model="content[index].comparator" class="w-100" @change="actionContentInput">
          <a-select-option value="Ignore">{{$t('test.editModal.comparatorIgnore')}}</a-select-option>
          <a-select-option value="Equal">{{$t('test.editModal.comparatorEqual')}}</a-select-option>
          <a-select-option value="NotEqual">{{$t('test.editModal.comparatorNotEqual')}}</a-select-option>
          <a-select-option value="Greater">{{$t('test.editModal.comparatorGreater')}}</a-select-option>
          <a-select-option value="GreaterOrEqual">{{$t('test.editModal.comparatorGreaterOrEqual')}}</a-select-option>
          <a-select-option value="Less">{{$t('test.editModal.comparatorLess')}}</a-select-option>
          <a-select-option value="LessOrEqual">{{$t('test.editModal.comparatorLessOrEqual')}}</a-select-option>
          <a-select-option value="Between">{{$t('test.editModal.comparatorBetween')}}</a-select-option>
          <a-select-option value="NotBetween">{{$t('test.editModal.comparatorNotBetween')}}</a-select-option>
          <a-select-option value="Contains">{{$t('test.editModal.comparatorContains')}}</a-select-option>
          <a-select-option value="NotContains">{{$t('test.editModal.comparatorNotContains')}}</a-select-option>
        </a-select>
      </a-col>
      
      <!-- value -->
      <a-col :span="14" style="line-height: 40px;">
        <a-input 
          ref="inputValue"
          :addon-before="item.prefix" 
          v-model="content[index].value" 
          @input="actionContentInput" 
        />
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
    name : 'ResponseParamEditorForm',
    props : {
        /**
         * values of data
         * @property {Object[]}
         */
        value : {}, 
        /**
         * instance of MdbDirective
         * @property {MdbDirective}
         */
        directive : {},
    },
    data() {
        return {
            content : null,
        };
    },
    watch : {
        value( newValue, oldValue ) {
            if ( newValue != oldValue ) {
                this.initVModel();
            }
        },
    },
    mounted() {
        this.initVModel();
    },
    methods : {
        /**
         * init vmodel
         */
        initVModel() {
            this.content = [];
            
            let formatable = [
                this.$dict.value('DIRECTIVE_PARAM_DATATYPE','BYTE'),
                this.$dict.value('DIRECTIVE_PARAM_DATATYPE','UNSIGNED_CHAR'),
                this.$dict.value('DIRECTIVE_PARAM_DATATYPE','UNSIGNED_SHORT'),
                this.$dict.value('DIRECTIVE_PARAM_DATATYPE','UNSIGNED_INT'),
                this.$dict.value('DIRECTIVE_PARAM_DATATYPE','UNSIGNED_LONG'),
                this.$dict.value('DIRECTIVE_PARAM_DATATYPE','UNISNGED_LONG_LONG'),
            ];

            let formatPrefix = {};
            formatPrefix[this.$dict.value('DIRECTIVE_PARAM_BYTE_FORMATTER','BIN')] = '0b';
            formatPrefix[this.$dict.value('DIRECTIVE_PARAM_BYTE_FORMATTER','OCT')] = '0';
            formatPrefix[this.$dict.value('DIRECTIVE_PARAM_BYTE_FORMATTER','DEC')] = ' ';
            formatPrefix[this.$dict.value('DIRECTIVE_PARAM_BYTE_FORMATTER','HEX')] = '0x';

            if ( undefined == this.value || null == this.value ) {
                for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                    let item = this.directive.responseFormatter.fields[i];
                    this.content.push({
                        name : item.name,
                        type : item.type,
                        value : '',
                        format : item.format,
                        comparator : 'Equal',
                        prefix : -1 == formatable.indexOf(item.type) ? null : formatPrefix[item.format],
                    });
                }
            } else {
                this.content = this.value;
            }
            this.$forceUpdate();
        },

        /**
         * update vmodel
         */
        updateVModel() {
            this.$emit('input', this.content);
        },

        /**
         * update content
         */
        actionContentInput() {
            this.updateVModel();
        },
    }
}
</script>