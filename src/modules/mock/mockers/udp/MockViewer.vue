<template>
  <div class="d-flex flex-dir-column h-100">
    <div class="d-flex flex-dir-column" :style="{height:`${dataEntryViewerHeight}px`}">
      <div class="content-center" v-if="null == service">
        <a-empty :description="false" />
      </div>
      <div class="content-center" v-else-if="0 === Object.keys(service.clients).length">
        <a-empty :description="false" />
      </div>

      <!-- client list -->
      <a-tabs v-else tab-position="right" 
        class="h-100 tab-h100-pane tab-p0-pane" 
        v-model="activeClientKey"
      >
        <a-tab-pane v-for="client in service.clients" 
          class="d-flex flex-dir-column"
          :key="client.key" 
          :tab="client.key" 
          :forceRender="true"
        >
          <a-row class="p-1">
            <a-col :span="12">
              <!-- fileter -->
              <filter-setting class="mr-1" v-model="mock.options.filter" 
                :match-rules="mock.options.responseMatchRules"
                :snippets="mock.options.responseSnippets"
                @change="actionEditorOptionChange"
              />

              <a-radio-group button-style="solid" size="small" class="mr-1" v-model="viewerMode">
                <a-radio-button value="hex">HEX</a-radio-button>
                <a-radio-button value="text">TEXT</a-radio-button>
              </a-radio-group>
              <a-switch class="mr-1" style="vertical-align: top;" 
                v-model="mock.options.enableDataMerge"
                :checked-children="$t('mock.mockers.serialport.enableDataMerge')" 
                :un-checked-children="$t('mock.mockers.serialport.enableDataMerge')" 
                @change="actionEnableDataMergeSwitchChange"
              />
              <a-input-number v-if="mock.options.enableDataMerge" size="small" 
                v-model="mock.options.dataMergeTime" 
                :min="1"
                :step="1"
                :formatter="value => `${value}ms`"
                :parser="value => value.replace('ms', '')"
                @change="actionEditorOptionChange"
              />
            </a-col>
            <a-col :span="12" class="text-right">
              <a-button size="small" class="mr-1" @click="actionClientRemove(client.key)">
                {{$t('mock.mockers.tcp.remove')}}
              </a-button>
              <a-input size="small" style="width:120px;" class="mr-1" disabled 
                :addon-before="$t('mock.dataReceiveSize')" 
                :value="$format(client.dataReceiveSize, 'FileSize')" 
              />
              <a-input size="small" style="width:120px;" class="mr-1" disabled 
                :addon-before="$t('mock.dataSendSize')" 
                :value="$format(client.dataSendSize, 'FileSize')"
              />
            </a-col>
          </a-row>

          <!-- data entries -->
          <data-entry-list-viewer :ref="`dataEntryListViewer_${client.key}`" class="flex-grow"
            :mode="viewerMode"
            :init-entries="client.dataEntries"
            :filter="mock.options.filter"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
    
    <seperator v-model="dataEntryViewerHeight"/>

    <!-- response -->
    <div class="h-0 flex-grow position-relative bg-white" style="z-index:1;">
      <a-tabs class="d-flex flex-dir-column h-100 tab-content-flex-grow tab-content-h0"
        default-active-key="match" 
        :tabBarStyle="{marginBottom:'0px'}"
      >
        <a-tab-pane key="match" :tab="$t('mock.response.match.title')">
          <response-match-rule-editor 
            v-model="mock.options.responseMatchRules"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
        <a-tab-pane key="snippet" :tab="$t('mock.response.snippet.title')">
          <response-snippet-editor 
            v-model="mock.options.responseSnippets"
            @send="actionContentSend"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
        <a-tab-pane key="manual" :tab="$t('mock.response.manual.title')">
          <response-manual-editor 
            v-model="mock.options.responseManualEditor"
            @send="actionContentSend"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
        <a-tab-pane key="status" :tab="$t('mock.status.title')">
          <status-editor
            v-model="mock.options.status"
            :mock="mock"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
      </a-tabs>
    </div>

    <mocker-setting ref="setting" v-model="mock" />
  </div>
