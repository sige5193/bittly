<template>
  <div class="border rounded h-100 d-flex flex-dir-column">
    <!-- header toolbar -->
    <div class="bg-light p-1 toolbox">
      <a-radio-group ref="radioGroupViewMode" size="small" v-model="mode">
        <a-radio-button value="form"><a-icon type="align-left" /></a-radio-button>
        <a-radio-button value="table"><a-icon type="ordered-list" /></a-radio-button>
      </a-radio-group>
      
      <a-tooltip>
        <template slot="title">
          {{$t('directive.response.form.parseToLast')}}
        </template>
        <a-button ref="btnParseToLast" size="small" class="ml-1" 
          :type="parseToLastEnable ? 'primary' : 'default'" 
          @click="actionParseToLastEnableToggle"
        ><a-icon type="vertical-left" /></a-button>
      </a-tooltip>

      <a-input type="number" class="d-inline-block ml-1" size="small" style="width:180px;"
        min="0" step="1"
        v-model="startOffset"
        :addon-before="$t('directive.response.form.startOffset')"
        @change="actionStartOffsetChange"
      />
    </div>

    <!-- mode : table -->
    <div v-if="'table' == mode" ref="viewerTableContainer" class="overflow-x-auto h-0 flex-grow-1">
      <table class="w-100 word-break-all">
      <tr v-for="(rowValues, index) in valuesList" :key="index" class="border-bottom viewer-table-row">
        <td class="bg-light border-right pl-1 pr-1" style="width: 5%;">
          <div class="d-inline-block text-body">{{index+1}}</div>
        </td>
        <td class="pl-1 pr-1 pt-1 data-cell" style="width: 95%;">
          <div 
            v-for="(attr,index) in formatResponseValues(rowValues)" :key="index" 
            class="d-inline-block border mr-1 pr-1 mb-1 rounded"
          >
            <div class="d-inline-block bg-secondary rounded-left pl-1 pr-1 text-white">{{attr.name}}</div>
            {{attr.prefix}}{{attr.value}}
          </div>
        </td>
      </tr>
    </table>
    </div>

    <!-- mode : form -->
    <div v-if="'form' == mode" class="content">
      <a-table 
        bordered 
        class="directive-response-form-table"
        :columns="tableColumns" 
        :data-source="fields" 
        :pagination="false"
        :components="tableComponents"
      >
        <!-- Field Name -->
        <div slot="name" slot-scope="text, record, index">
          <a-input size="small" class="border-none"
            :ref="`inputName_${index}`"
            v-model="fields[index]['name']" 
            @input="actionNameInput(index)"
          />
        </div>
      
        <!-- Field Data Type -->
        <div slot="type" slot-scope="text, record, index">
          <a-select size="small" 
            :class="0 == $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'length',0) ? `border-none w-80` : `border-none w-100`"
            :ref="`selectDataType_${index}`"
            :dropdownMatchSelectWidth="false"
            v-model="fields[index]['type']" 
            @change="actionTypeChange(index, $event)"
          >
            <template v-for="dataType in dataTypes">
              <a-select-option 
                :key="dataType"
                :value="dataType"
              >{{ $t(`directive.parameter.form.dataType.${dataType}`)}}</a-select-option>
            </template>
          </a-select>
       
          <!-- Data Type Length -->
          <a-input-number size="small"
            v-if="0 == $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'length',0)" 
            v-model="fields[index]['length']"
            class="w-20 border-none"
            :min="1"
            :placeholder="$t('directive.response.form.dataLengthPlaceholder')"
            :ref="`inputDataLength_${index}`"
            @change="actionDataLengthInput(index)"
          />
        </div>
      
        <!-- Field Value -->
        <div slot="value" slot-scope="text, record, index">
          <a-input size="small" class="border-none"
            v-if="
              $dict.match('DIRECTIVE_PARAM_DATATYPE','STRING',record.type)
              || record.expression
            " 
            v-model="values[index]"
            disabled
            :ref="`inputValueString_${index}`"
          />
          <a-input size="small" class="border-none"
            v-else-if="false === $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'unsigned', false)" 
            v-model="values[index]" 
            disabled
            :ref="`inputValue_${index}`"
          />
          <div v-else class="d-flex flex-dir-row">
            <a-select :ref="`selectValueFormat_${index}`"
              v-model="fields[index]['format']" size="small" 
              class="border-none bg-light-2 rounded text-muted-2"
              @change="actionValueFormatChange(index)"
            >
              <a-select-option value="bin">BIN</a-select-option>
              <a-select-option value="oct">OCT</a-select-option>
              <a-select-option value="dec">DEC</a-select-option>
              <a-select-option value="hex">HEX</a-select-option>
            </a-select>

            <a-input size="small" class="border-none ml-1"
              disabled 
              v-model="values[index]"
              :ref="`inputValueUnsigned_${index}`"
            />
          </div>
        </div>

        <!-- Field Description -->
        <div slot="desc" slot-scope="text, record, index">
          <a-input size="small"
            class="border-none"
            v-model="fields[index]['desc']"
            :ref="`inputDesc_${index}`"
            @input="actionDescInput(index)" 
          />
        </div>
      
        <!-- Field Operations -->
        <div slot="action" slot-scope="text, record, index">
          <viewer-field-setting v-model="fields[index]" @change="actionRowSettingChange(index)"/>
          <a-icon :ref="`iconRowInsert_${index}`" type="plus-square" @click="actionRowInsert(index)" class="mr-1" />
          <a-icon :ref="`iconRowDelete_${index}`" type="delete" class="mr-1"
            :data-text="text" 
            @click="actionRowDelete(index)" 
          />
          <a-icon type="swap" :rotate="90" class="drag-handler" style="cursor: s-resize;"/>
        </div>
      </a-table>
    </div>
  </div>
