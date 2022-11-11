<template>
  <div class="win-request-log border h-0 flex-grow d-flex flex-dir-column">
    <a-row class="header">
      <a-col :span="2" class="table-cell">{{$t('panel.runMode.requestLog.headerTime')}}</a-col>
      <a-col :span="4" class="table-cell">{{$t('panel.runMode.requestLog.headerDirective')}}</a-col>
      <a-col :span="2" class="table-cell">{{$t('panel.runMode.requestLog.headerStatus')}}</a-col>
      <a-col :span="8" class="table-cell">{{$t('panel.runMode.requestLog.headerParams')}}</a-col>
      <a-col :span="8" class="table-cell">{{$t('panel.runMode.requestLog.headerResponse')}}</a-col>
    </a-row>

    <div class="request-log-list flex-grow h-0" ref="requestLogList">
      <a-empty v-if="0 == requests.length" class="mt-5" :description="false"/>
      <virtual-list v-else ref="virtualList" class="h-100 overflow-y-auto"
        :keeps="30"
        :data-key="'key'"
        :data-sources="requests"
        :data-component="entryItem"
        :extra-props="{directive}"
      />
    </div>
  </div>
</template>
<script>
import RequestLogViewerItem from './RequestLogViewerItem.vue'
import VirtualList from 'vue-virtual-scroll-list'
export default {
    name : 'RequestLogViewer',
    components: { 
        'virtual-list' : VirtualList,
    },
    props : {
        /**
         * @property {Object}
         */
        runtime : Object,
    },
    data() {
        return {
            /**
             * list of requests
             * @property {Array<Object>}
             */
            requests : [],
            /**
             * data entry item
             * @property {RequestLogViewerItem}
             */
            entryItem : RequestLogViewerItem,
        };
    },
    methods : {
        /**
         * refresh logs from runtime, and append new request to request list.
         */
        refresh() {
            for ( let i=this.requests.length; i<this.runtime.requests.length; i++ ) {
                this.requests.push(this.runtime.requests[i]);
            }

            this.$forceUpdate();
            if ( 0 < this.requests.length ) {
                this.$nextTick(() => this.$refs.virtualList.scrollToBottom());
            }
        },
    },
}
</script>
<style scoped>
.win-request-log .table-cell {
    border-right: solid 1px #d6d6d6;
    padding-left: 0.25rem !important;
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
}
.win-request-log .request-log-list {overflow-y: scroll;color: #979797;}
.win-request-log .header {font-weight:600;border-bottom:solid 1px #bfbfbf;padding-right: 5px;}
</style>