</template>
<script>
import DataEntryListViewer from '../../data-entry/ListViewer.vue'
import Mocker from './MockService.js'
import MockerSetting from './MockerSetting.vue'
import ResponseManualEditor from '../../response/manual/Editor.vue'
import ResponseMatchRuleEditor from '../../response/match/Editor.vue'
import ResponseSnippetEditor from '../../response/snippet/Editor.vue'
import StatusEditor from '../../status/Editor.vue'
import Seperator from '../../../../components/Seperator.vue'
import MockViewerBase from '../MockViewerBase.js'
import FilterSetting from '../../data-entry/FilterSetting.vue'
export default {
    name : 'MockMockerUDP',
    mixins : [MockViewerBase],
    components : {
        'seperator' : Seperator,
        'data-entry-list-viewer' : DataEntryListViewer,
        'status-editor' : StatusEditor,
        'mocker-setting' : MockerSetting,
        'response-snippet-editor' : ResponseSnippetEditor,
        'response-match-rule-editor' : ResponseMatchRuleEditor,
        'response-manual-editor' : ResponseManualEditor,
        'filter-setting' : FilterSetting,
    },
    props : {
        value : {type:Object},
    },
    data () {
        return {
            /**
             * name of viewer mode
             * @property {String}
             */
            viewerMode : 'hex',
            /**
             * height of data entry viewer
             * @property {Number}
             */
            dataEntryViewerHeight : 300,
            /**
             * the key of active client
             * @property {String}
             */
            activeClientKey : null,
        };
    },
    mounted() {
        this.viewerMode = this.mock.options.encoding || 'hex';
        if ( null !== this.service ) {
            this.serviceEventOnAll();
            let clientKeys = Object.keys(this.mocker.clients);
            this.activeClientKey = clientKeys[0] || null;
        }
    },
    beforeDestroy() {
        this.serviceEventOffAll();
    },
    methods : { 
        /**
         * add event listeners to mocker
         */
        serviceEventOnAll() {
            this.serviceEventOn('new-client', client => this.onClientNew(client));
            this.serviceEventOn('client-data', (client,item) => this.onClientData(client,item));
            this.serviceEventOn('client-data-write', (client,item) => this.onClientData(client,item));
        },

        /**
         * event handler on new client connected.
         */
        onClientNew(client) {
            if ( null === this.activeClientKey ) {
                this.activeClientKey = client.key;
            }
            this.$forceUpdate();
        },

        /**
         * event handler on client receive data
         */
        async onClientData( client, item ) {
            await this.$nextTick();
            let viewer = this.$refs[`dataEntryListViewer_${client.key}`][0];
            viewer.entryItemPush(item);
        },

        /**
         * start mocker
         */
        async start() {
            this.service = new Mocker(this.mock);
            this.serviceEventOnAll();
            await this.service.start();
        },

        /**
         * stop mocker
         */
        async stop() {
            await this.service.stop();
        },

        /**
         * event handler on manual send button clicked.
         * @param {Object} content
         */
        async actionContentSend( content ) {
            try {
                await this.service.clients[this.activeClientKey].send(content);
            } catch ( e ) {
                this.$message.error(this.$t('mock.responseFailed',[e.message]));
                return ;
            }
        },

        /**
         * event handler on manual editor options changed.
         */
        async actionEditorOptionChange() {
            await this.mock.save();
            this.$forceUpdate();
        },

        /**
         * event handler on data merge switch changed.
         */
        async actionEnableDataMergeSwitchChange() {
            if ( undefined == this.mock.options.dataMergeTime ) {
                this.mock.options.dataMergeTime = '100';
            }
            await this.actionEditorOptionChange();
        },

        /**
         * remove client by given key
         * @param {String} clientKey
         */
        actionClientRemove(clientKey) {
            let client = this.service.clients[clientKey];
            let $this = this;
            this.$confirm({
                title: this.$t('mock.mockers.udp.clientRemoveByNotDisconnected'),
                onOk() {
                    client.close();
                    delete $this.service.clients[clientKey];
                    $this.activeClientKey = null;
                    $this.$forceUpdate();
                },
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel')
            });
        }
    },
}
</script>