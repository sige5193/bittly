<template>
  <div class="h-100 d-flex flex-dir-column">
    <app-tool-menu :tname="$t('app.toolTcpServer.windowTitle')"/>
    
    <template v-if="hasInited">
      <!-- server config -->
      <div class="p-2 bg-light">
        <a-form layout="inline">
          <a-form-item>
            <a-input placeholder="Address" v-model="host" @change="actionOptionUpdate(null)"/>
          </a-form-item>
          <a-form-item>
            <a-input placeholder="Port" v-model.number="port" @change="actionOptionUpdate(null)"/>
          </a-form-item>
          <a-form-item>
            <a-select v-model="charset" default-value="utf8" style="width:120px" @change="actionOptionUpdate(null)">
              <a-select-option v-for="(item, key) in $dict.items('CHARSET')" :key="key" :value="item.value"
              >{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button v-if="!isListening" type="primary" html-type="submit" @click="actionStart">
              {{$t('app.toolTcpServer.btnStart')}}
            </a-button>
            <a-button v-if="isListening" type="danger" html-type="submit" @click="actionStop">
              {{$t('app.toolTcpServer.btnStop')}}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      
      <!-- clients -->
      <div class="p-2 flex-grow-2 h-0 d-flex flex-dir-column">
        <a-empty 
          class="mt-5" 
          v-if="0 == Object.keys(clients)" 
          :description="$t('app.toolTcpServer.noClients')"
        />

        <template v-else>
          <a-row class="border-bottom pb-1">
            <a-col :span="12">
              {{$t('app.tool.viewerMode')}} : 
              <a-radio-group size="small" v-model="viewmode" @change="actionOptionUpdate(null)">
                <a-radio-button value="hex">HEX</a-radio-button>
                <a-radio-button value="text">TEXT</a-radio-button>
              </a-radio-group>

              <span class="ml-2">{{$t('app.tool.dataViewerMergeRecentlyReceiveData')}} : </span>
              <a-switch size="small" v-model="enableDataMerge" @change="actionOptionUpdate(null)" />
            </a-col>
            <a-col :span="12" class="text-right">
              <a-input 
                disabled 
                size="small" 
                class="text-center"
                style="width:160px;"
                :addon-before="$t('messages.send')" 
                :value="dataSizeSend.toLocaleString('en-US')" 
              ><a-icon slot="addonAfter" type="close-circle" @click="actionDataSizeSendReset" /></a-input>
              &nbsp;
              <a-input 
                disabled 
                size="small" 
                class="text-center"
                style="width:160px;"
                :addon-before="$t('messages.receive')" 
                :value="dataSizeReceive.toLocaleString('en-US')"
              ><a-icon slot="addonAfter" type="close-circle" @click="actionDataSizeReceiveReset" /></a-input>
            </a-col>
          </a-row>
          
          <a-tabs 
            id="clienttab"
            hide-add
            size="small" 
            type="editable-card" 
            tabPosition="right" 
            style="height: 100%;"
            @edit="actionClientTabEdit"
            @change="actionClientTabChange"
          >
          <a-tab-pane v-for="(client, key) in clients" :key="key" :forceRender="true">
            <span slot="tab">
              {{key}} 
              <a-badge v-if="client.hasNewData" status="processing" />
              <a-badge v-else-if="client.isConnected" status="success" />
              <a-badge v-else status="default" />
            </span>

            <data-viewer 
              :ref="`dataViewer:${key}`"
              :viewmode="viewmode"
              :enable-data-merge="enableDataMerge"
              :client-key="key"
              @data-size-send-changed="(size,clientKey) => actionDataSizeChanged( size, 'dataSizeSend', clientKey )"
              @data-size-receive-changed="(size,clientKey) => actionDataSizeChanged( size, 'dataSizeReceive', clientKey )"
            ></data-viewer>
          </a-tab-pane>
        </a-tabs>
        </template>
      </div>
      
      <!-- data editor -->
      <mock-response-handler
        ref="mockResponseHandler"
        :enable="isListening"
        :tool-options="options"
        :charset="charset"
        @tool-option-update="actionOptionUpdate"
        @response-generated="actionMockResponseGenerated"
      ></mock-response-handler>
    </template>
  </div>
</template>
<script>
import ToolMixin from '../utils/ToolMixin.js'
import AppToolMenu from '../utils/AppToolMenu.vue'
import Client from './Client.js'
import AppHelper from '../../utils/AppHelper.js'
import DataViewer from '../utils/mock-server/DataViewer.vue'
import MockResponseHandler from '../utils/mock-server/ResponseHandler.vue'
import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
import Common from '@/utils/Common.js'
import Dictionary from '@/utils/Dictionary.js'
import { Buffer } from 'buffer'
require('../../utils/Common.css');
export default {
    name : 'ToolTCPServer',
    mixins : [ToolMixin],
    components : {
        'data-viewer' : DataViewer,
        'mock-response-handler' : MockResponseHandler,
        'app-tool-menu' : AppToolMenu,
    },
    data() {
        return {
            options : {},
            host : '127.0.0.1',
            port : 8899,
            charset : 'utf8',
            viewmode : 'text',
            enableDataMerge : true,

            server : null,
            isListening: false,
            clients : {},
            activeClientKey : null,
            defaultViewerFormat : 'text',
            hasInited : false,
            dataSizeSend : 0,
            dataSizeReceive : 0,
        };
    },
    mounted () {
        this.init();
    },
    beforeDestroy() {
        this.actionStop();
    },
    methods : {
        /**
         * init widget
         */
        async init() {
            this.hasInited = false;
            this.$i18n.locale = await AppHelper.langCodeGet();
            document.title = this.$t('app.toolTcpServer.windowTitle');
            await Dictionary.load();

            // load options
            let options = await MdbRuntimeVariable.getVarValue('tool_tcp_server_options', '');
            if ( '' != options ) {
                options = JSON.parse(options);
            } else {
                options = {};
            }
            this.options = options;
            
            // init options
            this.host = this.options.host || this.host;
            this.port = this.options.port || this.port;
            this.charset = this.options.charset || this.charset;
            this.viewmode = this.options.viewmode || this.viewmode;
            this.enableDataMerge = true;
            if ( false === this.options.enableDataMerge ) {
                this.enableDataMerge = false;
            }

            this.hasInited = true;
        },

        /**
         * event handler on option updated
         * @param {Object|null} newOptions
         */
        async actionOptionUpdate( newOptions ) {
            if ( null == newOptions ) {
                newOptions = Common.objCopy(this.options);
            }
            newOptions.host = this.host;
            newOptions.port = this.port;
            newOptions.charset = this.charset;
            newOptions.viewmode = this.viewmode;
            newOptions.enableDataMerge = this.enableDataMerge;
            this.options = newOptions;
            await MdbRuntimeVariable.setVarValue('tool_tcp_server_options', JSON.stringify(newOptions));
            this.$forceUpdate();
        },

        /**
         * start tcp server
         */
        actionStart() {
            this.server = window.net.createServer(( socket ) => this.handleNewClient(socket));
            this.server.on('error', (err) => this.$message.error(err.message));
            try {
                let $this = this;
                this.server.listen({port : this.port,host : this.host,}, () => {
                    $this.isListening = true;
                    $this.$message.success($this.$t('app.toolTcpServer.serverStarted'));
                });
            } catch ( e ) {
                $this.$message.error(e.message);
            }
        },

        /**
         * event handler on new client connected.
         * @param {Socket} socket
         */
        handleNewClient(socket) {
            let client = new Client(socket);
            client.on('update', ()=>this.$forceUpdate());

            let $this = this;
            socket.on('data', (data) => {$this.handleClientData(client.key, data);});
            this.clients[client.key] = client;

            if ( null == this.activeClientKey ) {
                this.activeClientKey = client.key;
            }
            this.$forceUpdate();
        },
        
        /**
         * event handler on receive client data
         * @param {String} key
         * @param {Buffer} data
         */
        handleClientData( key, data ) {
            this.$refs[`dataViewer:${key}`][0].dataReceive(data);
            this.$refs.mockResponseHandler.setRequestData(key, data);
            if ( this.activeClientKey != key ) {
                this.clients[key].hasNewData = true;
            }
            this.$forceUpdate();
        },

        /**
         * close client by given client key, and then switch current client 
         * to first client if client list is not empty.
         * @param {String} key
         */
        clientClose( key ) {
            if ( undefined == this.clients[key] ) {
                return ;
            }

            this.clients[key].close();
            delete this.clients[key];
            
            if ( key == this.activeClientKey ) {
                this.activeClientKey = null;
                let clientKeys = Object.keys(this.clients);
                if ( 0 < clientKeys.length ) {
                    this.activeClientKey = clientKeys[0];
                }
            }
            this.$forceUpdate();
        },
        
        /**
         * stop tcp server
         */
        actionStop() {
            let $this = this;
            for ( let key in this.clients ) {
                this.clientClose(key);
            }

            this.server.close(function() {
                $this.isListening = false;
                $this.$message.success($this.$t('app.toolTcpServer.serverStoped'));
            });

            this.activeClientKey = null;
        },

        /**
         * event handler on mock response generated
         * @param {Object} data
         */
        actionMockResponseGenerated( data ) {
            let response = null;
            if ( 'text' === data.mode ) {
                response = Common.charsetConvert(data.content, this.charset, 'utf8');
                response = Buffer.from(response);
            } else {
                response = Buffer.from(Common.convertStringToHex(data.content));
            }
            
            if ( null === data.clientKey ) {
                data.clientKey = this.activeClientKey;
            }
            if ( undefined == this.clients[data.clientKey] ) {
                return;
            }
            this.$refs[`dataViewer:${data.clientKey}`][0].dataSend(response, data.note);
            let client = this.clients[data.clientKey];
            client.socket.write(response, this.charset);
        },

        /**
         * event handler on client tab edited.
         * @param {String} targetKey
         * @param {String} action
         */
        actionClientTabEdit( targetKey, action ) {
            action = action[0].toUpperCase() + action.substr(1);
            let handler = `handleClientTabAction${action}`;
            this[handler](targetKey);
        },

        /**
         * close client on remove client tab
         * @param {String} key
         */
        handleClientTabActionRemove( key ) {
            this.clientClose(key);
        },

        /**
         * event handler on client tab changed, it would switch current client key.
         */
        actionClientTabChange( tabKey ) {
            this.activeClientKey = tabKey;
            this.clients[tabKey].hasNewData = false;
            this.dataSizeSend = this.$refs[`dataViewer:${tabKey}`][0].dataSizeSend;
            this.dataSizeReceive = this.$refs[`dataViewer:${tabKey}`][0].dataSizeReceive;
            this.$forceUpdate();
        },

        /**
         * event handle on data size changed
         * @param {Number} size
         * @param {String} dir
         * @param {String} clientKey
         */
        actionDataSizeChanged( size, dir, clientKey ) {
            if ( this.activeClientKey != clientKey ) {
                return;
            }
            this[dir] = size;
            this.$forceUpdate();
        },

        /**
         * reset data size send
         */
        actionDataSizeSendReset() {
            this.$refs[`dataViewer:${this.activeClientKey}`][0].dataSizeSendReset();
            this.$forceUpdate();
        },

        /**
         * reset data size receive
         */
        actionDataSizeReceiveReset() {
            this.$refs[`dataViewer:${this.activeClientKey}`][0].dataSizeReceiveReset();
            this.$forceUpdate();
        },
    },
}
</script>
<style>
#clienttab .ant-tabs-content {height: 100% !important;}
#clienttab .ant-tabs-tabpane-active {height: 100% !important;}
#clienttab .ant-tabs-right-content {padding-right: 2px !important;}
</style>