</template>
<script>
import ViewerFieldSetting from './ViewerFieldSetting.vue'
import TableDraggableWrapper from '@/components/TableDraggableWrapper.vue'
import ViewerMixin from '../ViewerMixin.js'
import Common from '@/utils/Common.js'
import ResponseParser from './ResponseParser.js'
export default {
    name : 'BlockResponseViewerFrorm',
    mixins : [ViewerMixin],
    components : {
        'viewer-field-setting' : ViewerFieldSetting,
    },
    props: {
        /**
         * the directive model to edit
         * @property {MdbDirective}
         */
        value:{},
        /**
         * response data buffer
         * @property {Buffer}
         */
        content:{},
    },
    data() {
        return {
            /**
             * @property {MdbDirective}
             */
            directive : null,
            /**
             * name of view mode, 'form' and 'table' are supported
             * @property {String}
             */
            mode : 'form',
            /**
             * @property {Array<Object>}
             */
            fields : [],
            /**
             * @property {Boolean}
             */
            parseToLastEnable : false,
            /**
             * values of single response
             * @property {Array}
             */
            values : [],
            /**
             * list of values for table mode
             * @property {Array}
             */
            valuesList : [],
            /**
             * value for a-table prop `tableComponents`
             * @property {Object}
             */
            tableComponents: {
                body: {
                    wrapper: TableDraggableWrapper,
                },
            },
            /**
             * instance of response paser.
             * @property {ResponseParser|null}
             */
            parser : null,
            /**
             * values of datatype
             * @property {String[]}
             */
            dataTypes : [
                'byte','char_int','char','unsigned_char','short','unsigned_short','int','unsigned_int',
                'long','unsigned_long','long_long','unsigned_long_long','float','double','string','bytes'
            ],
            /**
             * address offset to start parser
             * @property {Number}
             */
            startOffset : 0,
        };
    },
    provide() {
        return {
            tableDraggableWrapperSource: this,
            tableDraggableWrapperAttrName : 'fields',
        };
    },
    computed : {
        /**
         * @returns {Array<Object>}
         */
        tableColumns() {
            return [
                {title: this.$t('directive.response.form.fieldName'), dataIndex: 'name',scopedSlots: { customRender: 'name' },className:'white-space-nowrap'},
                {title: this.$t('directive.response.form.fieldType'),dataIndex: 'type',scopedSlots: { customRender: 'type' },className:'white-space-nowrap'},
                {title: this.$t('directive.response.form.fieldValue'),dataIndex: 'value',scopedSlots: { customRender: 'value' },className:'white-space-nowrap'},
                {title: this.$t('directive.response.form.fieldDesc'),dataIndex: 'desc',scopedSlots: { customRender: 'desc' },className:'white-space-nowrap'},
                {title: this.$t('directive.response.form.fieldOperations'),key: 'action',scopedSlots: { customRender: 'action' }, className:'text-right white-space-nowrap'},
            ];
        },
    },
    watch : {
        value() {
            this.initVModel();
        },
        content() {
            this.updateFormValues();
        },
    },
    created () {
        this.initVModel();
    },
    methods : {
        /**
         * init v-model
         */
        initVModel() {
            this.fields = [];
            this.directive = this.value;
            if ( undefined != this.directive.responseFormatter.fields ) {
                this.fields = Common.objCopy(this.directive.responseFormatter.fields);
            }
            this.appendNewField();
            this.updateFormValues();
        },

        /**
         * update v-model
         */
        updateVModel() {
            let fields = [];
            for ( let i=0; i<this.fields.length-1; i++ ) {
                fields.push(this.fields[i]);
            }

            let formatter = Common.objCopy(this.directive.responseFormatter);
            formatter.fields = fields;
            this.directive.responseFormatter = formatter;
            this.$emit('input', this.directive);
            this.updateFormValues();
        },

        /**
         * event handler on start offset changed
         */
        actionStartOffsetChange() {
            let offset = parseInt(this.startOffset);
            if ( isNaN(offset) || 0 > offset ) {
                return ;
            }
            if ( null !== this.parser ) {
                this.parser.setCursor(offset);
            }
            this.updateFormValues();
        },

        /**
         * event handler for field name input event.
         * @param {Number} index
         */
        actionNameInput(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * event handler for field data type changed
         * @param {Number} index
         */
        actionTypeChange(index) {
            if ( index == this.fields.length - 1 ) {
                this.appendNewField();
            }
            
            let type = this.fields[index].type;
            
            // we set default length to 1 to prevent endless loop
            // @link https://git.sigechen.com/sige/bittly/issues/43
            this.fields[index].length = this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',type,'length', 1);
            
            this.updateVModel();
        },

        /**
         * event handler for field data length input
         * @param {Number} index
         */
        actionDataLengthInput(index){
            let length = parseInt(this.fields[index].length);
            if ( isNaN(length) || 0 >= length ) {
                length = 1;
            }
            this.fields[index].length = length;
            this.updateVModel();
        },

        /**
         * event handler for field data format changed
         * @param {Number} index
         */
        actionValueFormatChange(index) {
            if ( index*1 === this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * event handler for field description input.
         * @param {Number} index
         */
        actionDescInput( index ) {
            if ( index*1 === this.fields.length - 1 ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * event handler on field expression updated
         */
        actionRowSettingChange(index) {
            if ( index*1 === this.fields.length - 1 ) {
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
         * event handler to handle row deletion.
         * @param {Number} index
         */
        actionRowDelete(index) {
            this.fields.splice(index, 1);
            if ( 0 == this.fields.length || index == this.fields.length ) {
                this.appendNewField();
            }
            this.updateVModel();
        },

        /**
         * append new field to form list
         */
        appendNewField(index) {
            let item = {
                key : (new Date()).getTime(),
                name : '',
                type : 'byte',
                value : '',
                format : 'hex',
                length : 1,
                desc : '',
            };
            if ( undefined === index ) {
                this.fields.push(item);
            } else {
                this.fields.splice(index+1,0,item);
            }
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
         * enable / disable parse to last.
         */
        actionParseToLastEnableToggle() {
            if ( null !== this.parser ) {
                this.parser.setCursor(0);
            }
            this.parseToLastEnable = !this.parseToLastEnable;
            this.updateFormValues();
        },

        /**
         * refresh form value
         */
        updateFormValues() {
            this.values = [];
            if ( null === this.parser ) {
                this.parser = new ResponseParser(this.directive, this.content, false);
            }
            this.parser.setResponseBuffer(this.content);
            
            if ( this.parseToLastEnable ) {
                this.valuesList = this.parser.parseToLast();
                this.values = this.parser.getValues();
            } else {
                let offset = parseInt(this.startOffset);
                if ( isNaN(offset) || 0 > offset ) {
                    offset = 0;
                }
                this.parser.setCursor(offset);
                this.parser.parse();
                this.values = this.parser.getValues();
                this.valuesList = [this.values];
            }
            this.$forceUpdate();
            
            if ( 'table' == this.mode ) {
                let viewerTableContainer = this.$refs.viewerTableContainer;
                this.$nextTick(() => viewerTableContainer.scrollTop = viewerTableContainer.scrollHeight);
            }
        },

        /**
         * format response data as string for table viewer
         * @param {Object} rowValues
         * @returns {Array}
         */
        formatResponseValues( rowValues ) {
            let attributes = [];
            let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
            for ( let i=0; i<this.fields.length-1; i++ ) {
                let attr = {};
                let field = this.fields[i];
                let name = field.name;
                if ( 0 == field.name.trim().length ) {
                    name = `$${i}`;
                }

                let prefix = null;
                if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',field.type,'unsigned', false) ) {
                    prefix = prefixMap[field.format];
                }

                attr.name = name;
                attr.value = rowValues[i];
                attr.prefix = prefix;
                attributes.push(attr);
            }
            return attributes;
        },

        /**
         * export response as excel file.
         */
        exportAsExcel() {
            if ( undefined == this.directive.responseFormatter.fields 
            || 0 == this.directive.responseFormatter.fields.length ) {
                this.$message.error(this.$t('directive.response.form.saveAsExcelFieldListEmpty'));
                return ;
            }

            let options = null;
            if ( 'table' == this.mode ) {
                options = this.generateExcelOptionForMutilResponse();
            } else {
                options = this.generateExcelOptionForSingleResponse();
            }
            this.generateResponseExcelFile(options);
        },

         /**
         * generate excel options for table mode response
         */
        generateExcelOptionForMutilResponse() {
            let options = {};
            options.columns = [];
            for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                let head = {};
                head.header = this.directive.responseFormatter.fields[i].name;
                if ( '' == head.header.trim() ) {
                    head.header = `$${i+1}`;
                }
                head.key = `h${i}`;
                options.columns.push(head);
            }

            let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
            let parser = new ResponseParser(this.directive, this.content);
            let valuesList = parser.parseToLast();
            options.data = [];
            for ( let i=0; i<valuesList.length; i++ ) {
                let item = valuesList[i];
                let row = {};

                for ( let j=0; j<this.directive.responseFormatter.fields.length; j++ ) {
                    let field = this.directive.responseFormatter.fields[j];
                    let prefix = '';
                    if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',field.type,'unsigned', false) ) {
                        prefix = prefixMap[field.format];
                    }
                    row[`h${j}`] = prefix + item[j];
                }
                options.data.push(row);
            }
            return options;
        },

        /**
         * generate excel options for single response
         */
        generateExcelOptionForSingleResponse() {
            let options = {};
            options.columns = [
                {header: this.$t('directive.response.form.fieldName'), key: 'name',},
                {header: this.$t('directive.response.form.fieldType'), key: 'type',},
                {header: this.$t('directive.response.form.fieldValue'),key: 'value',},
                {header: this.$t('directive.response.form.fieldDesc'), key: 'desc',},
            ];

            let parser = new ResponseParser(this.directive, this.content);
            options.data = [];
            for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                let item = this.directive.responseFormatter.fields[i];
                let row = {};
                row.name = item.name;
                if ( '' == row.name.trim() ) {
                    row.name = `$${i+1}`;
                }

                row.type = this.$t(`directive.parameter.form.dataType.${item.type}`);
                row.desc = item.desc;

                let prefix = '';
                let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
                if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'unsigned', false) ) {
                    prefix = prefixMap[item.format];
                }

                row.value = prefix + parser.getValueByIndex(i);
                options.data.push(row);
            }
            return options;
        }
    },

    /**
     * generate testcase expect content from response.
     * @param {MdbDirective} directive
     * @param {Buffer} response
     * @returns {String}
     */
    generateTestcaseExpectContentFromResponse( directive, response ) {
        if ( undefined == directive.responseFormatter.fields ) {
            return '';
        }

        let attributes = [];
        let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
        let parser = new ResponseParser(directive, response);
        for ( let i=0; i<directive.responseFormatter.fields.length; i++ ) {
            let attr = Common.objCopy(directive.responseFormatter.fields[i]);
            attr.prefix = null;
            if ( true == window.app.$dict.voption('DIRECTIVE_PARAM_DATATYPE',attr.type,'unsigned', false) ) {
                attr.prefix = prefixMap[attr.format];
            }
            attr.value = parser.getValueByIndex(i);
            attr.comparator = 'Equal';
            attributes.push(attr);
        }
        return attributes;
    },
}
</script>
<style scoped>
.content {flex-grow: 1;height: 0;overflow: auto;}
.viewer-table tbody {display: block;height: 195px;overflow-y: scroll;}
.viewer-table thead, .viewer-table tbody tr {display: table;width: 100%;table-layout: fixed;}
.viewer-table thead th {background: #f8f9fa;border-top: solid 1px #e1e5e8;padding: 2px 0;border-bottom: solid 1px #e1e5e8;}
.viewer-table-row:nth-child(even){background-color:#f4f4f4;}
</style>
<style>
.directive-response-form-table td {padding: 3px 3px !important;}
.directive-response-form-table th {padding: 3px 3px !important;}
</style>