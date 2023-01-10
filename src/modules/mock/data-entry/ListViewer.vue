<template>
  <div class="p-2 overflow-y-auto">
    <div class="content-center" v-if="0 === entries.length">
      <a-empty :description="false" />
    </div>
    <div ref="dataEntryList" class="h-100 overflow-y-auto" v-else>
      <div v-for="(entry,index) in entries" :key="index" :class="`mb-1 data-entry-${entry.dir}`">
        <div>
          <small>
            {{formatAsTimeDotMS(entry.time)}} 
            {{formatAsSize(entry.data.length)}} 
            [{{entry.name}}]
          </small>
        </div>
        <div>
          <component 
            :is="`viewer-${entry.handler}`" 
            :entry="entry" 
            :mode="mode" 
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ViewerText from './ViewerText.vue'
import ViewerHex from './ViewerHex.vue'
import ViewerForm from './ViewerForm.vue'
import ViewerScript from './ViewerScript.vue'
import ViewerRandom from './ViewerRandom.vue'
import Formatter from '../../../utils/Formatter.js'
export default {
    components : {
        'viewer-Text' : ViewerText,
        'viewer-Hex' : ViewerHex,
        'viewer-Form' : ViewerForm,
        'viewer-Script' : ViewerScript,
        'viewer-Random' : ViewerRandom,
    },
    props : {
        /**
         * list of entries
         * @property {Array<Object>}
         */
        entries : {},
        /**
         * name of viewer mode
         * @protected {String}
         */
        mode : {},
    },
    methods : {
        /**
         * scroll to bottom
         * @public
         */
        scrollToBottom() {
            let listContainer = this.$refs.dataEntryList;
            this.$nextTick(() => listContainer.scrollTop = listContainer.scrollHeight);
        },

        /**
         * format time as time with ms
         * @returns {String}
         */
        formatAsTimeDotMS( time ) {
            return Formatter.asTimeDotMS(time);
        },

        /**
         * format number as file size
         * @returns {Number}
         */
        formatAsSize(number) {
            return Formatter.asFileSize(number);
        },
    },
}
</script>
<style scoped>
.data-entry-send .content {background: #f6f6f6;padding: 3px;border: solid 1px #eaeaea;color: #9f9f9f;user-select: text;}
.data-entry-receive .content {background: #f2fbff;padding: 3px;border: solid 1px #d5effc;color: #9f9f9f;user-select: text;}
</style>