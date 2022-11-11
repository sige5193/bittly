<template>
  <a-collapse class="directive-responser-stream-viewer-collapse" :bordered="false" expand-icon-position="right">
    <a-collapse-panel :key="source.key">
      <div slot="header">
        <a-row>
          <a-col :span="20" class="collapse-title">
            <a-icon v-if="'receive' == source.dir" type="down-circle" :style="{ fontSize: '12px', color: '#08c' }"/> 
            <a-icon v-if="'send' == source.dir" type="up-circle" :style="{ fontSize: '12px', color: '#54cc00' }"/> 
            <span class="pl-1 text-muted">{{getEntryContent(source)}}</span>
          </a-col>
          <a-col :span="4" class="text-right" style="padding-right:20px;">
            <small class="text-muted">{{getEntrySize(source)}} {{getEntryTime(source)}}</small>
          </a-col>
        </a-row>
      </div>
      <pre class="entry-content">{{getEntryContent(source)}}</pre>
    </a-collapse-panel>
  </a-collapse>
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
       * mode name to show data content
       * @property {String}
       */
      mode: {type:String,default:'text'},
      /**
       * instance of directive
       * @property {MdbDirective}
       */
      directive : {type:Object}
    },
    methods : {
        /**
         * get entry size
         * @param {Number} index
         * @return {String}
         */
        getEntrySize( entry ) {
            return Formatter.asFileSize(entry.data.length);
        },

        /**
         * get entry content
         * @param {Number} index
         * @return {String}
         */
        getEntryContent( entry ) {
            let data = entry.data;
            if ( 'text' === this.mode ) {
                return Common.charsetConvert(Buffer.from(data),'utf-8', this.directive.responseCharset);
            } else {
                return Common.convertBufferToHexString(data);
            }
        },

        /**
         * get entry time
         * @param {Number} index
         * @return {String}
         */
        getEntryTime( entry ) {
            return Formatter.asTimeDotMS(entry.time);
        },
    },
}
</script>
<style scoped>
.entry-content {background: white;white-space: pre-wrap;word-break: break-all;user-select: text;padding: 5px;border-radius: 5px;}
.collapse-title {text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}
</style>
<style>
.directive-responser-stream-viewer-collapse .ant-collapse-header {padding: 5px 16px !important;}
</style>