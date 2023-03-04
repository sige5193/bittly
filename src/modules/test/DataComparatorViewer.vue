<template>
  <div style="max-width:500px;" class="cursor-default" >
    <!-- comparator mode : text -->
    <template v-if="'text' == comparator.type">
      <div>{{$t('test.comparatorMode')}} : TEXT </div>
      <div>
        {{$t('test.expectResponseContent')}} :
        <pre class="bg-light p-1 mb-1 text-muted white-space-pre-line word-break-all">{{comparator.expectData}}</pre>
        {{$t('test.actualResponseContent')}} :
        <pre class="bg-light p-1 mb-1 white-space-pre-line word-break-all">{{comparator.actualData}}</pre>
      </div>
    </template>

    <!-- comparator mode : hex -->
    <template v-else-if="'hex' == comparator.type">
      <div>{{$t('test.comparatorMode')}} : HEX </div>
      <div class="pre-content border rounded p-1 overflow-y-auto" style="max-height: 200px;">
        <div v-for="(byte,index) in getCompareDataHex()" :key="index" 
          :class="'data-compare-hex-byte ' + (byte.match ? 'success' : 'failed')"
        >
          <div class="expect">{{byte.expect}}</div>
          <div class="actual">{{byte.actual}}</div>
        </div>
      </div>
    </template>

    <!-- comparator mode : form -->
    <template v-else-if="'form' == comparator.type">
      <div>{{$t('test.comparatorMode')}} : {{$t('directive.parameter.form.name')}} </div>
      <a-table class="table-tiny" bordered
        :columns="formTableColumns" 
        :data-source="getCompareDataForm()" 
        :pagination="false"
      >
        <div slot="name" slot-scope="text, record">{{record.name}}</div>
        <div slot="type" slot-scope="text, record">
          {{$t(`directive.parameter.form.dataType.${record.type}`)}}
        </div>
        <div slot="value" slot-scope="text, record">
          {{record.prefix}}{{record.value}}
        </div>
        <div slot="comparator" slot-scope="text, record">
          {{$t(`test.editModal.comparator${record.comparator}`)}}
        </div>
        <div slot="actual" slot-scope="text,record">{{record.actual}}</div>
        <div slot="status" slot-scope="text,record">
          <a-icon v-if="!record.isSuccess" type="close" style="color: #f5222d;"/>
          <a-icon v-else type="check" style="color:#52c41a;"/>
        </div>
      </a-table>
    </template>
    
    <!-- comparator mode : others -->
    <div v-else>NOT-SUPPORTED</div>
  </div>
</template>
<script>
import Common from '../../utils/Common.js'
import MyObject from '../../utils/datatype/MyObject.js';
export default {
    name : 'TestDataComparatorViewer',
    props : {
        /**
         * @property {DataComparator}
         */
        comparator : {},
    },
    data() {
        return {
            /**
             * @property {Array<Object>}
             */
            formTableColumns : [
                {title: this.$t('directive.response.form.fieldName'), dataIndex: 'name',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.response.form.fieldType'),dataIndex: 'type',scopedSlots: { customRender: 'type' }},
                {title: this.$t('test.functionalNode.Directive.comparisonOperator'),dataIndex: 'comparator',scopedSlots: { customRender: 'comparator' }},
                {title: this.$t('directive.response.form.fieldValue'),dataIndex: 'value',scopedSlots: { customRender: 'value' }},
                {title: this.$t('test.comparatorAcutalValue'),scopedSlots:{customRender:'actual'}},
                {title: '',scopedSlots:{customRender:'status'},class:'text-center pl-2 pr-2'}
            ],
        };
    },
    methods : {
        /**
         * get byte array of compare data
         * @returns {Array<Object>}
         */
        getCompareDataHex() {
            let comparator = this.comparator;
            let expectData = Common.convertStringToHex(comparator.expectData);

            let bytes = [];
            for ( let i=0; i<comparator.matchResult.length; i++ ) {
                let match = comparator.matchResult[i];
                let actual = comparator.actualData[i];
                if ( undefined !== actual ) {
                    actual = actual.toString(16).toUpperCase().padStart(2,'0');
                } else {
                    actual = '--';
                }
                let expect = expectData[i];
                if ( undefined !== expect ) {
                    expect = expect.toString(16).toUpperCase().padStart(2,'0');
                } else {
                    expect = '--';
                }
                bytes.push({actual,expect,match});
            }
            return bytes;
        },

        /**
         * get table data source for expect response value table.
         * @returns {Array<Object>}
         */
        getCompareDataForm() {
            let source = [];
            if ( undefined === this.comparator.expectData ) {
                return source;
            }
            
            for ( let i=0; i<this.comparator.expectData.length; i++ ) {
                let item = MyObject.copy(this.comparator.expectData[i]);
                item.key = `R_${i}`;
                item.actual = this.comparator.actualData.getValueByIndex(i);
                item.isSuccess = this.comparator.matchResult[i];
                source.push(item);
            }
            return source;
        }
    },
}
</script>
<style scoped>
.data-compare-hex-byte {width:24px;border-radius: 5px;margin-right:2px;display:inline-block;text-align:center;margin-bottom: 1px;cursor: default;}
.data-compare-hex-byte:hover {background: white !important;}
.data-compare-hex-byte.success {background: #cce2cc;}
.data-compare-hex-byte.failed {background: #ffd6d6;}
.data-compare-hex-byte .expect {border-bottom: solid 1px #cccccc;}
</style>