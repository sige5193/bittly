<template>
  <div class="border-bottom d-flex flex-dir-row" v-if="null != source.data && 0 < source.data.length">
    <div class="bg-light-2 border-right pl-1 pr-1 d-flex align-items-center">
      <span class="pr-3">{{index+1}}</span> 
      <small>{{formatResponseTime(source.time)}}</small>
    </div>
    <div class="directive-response-text-entry-content d-inline-block pl-1 pr-1 word-break-all flex-grow">
      {{formatResponseData(source.data)}} &nbsp;
    </div>
  </div>
</template>
<script>
import Formatter from '../../../../utils/Formatter.js'
import Common from '../../../../utils/Common.js'
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
      directive : {type:Object}
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
            let content = Common.charsetConvert(data,'utf-8',this.directive.responseCharset);
            return content.toString();
        }
    },
}
</script>