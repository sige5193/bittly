<!--
 - parameter form editor
 - @author sige
-->
<template>
  <div>
    <a-table 
      bordered
      size="small" 
      class="directive-parameter-editor-form-table table-body-m-0"
      :columns="tableColumns" 
      :data-source="fields" 
      :pagination="false" 
      :components="tableComponents"
    >
      <!-- row number -->
      <div slot="row_no" slot-scope="text, record, index" class="text-muted">
        {{index+1}}
      </div>

      <!-- field name -->
      <div slot="name" slot-scope="text, record, index">
        <a-input :ref="`inputName_${index}`" :tab-index="index*1000+1"
          class="border-none" size="small" 
          v-model="fields[index]['name']"
          @input="actionNameInput(index)"
        />
      </div>
      
      <!-- field type -->
      <div slot="type" slot-scope="text, record, index">
        <a-select size="small" class="border-none"
          :class="{'w-100':('bits'!==record.type),'w-75':('bits'===record.type)}"
          v-model="fields[index]['type']" 
          :ref="`selectDataType_${index}`"
          :tab-index="index*1000+2"
          :dropdownMatchSelectWidth="false"
          @change="actionTypeChange(index, $event)"
        >
          <a-select-option v-for="dataType in dataTypes"
            :key="dataType" :value="dataType"
          >{{ $t(`directive.parameter.form.dataType.${dataType}`)}}</a-select-option>
        </a-select>

        <!-- bits length -->
        <div class="w-25 pl-1 d-inline-block" v-if="$dict.match('DIRECTIVE_PARAM_DATATYPE','BITS',record.type)">
          <a-input-number size="small" v-model="fields[index]['length']"
            class="w-100 border-none"
            :min="1"
            :placeholder="$t('directive.parameter.form.dataTypeBitsLength')"
            :ref="`inputDataLength_${index}`"
            @change="actionDataLengthInput(index)"
          />
        </div>
      </div>
      
      <!-- field value -->
      <div slot="value" slot-scope="text, record, index">
        <!-- data type : unsigned -->
        <div v-if="true == $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'unsigned', null)"
          class="d-flex flex-dir-row"
        >
          <a-select size="small" class="border-none bg-light-2 rounded text-muted-2"
            v-model="fields[index]['format']" 
            :tab-index="index*1000+4"
            :ref="`selectValueFormat_${index}`"
            @change="actionValueFormatChange(index, $event)"
          >
            <a-select-option value="bin">BIN</a-select-option>
            <a-select-option value="oct">OCT</a-select-option>
            <a-select-option value="dec">DEC</a-select-option>
            <a-select-option value="hex">HEX</a-select-option>
          </a-select>
          
          <div v-if="record.valueOptions && 0 < record.valueOptions.length" class="pl-1 pr-1 w-100">
            <a-select size="small" class="border-none w-100 pl-1 pr-1 directive-parameter-editor-form-value-select"
              v-model="fields[index]['value']"
              @change="actionValueInput(index)"
            >
              <a-select-option v-for="(valueOption,valueOptionIndex) in record.valueOptions"
                :key="valueOptionIndex"
                :value="valueOption.value"
              >{{valueOption.name}}</a-select-option>
            </a-select>
          </div>

          <a-auto-complete size="small" class="border-none ml-1 w-100"
            v-else
            v-model="fields[index]['value']"
            option-label-prop="value"
            :data-source="valueAutoCompleteItems"
            :ref="`inputValue_${index}`"
            :tab-index="index*1000+5"
            :dropdown-match-select-width="false"
            @blur="actionValueAutoCompleteBlur"
            @search="actionValueAutoCompleteSearch"
            @change="actionValueInput(index)"
          />
          
        </div>

        <!-- data type : file -->
        <a-upload
          v-else-if="$dict.match('DIRECTIVE_PARAM_DATATYPE','FILE', record.type)"
          :ref="`uploadFile_${index}`"
          :multiple="false"
          :beforeUpload="() => false"
          :showUploadList="false"
          @change="actionValueFileChange($event, index)"
        >
          <a-button size="small" class="border-none bg-light-2 text-muted-2">
            <a-icon type="file" /> {{$t('directive.parameter.file.select')}}
          </a-button>
          <span class="ml-1" v-if="0 != fields[index].value.length">{{fields[index].value}}</span>
        </a-upload>
        
        <!-- value options -->
        <a-select size="small" class="border-none w-100 directive-parameter-editor-form-value-select"
          v-else-if="record.valueOptions && 0 < record.valueOptions.length"
          v-model="fields[index]['value']"
          @change="actionValueInput(index)"
        >
          <a-select-option v-for="(valueOption,valueOptionIndex) in record.valueOptions"
            :key="valueOptionIndex"
            :value="valueOption.value"
          >{{valueOption.name}}</a-select-option>
        </a-select>

        <!-- data type : char -->
        <a-auto-complete size="small" class="border-none w-100"
          v-else-if="$dict.match('DIRECTIVE_PARAM_DATATYPE',['CHAR','UNSIGNED_CHAR'], record.type)"
          v-model="fields[index]['value']"
          option-label-prop="value"
          :data-source="valueAutoCompleteItems"
          :maxLength="1"
          :tab-index="index*1000+5"
          :ref="`inputValue_${index}`"
          :dropdown-match-select-width="false"
          @blur="actionValueAutoCompleteBlur"
          @search="actionValueAutoCompleteSearch"
          @change="actionValueInput(index)"
        />

        <!-- data type : string & bytes -->
        <div v-else-if="$dict.match('DIRECTIVE_PARAM_DATATYPE',['STRING','BYTES'], record.type)"
          class="position-relative"
        >
          <a-input read-only size="small" style="text-overflow: ellipsis;"
            class="border-none bg-white text-body cursor-text"
            :value="fields[index]['value']"
            :ref="`inputLongValue_${index}`"
            :tab-index="index*1000+3"
            @click.native="actionLongValueInputClick(index)"
          />
          <a-auto-complete class="w-100 bg-white"
            v-show="longValueEditorEnableKey == record.key"
            v-model="fields[index]['value']"
            option-label-prop="value"
            style="position: absolute;left: 0;z-index: 99;"
            :ref="`inputLongValueEditor_${index}`"
            :tab-index="index*1000+3"
            :maxLength="1"
            :dropdown-match-select-width="false"
            :data-source="valueAutoCompleteItems"
            @search="actionValueAutoCompleteSearch"
            @blur="actionLongValueEditorBlur"
          >
            <a-textarea auto-size class="w-100" @input="actionValueInput(index)"/>
          </a-auto-complete>
        </div>

        <!-- data type : others -->
        <a-auto-complete size="small" class="border-none w-100"
          v-else
          v-model="fields[index]['value']"
          option-label-prop="value"
          :data-source="valueAutoCompleteItems"
          :ref="`inputValue_${index}`"
          :tab-index="index*1000+3"
          :dropdown-match-select-width="false"
          @blur="actionValueAutoCompleteBlur"
          @search="actionValueAutoCompleteSearch"
          @change="actionValueInput(index)"
        />
      </div>
      
      <!-- field description -->
      <div slot="desc" slot-scope="text, record, index" class="position-relative">
        <a-input read-only size="small" style="text-overflow: ellipsis;"
          class="border-none bg-white text-body cursor-text"
          :value="fields[index]['desc']"
          :ref="`inputDescViewer_${index}`"
          :tab-index="index*1000+6"
          @click.native="actionDescInputClick(index)"
        />
        <a-textarea
          auto-size
          style="position: absolute;left: 0;z-index: 99;"
          v-show="descEditorEnableKey == record.key"
          v-model="fields[index]['desc']"
          :ref="`inputDesc_${index}`"
          :tab-index="index*1000+6"
          @input="actionDescInput(index)"
          @blur="actionDescBlur(index)"
        />
      </div>

      <!-- field options -->
      <div slot="action" slot-scope="text, record, index">
        <field-setting v-model="fields[index]" @change="actionRowSettingChange(index)" />
        <a-icon :ref="`iconRowInsert_${index}`" type="plus-square" @click="actionRowInsert(index)" class="mr-1" />
        <a-icon :ref="`iconRowDelete_${index}`" type="delete" @click="actionRowDelete(index)" class="mr-1"/>
        <a-icon type="swap" :rotate="90" class="drag-handler" style="cursor: s-resize;"/>
      </div>
    </a-table>
  </div>
