<!--
 - target editro for websocket
 - @author sige
-->
<template>
  <a-row>
    <!-- websocket url -->
    <a-col :span="15" class="pr-1">
      <a-input 
        ref="txtUrl" 
        v-model="target.wsUrl"
        :placeholder="$t('directive.communicator.websocket.addressPlaceholder')"
        :addon-before="$t('directive.communicator.websocket.address')"
        @change="actionUpdateTarget(true)" 
      />
    </a-col>
    
    <a-col :span="4"  class="pr-1">
      <a-button ref="btnSetting" @click="settingModalEnable=true"><a-icon type="setting" /></a-button>
      <a-modal 
        v-if="settingModalEnable" 
        v-model="settingModalEnable" 
        :title="$t('directive.communicator.websocket.settingModalTitle')"
      >
        <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
          <!-- Protocols -->
          <a-form-item :label="$t('directive.communicator.websocket.protocols')">
            <a-select mode="tags" class="input"
              v-model="target.wsProtocols" @change="actionUpdateTarget(true)"
            >
              <a-select-option key="ocpp1.6">ocpp1.6</a-select-option>
              <a-select-option key="ocpp1.5">ocpp1.5</a-select-option>
            </a-select>
          </a-form-item>

          <!-- Headers -->
          <a-form-item label="Headers">
            <a-table ref="tableHeaders" :columns="headerTableColumns" :data-source="target.wsHeaders" size="small" class="directive-websocket-setting-header-table" :pagination="false">
              <a-input slot="name" slot-scope="text,record,index" :ref="`txtHeaderName_${index}`"
                size="small" class="border-none" v-model="target.wsHeaders[index].name" 
                @change="actionHeaderItemInput(index)"
              />
              <a-input slot="value" slot-scope="text,record,index" :ref="`txtHeaderValue_${index}`"
                size="small" class="border-none" v-model="target.wsHeaders[index].value" 
                @change="actionHeaderItemInput(index)"
              />
              <div slot="actions" slot-scope="text,record,index" class="pl-2 pr-2">
                <a-button :ref="`btnHeaderDelete_${index}`" size="small" @click="actionHeaderItemDelete(index)"><a-icon type="delete" /></a-button>
              </div>
            </a-table>
          </a-form-item>
        </a-form>
        <template slot="footer">
          <a-button type="primary" @click="settingModalEnable=false">{{$t('button.ok')}}</a-button>
        </template>
      </a-modal>
    </a-col>
  </a-row>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js'
import Communicator from './Communicator.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
export default {
    name : 'Websocket',
    mixins : [TargetEditorMixin],
    data() {
        return {
            /**
             * indicate if setting modal enabeld
             * @property {Boolean}
             */
            settingModalEnable : false,
            /**
             * list of header table columns
             * @property {Array<Object>}
             */
            headerTableColumns : [
                {title: this.$t('directive.communicator.websocket.headerName'),slots: { title: 'name' },scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.communicator.websocket.headerValue'),slots: { title: 'value' },scopedSlots: { customRender: 'value' }},
                {title: this.$t('directive.communicator.websocket.headerAction'),slots: { title: 'actions' },scopedSlots: { customRender: 'actions'}}
            ],
        };
    },
    mounted() {
        this.initOptions();
    },
    methods : {
        /**
         * init options for editor
         */
        async initOptions() {
            let hasChanged = MyObject.applyDefaultValues(this.target, {
                wsUrl : '',
                wsProtocols : [],
                wsHeaders : [],
            });
            if ( hasChanged ) {
                await this.updateVModel();
            }
            if ( 0 == this.target.wsHeaders.length ) {
                this.target.wsHeaders.push({key:(new Date()).getTime(),name:'',value:''});
            }

            this.$forceUpdate();
            this.isEditorInited = true;
        },

        /**
         * event handelr on user input ws header
         * @param {Number} index
         */
        actionHeaderItemInput( index ) {
            if ( index === this.target.wsHeaders.length - 1 ) {
                this.target.wsHeaders.push({key:(new Date()).getTime(),name:'',value:''})
                this.$forceUpdate();
            }
            this.actionUpdateTarget(true);
        },

        /**
         * event handelr on user delete ws header item
         * @param {Number} index
         */
        actionHeaderItemDelete(index) {
            this.target.wsHeaders.splice(index,1);
            if ( 0 === this.target.wsHeaders.length ) {
                this.target.wsHeaders.push({key:(new Date()).getTime(),name:'',value:''})
            }
            this.actionUpdateTarget(true);
        },

        /**
         * get device key by options use to close device after options change.
         * @overide
         * @param {Object} options
         * @returns {String}
         */
        getComKeyByOptions(options) {
            return Communicator.generateComKeyFromOptions(options);
        },
    },
    /**
     * editor config
     */
    editorConfig() {
        return {
            name : window.app.$t('directive.communicator.websocket.name'),
            defaultDataType:'byte',
            defaultResponseViewer : 'hex'
        };
    }
}
</script>
<style>
.directive-websocket-setting-header-table .ant-table-body {margin: 0 !important;}
.directive-websocket-setting-header-table .ant-table-row td {padding: 2px !important;}
.directive-websocket-setting-header-table .ant-table-thead th {padding: 2px 10px !important;}
</style>