<template>
  <div>
    <div class="summary border" @click="actionEnableFullEditor">{{generateFormValueText()}}</div>

    <a-modal v-if="fullEditorEnable" v-model="fullEditorEnable" width="1000px"
      :title="$t('mock.response.inlineEditorForm.fullTitle')"
      :bodyStyle="{padding:0}"
      :scroll="{y:'500px'}"
    >
      <a-table class="table-mini" 
        :pagination="false"
        :columns="formTableColumns" 
        :data-source="formFields"
      >
        <!-- name -->
        <div slot="name" slot-scope="text,record,index">
          <a-input size="small" class="border-none"
            v-model="record.name"
            @change="actionItemUpdated(index)"
          />
        </div>

        <!-- type -->
        <div slot="type" slot-scope="text,record,index">
          <a-select size="small" class="border-none w-100"
            v-model="record.type" 
            :dropdownMatchSelectWidth="false"
            @change="actionItemTypeUpdated(index)"
          >
            <a-select-option v-for="dataType in dataTypes"
              :key="dataType" :value="dataType"
            >{{ $t(`directive.parameter.form.dataType.${dataType}`)}}</a-select-option>
          </a-select>
        </div>

        <!-- value -->
        <div slot="value" slot-scope="text,record,index" class="d-flex flex-dir-row">
          <div v-if="true == $dict.voption('DIRECTIVE_PARAM_DATATYPE',record.type,'unsigned',null)" class="pr-1">
            <a-select size="small" class="border-none bg-light-2 rounded text-muted-2"
              v-model="record.format" 
              @change="actionItemFormatUpdated(index)"
            >
              <a-select-option value="bin">BIN</a-select-option>
              <a-select-option value="oct">OCT</a-select-option>
              <a-select-option value="dec">DEC</a-select-option>
              <a-select-option value="hex">HEX</a-select-option>
            </a-select>
          </div>
          <a-input size="small" class="border-none" 
            v-model="record.value"
            @change="actionItemUpdated(index)"
          />
        </div>

        <!-- description -->
        <div slot="desc" slot-scope="text,record,index">
          <a-input size="small" class="border-none" 
            v-model="record.desc"
            @change="actionItemUpdated(index)"
          />
        </div>

        <!-- options -->
        <div slot="operations" slot-scope="text,record,index" :data-name="record.name">
          <a-switch v-model="record.isBigEndian" class="mr-1"
            style="vertical-align: baseline;"
            :checked-children="$t('mock.response.inlineEditorForm.endianessBig')" 
            :un-checked-children="$t('mock.response.inlineEditorForm.endianessLittle')" 
            @change="actionItemUpdated(index)"
          />
          <a-button size="small" class="mr-1" @click="actionItemMove(index,-1)"><a-icon type="caret-up" /></a-button>
          <a-button size="small" class="mr-1" @click="actionItemMove(index,1)"><a-icon type="caret-down" /></a-button>
          <a-button size="small" @click="actionItemDelete(index)"><a-icon type="delete" /></a-button>
        </div>
      </a-table>
      <template slot="footer">
        <a-button type="primary" @click="actionOk">{{$t('button.ok')}}</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject';
export default {
    name : 'MockResponseInlineEditorForm',
    props : {
        /**
         * form options to edit
         * @property {Object}
         */
        value : {}
    },
    data() {
        return {
            /**
             * indicate if full editor enabled.
             * @property {Boolean}
             */
            fullEditorEnable : false,
            /**
             * list of fields
             * @property {Array<Object>}
             */
            formFields : [],
            /**
             * list of field columns
             * @property {Array<Object>}
             */
            formTableColumns : [
                {title:this.$t('mock.response.inlineEditorForm.columnName'),scopedSlots:{customRender:'name'}},
                {title:this.$t('mock.response.inlineEditorForm.columnType'),scopedSlots:{customRender:'type'}},
                {title:this.$t('mock.response.inlineEditorForm.columnValue'),scopedSlots:{customRender:'value'}},
                {title:this.$t('mock.response.inlineEditorForm.columnDesc'),scopedSlots:{customRender:'desc'}},
                {title:'',scopedSlots:{customRender:'operations'},align:'right'},
            ],
            /**
             * list of data type names
             * @property {Array<String>}
             */
            dataTypes : [
                'byte','char_int','char','unsigned_char','short','unsigned_short',
                'int','unsigned_int','long','unsigned_long','long_long','unsigned_long_long',
                'float','double','string','bytes'
            ],
        };
    },
    created() {
        let value = this.value;
        if ( undefined == value ) {
            value = {};
        }

        this.formFields = value.content;
        if ( undefined === this.formFields ) {
            this.formFields = [];
        }
        this.appendNewFormField();
    },
    methods : {
        /**
         * add new form item to list.
         */
        appendNewFormField() {
            this.formFields.push({
                key:(new Date()).getTime(),
                name:'',
                type:'byte',
                format : 'hex',
                value:'',
                desc:''
            });
        },

        /**
         * generatae form value text
         * @returns {String}
         */
        generateFormValueText() {
            if ( 1 == this.formFields.length ) {
                return this.$t('mock.response.inlineEditorForm.empty');
            }

            let values = [];
            for ( let i=0; i<this.formFields.length-1; i++ ) {
                let item = this.formFields[i];
                values.push(`${item.name}:${item.value}`);
            }
            return values.join('; ');
        },

        /**
         * enable full editor
         */
        actionEnableFullEditor() {
            this.fullEditorEnable = true;
        },

        /**
         * event handler on field changed
         * @param {Number} index
         */
        actionItemUpdated( index ) {
            if ( index == this.formFields.length - 1 ) {
                this.appendNewFormField();
            }

            let formFields = MyObject.copy(this.formFields);
            formFields.pop();
            
            let newValue = this.value;
            if ( undefined == newValue ) {
                newValue = {};
            }
            newValue.content = formFields;
            this.$emit('input', newValue);
            this.$emit('change');
            this.$forceUpdate();
        },

        /**
         * event handler on field data type changed.
         * @param {Number} index
         */
        actionItemTypeUpdated( index ) {
            let type = this.formFields[index].type;
            this.formFields[index].format = '';
            if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',type,'unsigned', null) ) {
                this.formFields[index].format = 'hex';
            }
            
            this.formFields[index].value = '';
            this.actionItemUpdated(index);
        },

        /**
         * event handler on field data format changed.
         * @param {Number} index
         */
        actionItemFormatUpdated(index) {
            this.formFields[index].value = '';
            this.actionItemUpdated(index);
        },

        /**
         * move item by given offset
         * @param {Number} index
         * @param {Number} offset
         */
        actionItemMove(index, offset) {
            let target = index + offset;
            if ( 0 > target || target >= this.formFields.length ) {
                return ;
            }
            
            let tmp = MyObject.copy(this.formFields[target]);
            this.formFields.splice(target, 1, this.formFields[index]);
            this.formFields.splice(index, 1, tmp);
            this.actionItemUpdated(index);
        },

        /**
         * delete item by given index
         * @param {Number} index
         */
        actionItemDelete(index) {
            this.formFields.splice(index, 1);
            this.actionItemUpdated(index);
        },

        /**
         * event handelr after done editting.
         */
        actionOk() {
            this.fullEditorEnable = false;
        }
    },
}
</script>
<style scoped>
.summary {
    height: 24px;
    word-break: break-all;
    overflow: hidden;
    border-radius: 3px;
    padding: 0 5px;
    background: white;
}
.summary:hover {
    border-color: #40a9ff !important;
}
</style>