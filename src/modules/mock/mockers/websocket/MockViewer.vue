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
      <a-tabs v-else
        tab-position="right" 
        class="h-100 tab-h100-pane tab-p0-pane"
        v-model="activeClientKey"
      >
        <a-tab-pane v-for="client in service.clients" :key="client.key" 
          class="d-flex flex-dir-column tab-client-pane" 
          :forceRender="true"
        >
          <span slot="tab">
            <a-badge v-if="1 == client.ws.readyState" status="success" />
            <a-badge v-else-if="3 == client.ws.readyState" status="default" />
            <a-badge v-else status="processing" />
            {{client.key}}
          </span>

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
              <a-button v-if="client.getIsConnected()" 
                type="danger" size="small" class="mr-1" 
                @click="actionClientDisconnect(client.key)"
              >{{$t('mock.mockers.tcp.disconnect')}}</a-button>
              <a-input size="small" style="width:120px;" class="mr-1" disabled 
                :addon-before="$t('mock.dataReceiveSize')" 
                :value="formatAsFileSize(client.dataReceiveSize)" 
              />
              <a-input size="small" style="width:120px;" class="mr-1" disabled 
                :addon-before="$t('mock.dataSendSize')" 
                :value="formatAsFileSize(client.dataSendSize)" 
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
import ComponentBase from '../../../../utils/component/Base.js'
import DataEntryListViewer from '../../data-entry/ListViewer.vue'
import MockService from './MockService.js'
import MockerSetting from './MockerSetting.vue'
import ResponseManualEditor from '../../response/manual/Editor.vue'
import ResponseMatchRuleEditor from '../../response/match/Editor.vue'
import ResponseSnippetEditor from '../../response/snippet/Editor.vue'
import StatusEditor from '../../status/Editor.vue'
import Formatter from '../../../../utils/Formatter.js'
import Seperator from '../../../../components/Seperator.vue'
import MockViewerBase from '../MockViewerBase.js'
import FilterSetting from '../../data-entry/FilterSetting.vue'
export default {
    name : 'MockMockerWebsocket',
    mixins : [ComponentBase, MockViewerBase],
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
        this.registerEventHandler('mock-stop', (key) => this.onMockStop(key));
        this.viewerMode = this.mock.options.encoding || 'hex';
        if ( null !== this.service ) {
            this.serviceEventOnAll();
            this.activeClientAutomatically();
        }
    },
    beforeDestroy() {
        this.unregisterAllEventHandlers();
        if ( null != this.service ) {
            this.serviceEventOffAll();
        }
    },
    methods : {
        /**
         * register mocker event handlers to mocker
         */
        serviceEventOnAll() {
            this.serviceEventOn('client-new', client => this.onClientNew(client));
            this.serviceEventOn('client-data', (client,item) => this.onClientData(client,item));
            this.serviceEventOn('client-data-write', (client,item) => this.onClientData(client,item));
            this.serviceEventOn('client-close', client => this.onClientClose(client));
        },

        /**
         * get operation menu items
         * @override
         * @returns {Array<Object>}
         */
        getExtenActions() {
            return [
                {icon:'copy',key:'Copy',label:this.$t('mock.mockers.websocket.urlCopy')},
            ];
        },
        
        /**
         * start mocker, 
         * this function would be called by parent component
         * @public
         * @override
         */
        async start() {
            this.service = new MockService(this.mock);
            this.serviceEventOnAll();
            await this.service.start();
        },

        /**
         * stop mocker, 
         * this function would be called by parent component
         * @public
         * @override
         */
        async stop() {
            this.activeClientKey = null;
            this.serviceEventOffAll();
            await this.service.stop();
        },

        /**
         * copy ws url to clipboard
         */
        async executeExtenActionCopy() {
            let options = this.mock.options;
            let url = `${options.protocol}://${options.host}:${options.port}/${options.path}`;
            await navigator.clipboard.writeText(url);
            this.$message.info(this.$t('mock.mockers.websocket.urlCopySuccess'))
        },

        /**
         * event handler on new client connected.
         * @callback
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
        onClientData( client, item ) {
            let viewer = this.$refs[`dataEntryListViewer_${client.key}`][0];
            viewer.entryItemPush(item);
            this.$forceUpdate();
        },

        /**
         * event handler on mock stopped.
         * @param {String} key
         */
        onMockStop( key ) {
            if ( key != this.mock.id ) {
                return ;
            }
            this.service = null;
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
         * format number as file size
         * @returns {Number}
         */
        formatAsFileSize( size ) {
            return Formatter.asFileSize(size);
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
         * event handler on client closed
         * @param {WsClientConnection} client
         */
        onClientClose(client) {
            this.$forceUpdate();
        },

        /**
         * disconnect client by given key
         * @param {String} clientKey
         */
        actionClientDisconnect(clientKey) {
            let $this = this;
            this.$confirm({
                title: this.$t('mock.mockers.websocket.clientDisconnectConfirm'),
                onOk() {
                    $this.service.clients[clientKey].close();
                    $this.$forceUpdate();
                },
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel')
            });
        },

        /**
         * remove client by given key
         * @param {String} clientKey
         */
        actionClientRemove(clientKey) {
            let client = this.service.clients[clientKey];
            if ( !client.getIsConnected() ) {
                this.activeClientKey = null;
                delete this.service.clients[clientKey];
                this.activeClientAutomatically();
                this.$forceUpdate();
                return ;
            }

            let $this = this;
            this.$confirm({
                title: this.$t('mock.mockers.websocket.clientRemoveByNotDisconnected'),
                onOk() {
                    $this.service.clients[clientKey].close();
                    delete $this.service.clients[clientKey];
                    $this.activeClientKey = null;
                    $this.activeClientAutomatically();
                    $this.$forceUpdate();
                },
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel')
            });
        },

        /**
         * automatically active client
         */
        activeClientAutomatically(){
            if ( null != this.activeClientKey ) {
                return ;
            }
            let clients = Object.keys(this.service.clients);
            if ( 0 < clients.length ) {
                this.activeClientKey = this.service.clients[clients[0]].key;
            }
        }
    },
}
</script>