</template>
<script>
import EditorFieldSetting from './EditorFieldSetting.vue'
import MdbDirective from '@/models/MdbDirective.js'
import TableDraggableWrapper from '@/components/TableDraggableWrapper.vue'
import Common from '@/utils/Common.js'
import MyObject from '../../../../utils/datatype/MyObject'
import QuickCallLib from '../../script/QuickCallLib'
export default {
    name : 'DirectiveParamEditorFormBlock',
    components : {
        'field-setting' : EditorFieldSetting,
    },
    props : {
        /**
         * the directive object to edit
         * @property {MdbDirective}
         */
        value : Object,
        /**
         * name of default data type
         * @property {String}
         */
        defaultDataType : {
            type : String,
            default : 'byte',
        },
    },
    data() {
        return {
            /**
             * form fields of current directive.
             * @property {Object[]}
             */
            fields : [],
            /**
             * the directive object
             * @property {MdbDirective|null}
             */
            directive : null,
            /**
             * holding the value format old map, change the map after processed, 
             * - key : the value key
             * - value : the old format name
             * @example {'12313123123':'hex','34234234234':'bin'}
             * @property {Object}
             */
            fieldValueFormatOldMap : {},
            /**
             * key name of item which enable description editor
             * @property {String|null}
             */
            descEditorEnableKey : null,
            /**
             * key name of item which enable long value editor
             * @property {String|null}
             */
            longValueEditorEnableKey : null,
            /**
             * value for a-table prop `tableComponents`
             * @property {Object}
             */
            tableComponents: {
                body: {wrapper: TableDraggableWrapper},
            },
            /**
             * list of item for value auto complete
             * @property {Array<Object>}
             */
            valueAutoCompleteItems : [],
            /**
             * list of data type names
             * @property {Array<String>}
             */
            dataTypes : [
                'bits','byte','char_int','char','unsigned_char','short','unsigned_short',
                'int','unsigned_int','long','unsigned_long','long_long','unsigned_long_long',
                'float','double','string','bytes','file'
            ],
        };
    },
    provide() {
        return {
            tableDraggableWrapperSource: this,
            tableDraggableWrapperAttrName : 'fields',
        };
    },
    computed : {
        tableColumns() {
            return [
                {title: '#', scopedSlots: { customRender: 'row_no' },className:'white-space-nowrap text-center'},
                {title: this.$t('directive.parameter.form.fieldName'), dataIndex: 'name',scopedSlots: { customRender: 'name' },className:'white-space-nowrap'},
                {title: this.$t('directive.parameter.form.filedType'),dataIndex: 'type',scopedSlots: { customRender: 'type' },className:'white-space-nowrap',width:'200px'},
                {title: this.$t('directive.parameter.form.filedValue'),dataIndex: 'value',scopedSlots: { customRender: 'value' },className:'white-space-nowrap'},
                {title: this.$t('directive.parameter.form.filedDesc'),dataIndex: 'desc',scopedSlots: { customRender: 'desc' },className:'white-space-nowrap'},
                {title: this.$t('directive.parameter.form.filedOperations'), key: 'action',scopedSlots: { customRender: 'action' }, className:'text-right white-space-nowrap'},
            ];
        },
    },
    watch : {
        defaultDataType() {
           this.onDefaultDataTypeChanged();
        },
    },
    created() {
        this.initVModel();
    },
    methods : {
        /**
         * init v-model
         **/ 
        initVModel() {
            if ( !(this.value instanceof MdbDirective) ) {
                throw Error(this.$t('directive.parameter.form.propValueMustBeAnInstanceOfMdbDirective'));
            }

            this.directive = this.value;
            this.fieldValueFormatOldMap = {};
            this.fields = [];
            if ( undefined !== this.directive.requestContent.form ) {
                this.fields = Common.objCopy(this.directive.requestContent.form);
            }
            for ( let i=0; i<this.fields.length; i++ ) {
                this.fieldValueFormatOldMap[this.fields[i].key] = this.fields[i].format;
            }
            this.appendNewField();
        },

        /**
         * update v-model
         */
        updateVModel() {
            let fields = [];
            for ( let i=0; i<this.fields.length-1; i++ ) {
                fields.push(this.fields[i]);
            }
            this.directive.requestContent.form = Common.objCopy(fields);
            this.directive.requestContent = Common.objCopy(this.directive.requestContent);
            this.$emit('input', this.directive);
        },

        /**
         * event handler for field name inputed
         * @param {Number} index
         */
        actionNameInput(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * event handler for field type changed
         * @param {Number} index
         */
        actionTypeChange(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.fields[index].format = 'hex';
            this.fields[index].value = '';
            
            if ( 'bits' === this.fields[index].type ) {
                let len = this.fields[index].length || 1;
                this.fields[index].length = len;
            }
            this.updateVModel();
        },

        /**
         * event handler for field data length input
         * @param {Number} index
         */
        actionDataLengthInput(index){
            let length = parseInt(this.fields[index].length || 0);
            if ( isNaN(length) || 0 >= length ) {
                length = 1;
            }
            
            let field = MyObject.copy(this.fields[index]);
            field.length = length;
            this.fields.splice(index, 1, field);
            this.updateVModel();
        },

        /**
         * event handler for filed value inputed
         * @param {Number} index
         */
        actionValueInput(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
            this.$forceUpdate();
        },

        /**
         * event handler for field value format changed.
         * if current value is able to convert to target format, the value would be changed.
         * @param {Number} index
         * @param {String} format
         */
        actionValueFormatChange(index, format) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }

            let oldFormatMapKey = this.fields[index].key;
            let value = this.fields[index]['value'].trim();
            if ( 0 == value.length || null != value.trim().match(/^\{\{.*?\}\}$/) ) {
                this.fieldValueFormatOldMap[oldFormatMapKey] = format;
                this.updateVModel();
                return;
            }

            let oldFormmat = this.fieldValueFormatOldMap[oldFormatMapKey];
            let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
            let radixMap = {bin:2,oct:8,dec:10,hex:16};
            try {
                let newValue = BigInt(`${prefixMap[oldFormmat]}${value}`);
                this.fields[index]['value'] = newValue.toString(radixMap[format]).toUpperCase();
                this.fieldValueFormatOldMap[oldFormatMapKey] = format;
                this.updateVModel();
                this.$forceUpdate();
            } catch {}
        },

        /**
         * event handler for field description input click
         * @param {Number} index
         */
        actionDescInputClick(index) {
            this.descEditorEnableKey = this.fields[index].key;
            this.$nextTick(() => this.$refs[`inputDesc_${index}`].focus());
        },

        /**
         * event handler for field description inputed
         * @param {Number} index
         */
        actionDescInput(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * event handler for field description textarea blur
         * @param {Number} index
         */
        actionDescBlur() {
            this.descEditorEnableKey = null;
        },
        
        /**
         * Append new field to fileld list.
         * @param {Number} index
         */
        appendNewField( index ) {
            let newItem = {
                key : (new Date()).getTime(),
                name : '',
                type : this.defaultDataType,
                value : '',
                format : 'hex',
                desc : '',
            };
            if ( undefined === index ) {
                this.fields.push(newItem);
            } else {
                this.fields.splice(index+1, 0, newItem);
            }
            this.fieldValueFormatOldMap[newItem.key] = newItem.format;
        },

        /**
         * event handler for filed value inputed
         * @param {Number} index
         */
        actionRowSettingChange(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
            this.$forceUpdate();
        },

        /**
         * event handler for field options button delete to delete selected row
         * @param {Number} index
         */
        actionRowDelete(index) {
            this.fields.splice(index, 1);
            if ( 0 == this.fields.length ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * event handler on row insert icon clicked.
         * @param {Number} index selected row index
         */
        actionRowInsert(index) {
            this.appendNewField(index);
            this.updateVModel();
        },

        /**
         * event handler for table row draged, if user move the field to the end
         * of list or the last field has been moved, a new item would be append to field list.
         * @param {Event} event
         */
        handleTableDraggableWrapperChanged(event) {
            this.updateVModel();
            if ( this.fields.length - 1 == event.moved.oldIndex ) {
                this.appendNewField();
            }
            if ( this.fields.length - 1 == event.moved.newIndex ) {
                this.appendNewField();
            }
        },

        /**
         * enable long value editor for given item
         * @param {Integer} index
         */
        actionLongValueInputClick(index) {
            this.longValueEditorEnableKey = this.fields[index].key;
            this.$nextTick(() => this.$refs[`inputLongValueEditor_${index}`].focus());
        },

        /**
         * disable long value editor
         */
        actionLongValueEditorBlur() {
            this.valueAutoCompleteItems = [];
            this.longValueEditorEnableKey = null;
        },

        /**
         * watch handler for default data type changed
         */
        onDefaultDataTypeChanged() {
             if ( 1 === this.fields.length 
                && 0 === this.fields[0].name.trim().length
                && 0 === this.fields[0].value.trim().length
                && 0 === this.fields[0].desc.trim().length
            ) {
                this.fields = [];
                this.appendNewField();
            }
        },

        /**
         * event handler on field file changed
         */
        actionValueFileChange(event, index) {
            this.fields[index].value = event.file.path;
            this.actionValueInput(index);
        },

        /**
         * event handler on value auto complete start to search
         */
        actionValueAutoCompleteSearch( searchText ) {
            this.valueAutoCompleteItems = [];
            if ( 0 == searchText.trim().length ) {
                return;
            }
            let matchText = searchText.substr(searchText.lastIndexOf("{{@"));
            searchText = searchText.substr(0, searchText.lastIndexOf("{{@"));

            let quickCallFullList = QuickCallLib.list();
            for ( let i=0; i<quickCallFullList.length; i++ ) {
                let match = `{{@${quickCallFullList[i].func}(`;
                if ( !matchText.startsWith('{{@') || -1 == match.indexOf(matchText) ) {
                    continue;
                }
                quickCallFullList[i].value = `${searchText}${quickCallFullList[i].value}`;
                this.valueAutoCompleteItems.push(quickCallFullList[i]);
            }
        },

        /**
         * event handler on value auto complete blur
         */
        actionValueAutoCompleteBlur () {
            this.valueAutoCompleteItems = [];
        }
    },
}
</script>
<style>
.directive-parameter-editor-form-table td {padding: 3px 3px !important;}
.directive-parameter-editor-form-table th {padding: 3px 3px !important;}
.directive-parameter-editor-form-value-select .ant-select-selection {background: #f6f6f6;color: #cfcfcf;}
</style>