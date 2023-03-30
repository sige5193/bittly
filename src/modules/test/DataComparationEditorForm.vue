<template>
  <div class="mt-1">
    <a-form-item v-for="(item, index) in content" :key="index"
      labelAlign="left" class="mb-0" 
    >
      <!-- label -->
      <span slot="label">
        <a-icon type="edit" />
        {{item.name}} 
        <a-tooltip>
          <template slot="title">
            {{$t(`directive.parameter.form.dataType.${item.type}`)}}
            <span v-if="0 == $dict.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length',0)">[{{item.length}}]</span>
          </template>
          <small><a-icon class="text-muted" type="question-circle" /></small>
        </a-tooltip>
      </span>

      <div class="d-flex flex-dir-row">
        <!-- operator -->
        <a-select class="mr-1" style="width: 130px;"
          v-model="content[index].comparator" 
          @change="actionComparatorChange(index)"
        >
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

        <!-- expect value editor -->
        <a-input v-if="'Ignore' === content[index].comparator" disabled/>
        <a-input-group compact v-else-if="-1 != ['Between','NotBetween'].indexOf(content[index].comparator)">
          <a-input class="w-45" v-model.number="content[index].value[0]"/>
          <a-input class="w-10 text-center" placeholder="~" disabled/>
          <a-input class="w-45" v-model.number="content[index].value[1]"/>
        </a-input-group>
        <a-input v-else ref="inputValue"
          :addon-before="item.prefix" 
          v-model="content[index].value" 
          @input="actionContentInput" 
        />
      </div>
    </a-form-item>
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
                        length : item.length,
                    });
                }
                this.updateVModel();
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
         * event handler on comparator changed
         */
        actionComparatorChange(index) {
            if ( -1 != ['Between','NotBetween'].indexOf(this.content[index].comparator) ) {
                this.content[index].value = ['',''];
            } else {
                this.content[index].value = '';
            }
            this.updateVModel();
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