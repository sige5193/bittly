<template>
  <div class="p-2 overflow-y-auto">
    <div class="content-center" v-if="0 === entries.length">
      <a-empty :description="false" />
    </div>
    <div ref="dataEntryList" class="h-100 overflow-y-auto" v-else>
      <div v-for="(entry,index) in filteredEntries" :key="index" :class="`mb-1 data-entry-${entry.dir}`">
        <div>
          <small>
            {{formatAsTimeDotMS(entry.time)}} 
            {{formatAsSize(entry.data.length)}} 
            [{{'send' === entry.dir ? '=&gt;' : '&lt;='}} {{entry.name}}]
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
         * name of viewer mode
         * @protected {String}
         */
        mode : {},
        /**
         * setting of filter
         * @protected {Object}
         */
        filter : {},
        /**
         * list of entries
         * @property {Array<Object>}
         */
        initEntries : [],
    },
    data() {
        return {
            /**
             * list of entries
             * @property {Array<Object>}
             */
            entries : [],
        };
    },
    created() {
        for ( let i=0; i<this.initEntries.length; i++ ) {
            this.entries.push(this.initEntries[i]);
        }
    },
    computed : {
        /**
         * generate list entries
         * @returns {Array<Object>}
         */
        filteredEntries() {
            let filter = this.filter || {};
            let entries = [];
            for ( let i=0;i<this.entries.length; i++ ) {
                let entry = this.entries[i];
                let ignore = false;
                
                let filterDir = filter.direction || 'all';
                if ( 'all' !== filterDir && entry.dir !== filterDir ) {
                    ignore = true;
                }

                let filterName = filter.name || '';
                if ( !ignore && '' !== filterName && -1 === entry.name.indexOf(filterName) ) {
                    ignore = true;
                }

                let filterContent = filter.content || '';
                if ( !ignore && '' !== filterContent ) {
                    let entryContent = Buffer.from(entry.data).toString('text'===this.mode ? '' : 'hex');
                    if ( -1 === entryContent.indexOf(filterContent) ) {
                        ignore = true;
                    }
                }

                if ( !ignore ) {
                    entries.push(entry);
                }
            }
            return entries;
        }
    },
    methods : {
        /**
         * push entry item to entry list.
         * @param {Object} item
         */
        async entryItemPush( item ) {
            this.entries.push(item);
            await this.$nextTick();
            let listContainer = this.$refs.dataEntryList;
            listContainer.scrollTop = listContainer.scrollHeight;
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