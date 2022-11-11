<template>
  <div ref="viewer" class="border rounded h-100 overflow-auto">
    <a-empty v-if="0 == responseList.length" class="mt-5" :description="false"/>
    <virtual-list v-else ref="virtualList" class="h-100 overflow-y-auto"
      :keeps="30"
      :data-key="'key'"
      :data-sources="responseList"
      :data-component="entryItem"
      :extra-props="{directive}"
    />
  </div>
</template>
<script>
import PreserveViewerDataEntryItem from './PreserveViewerDataEntryItem.vue'
import VirtualList from 'vue-virtual-scroll-list'
export default {
    name : 'DirectiveResponseHexPreserveViewer',
    components: { 
        'virtual-list' : VirtualList,
    },
    props : {
        /**
         * list of response data.
         * @property {Array}
         */
        responseList : {},
    },
    data() {
        return {
            /**
             * data entry item
             * @property {EntryItem}
             */
            entryItem : PreserveViewerDataEntryItem,
        };
    },
    watch : {
        responseList () {
            this.$nextTick(() => this.$refs.virtualList.scrollToBottom());
        },
    },
}
</script>