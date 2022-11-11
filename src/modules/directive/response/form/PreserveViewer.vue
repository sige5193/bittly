<template>
  <div ref="viewer" class="border rounded h-100 d-flex flex-dir-column">
    <div class="border-bottom p-1 bg-light">
      <a-input-group compact class="my-input-group w-100">
        <span class="label label-sm">{{$t('directive.parameter.form.preserveFieldFilter')}}</span>
        <a-select v-model="fieldsFilter" mode="multiple" size="small" class="input">
          <a-select-option v-for="dirField in directiveFieldList" :key="dirField.index">
            {{dirField.name}}
          </a-select-option>
        </a-select>
      </a-input-group>
    </div>
    
    <div class="flex-grow h-0">
      <a-empty v-if="0 == responseList.length" class="mt-5" :description="false"/>
      <virtual-list v-else ref="virtualList" class="h-100 overflow-y-auto"
        :keeps="30"
        :data-key="'key'"
        :data-sources="responseList"
        :data-component="entryItem"
        :extra-props="{directive,fieldsFilter}"
      />
    </div>
  </div>
</template>
<script>
import ViewerMixin from '../ViewerMixin.js'
import ResponseParser from './ResponseParser.js'
import Formatter from '../../../../utils/Formatter'
import MyDate from '../../../../utils/datatype/MyDate.js'
import PreserveViewerDataEntryItem from './PreserveViewerDataEntryItem.vue'
import VirtualList from 'vue-virtual-scroll-list'
export default {
    name : 'DirectiveResponseFormPreserveViewer',
    mixins : [ ViewerMixin ],
    components: { 
        'virtual-list' : VirtualList,
    },
    props : {
        /**
         * list of response data.
         * @property {Array}
         */
        responseList : {},
        /**
         * instance of directive
         * @property {MdbDirective}
         */
        directive : {},
    },
    data() {
        return {
            /**
             * data entry item
             * @property {EntryItem}
             */
            entryItem : PreserveViewerDataEntryItem,
            /**
             * list of directive fields
             * @property {Array}
             */
            directiveFieldList : [],
            /**
             * list of directive fields to show in response list
             * @property {Array}
             */
            fieldsFilter : [],
        };
    },
    watch : {
        responseList () {
            if ( 0 < this.responseList.length ) {
                this.$nextTick(() => this.$refs.virtualList.scrollToBottom());
            }
        },
    },
    mounted() {
        this.init();
    },
    methods : {
        /**
         * init component
         */
        init () {
            this.directiveFieldList = [];
            if ( undefined == this.directive.responseFormatter.fields ) {
                return ;
            }
            for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                let field = this.directive.responseFormatter.fields[i];
                let name = field.name;
                if ( 0 == field.name.trim().length ) {
                    name = `$${i}`;
                }
                this.directiveFieldList.push({index:i,name:name});
            }
        },

        /**
         * format time to string as '00:00:00.123'
         * @param {String} time
         * @returns {String}
         */
        formatResponseTime( time ) {
            return Formatter.asTimeDotMS(time);
        },

        /**
         * export response as excel
         */
        exportAsExcel(){
            if ( undefined == this.directive.responseFormatter.fields ) {
                return ;
            }

            let options = {};
            options.columns = [
                {header:this.$t('directive.response.form.preserveExportRowRowId'),key:'rowId'},
                {header:this.$t('directive.response.form.preserveExportRowTime'),key:'time'}
            ];
            for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                let field = this.directive.responseFormatter.fields[i];
                let name = field.name;
                if ( 0 == field.name.trim().length ) {
                    name = `$${i}`;
                }
                options.columns.push({header:name, key:`col_${i}`});
            }
            
            let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
            options.data = [];
            for ( let i=0; i<this.responseList.length; i++ ) {
                let response = this.responseList[i];
                let parser = new ResponseParser(this.directive, response.data);
                
                let row = {};
                row.rowId = i+1;
                row.time = MyDate.formatAsDateTimeDotMs(response.time);
                for ( let ai=0; ai<this.directive.responseFormatter.fields.length; ai++ ) {
                    let field = this.directive.responseFormatter.fields[ai];
                    let value = parser.getValueByIndex(ai);
                    let prefix = '';
                    if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',field.type,'unsigned', false) ) {
                        prefix = prefixMap[field.format];
                    }

                    row[`col_${ai}`] = prefix + value;
                }
                options.data.push(row);
            }
            this.generateResponseExcelFile(options);
        },
    },
}
</script>