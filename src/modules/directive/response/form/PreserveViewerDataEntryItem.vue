<template>
  <div class="border-bottom d-flex flex-dir-row" v-if="null != source.data && 0 < source.data.length">
    <div class="bg-light-2 border-right pl-1 pr-1 d-flex align-items-center">
      <span class="pr-3">{{index+1}}</span> 
      <small>{{formatResponseTime(source.time)}}</small>
    </div>
    <div class="directive-response-form-preserve-entry-content d-inline-block pl-1 pr-1 word-break-all flex-grow">
      <div v-for="(attr,findex) in formatResponseData(source.data)" :key="findex" 
        class="d-inline-block border mr-1 pr-1 rounded"
        style="margin-top: 2px;margin-bottom: 2px;"
      >
        <div class="d-inline-block bg-secondary rounded-left pl-1 pr-1 text-white">{{attr.name}}</div>
        {{attr.prefix}}{{attr.value}}
      </div>
      &nbsp;
    </div>
  </div>
</template>
<script>
import ResponseParser from './ResponseParser.js'
import Formatter from '../../../../utils/Formatter.js'
export default {
    name: 'BlockResponseViewerStreamEntryItem',
    props: {
      /**
       * index of data entry item
       * @property {Number}
       */
      index: {type: Number},
      /**
       * data entry object
       * @property {Object}
       */
      source: {type: Object,default () {return {}}},
      /**
       * instance of directive
       * @property {MdbDirective}
       */
      directive : {type:Object},
      /**
       * @property {Array}
       */
      fieldsFilter : {type:Array, default:()=>[]},
    },
    methods : {
        /**
         * format time to string as '00:00:00.123'
         * @param {String} time
         * @returns {String}
         */
        formatResponseTime( time ) {
            return Formatter.asTimeDotMS(time);
        },

        /**
         * format response data as string
         * @param {Buffer} data
         * @returns {String}
         */
        formatResponseData( data ) {
            if ( undefined == this.directive.responseFormatter.fields ) {
                return [];
            }

            let attributes = [];
            let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
            let parser = new ResponseParser(this.directive, data);
            for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                if ( 0 < this.fieldsFilter.length && -1 == this.fieldsFilter.indexOf(i) ) {
                    continue;
                }
                
                let attr = {};
                let field = this.directive.responseFormatter.fields[i];
                let name = field.name;
                if ( 0 == field.name.trim().length ) {
                    name = `$${i}`;
                }

                let prefix = null;
                if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',field.type,'unsigned', false) ) {
                    prefix = prefixMap[field.format];
                }

                attr.name = name;
                attr.value = parser.getValueByIndex(i);
                attr.prefix = prefix;
                attributes.push(attr);
            }
            return attributes;
        },
    },
}
</script>