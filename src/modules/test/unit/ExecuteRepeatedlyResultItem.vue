<template>
  <div :class="`result-item border-bottom ${source.status}`">
    <!-- header -->
    <p class="header" @click="isOpen=!isOpen">{{`${source.index} @ ${source.duration}`}}</p>
    
    <!-- body -->
    <div v-if="isOpen" class="p-3 bg-white">
      <a-alert v-if="null !== source.executor.error" type="error" show-icon
        :description="source.executor.error.toString()"
      />
      <template v-else>
        <strong class="d-block mb-2">{{$t('test.requestParams')}}</strong>
        <parameter-viewer-raw class="mb-3" mode="simple"
          :viewer="source.executor.directiveExecutor.customParamFormat"
          :directive="source.executor.directive"
          :executor="source.executor.directiveExecutor"
        ></parameter-viewer-raw>
        
        <strong class="d-block mb-2">{{$t('test.unit.responseValidate')}}</strong>
        <data-comparator-viewer :comparator="source.executor.comparator"/>
      </template>
    </div>
  </div>
</template>
<script>
import ParameterViewerRaw from '../../directive/parameters/ViewerRaw.vue'
import DataComparatorViewer from '../DataComparatorViewer.vue'
export default {
    name : 'TestUnitExecuteRepeatedlyResultItem',
    components : {
        'parameter-viewer-raw' : ParameterViewerRaw,
        'data-comparator-viewer' : DataComparatorViewer,
    },
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
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            isOpen : false,
        };
    },
}
</script>
<style scoped>
.result-item .header {margin:0;padding: 0.25rem 1rem !important;}
.result-item:hover {background: #f6f6f6 !important;}
.result-item.success {background: #e6ffe6;}
.result-item.failed {background: #ffe1e2;}
</style>