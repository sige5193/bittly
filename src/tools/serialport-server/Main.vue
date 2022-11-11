<template>
  <div class="h-100 d-flex flex-dir-column">
    <app-tool-menu :tname="$t('app.toolSerialPortServer.windowTitle')"/>
    
    <template v-if="hasInited">
      <!-- options -->
      <div class="p-2 bg-light">
        <a-form layout="inline">
          <!-- path -->
          <a-form-item>
            <a-input-group compact style="width:200px;">
              <a-auto-complete style="width: 80%" v-model="path" 
                :data-source="serialportOptions.serialports" :disabled="isConnected"
                @change="actionOptionUpdate(null)"
              ><a-input></a-input></a-auto-complete>
              <a-button class="text-center pl-0 pr-0" style="width:20%;" :disabled="isConnected"
                @click="actionSerialPortListRefresh"
              ><a-icon type="reload" /></a-button>
            </a-input-group>
          </a-form-item>
          
          <!-- baudrate -->
          <a-form-item>
            <a-auto-complete style="width:200px;" v-model="baudRate" :disabled="isConnected"
              :data-source="serialportOptions.baudRates"
              @change="actionOptionUpdate(null)"
            >
              <a-input :addon-before="$t('directive.communicator.serialport.baudRate')"></a-input>
            </a-auto-complete>
          </a-form-item>
          
          <!-- charset -->
          <a-form-item>
            <a-select v-model="charset" default-value="utf8" 
              style="width:120px" :disabled="isConnected" @change="actionOptionUpdate(null)"
            >
              <a-select-option v-for="(item, key) in $dict.items('CHARSET')" :key="key" :value="item.value"
              >{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>

          <!-- start and stop -->
          <a-form-item>
            <a-button v-if="!isConnected" type="primary" html-type="submit" @click="actionStart">
              {{$t('app.toolTcpServer.btnStart')}}
            </a-button>
            <a-button v-if="isConnected" type="danger" html-type="submit" @click="actionStop">
              {{$t('app.toolTcpServer.btnStop')}}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      
      <!-- data viewer -->
      <div class="p-2 flex-grow-2 h-0 d-flex flex-dir-column">
        <template>
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

          <data-viewer 
            ref="dataViewer"
            :viewmode="viewmode"
            :enableDataMerge="enableDataMerge"
            @data-size-send-changed="(size) => dataSizeSend = size"
            @data-size-receive-changed="(size) => dataSizeReceive = size"
          ></data-viewer>
        </template>
      </div>

      <!-- data editor -->
      <mock-response-handler
        ref="mockResponseHandler"
        :enable="isConnected"
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
import AppHelper from '../../utils/AppHelper.js'
import DataViewer from '../utils/mock-server/DataViewer.vue'
import MockResponseHandler from '../utils/mock-server/ResponseHandler.vue'
import MdbRuntimeVariable from '@/models/MdbRuntimeVariable.js'
import Common from '@/utils/Common.js'
import Dictionary from '@/utils/Dictionary.js'
import { Buffer } from 'buffer'
require('../../utils/Common.css');
export default {
    name : 'ToolWsServer',
    mixins : [ToolMixin],
    components : {
        'mock-response-handler' : MockResponseHandler,
        'data-viewer' : DataViewer,
        'app-tool-menu' : AppToolMenu,
    },
    data() {
        return {
            options : {},
            path : '',
            baudRate : '',
            charset : 'utf8',
            viewmode : 'text',
            enableDataMerge : true,
            serialportOptions : {
                hasInited : false,
                serialports : [],
                baudRates : [],
                dataBitsList : [],
                stopBitsList : [],
                parities : [],
            },
            viewerSize : 50,

            // runtime variables
            hasInited : false,
            serialPort : null,
            dataSizeSend : 0,
            dataSizeReceive : 0,
            /**
             * status of connection to serialport device
             * @property {Boolean}
             */
            isConnected : false,
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
         * init
         */
        async init() {
            this.hasInited = false;
            this.$i18n.locale = await AppHelper.langCodeGet();
            document.title = this.$t('app.toolSerialPortServer.windowTitle');
            await Dictionary.load();

            // load options
            let options = await MdbRuntimeVariable.getVarValue('tool_serialport_server_options', '');
            if ( '' != options ) {
                options = JSON.parse(options);
            } else {
                options = {};
            }
            this.options = options;
            
            // init options
            this.path = this.options.path || this.path;
            this.baudRate = this.options.baudRate || this.baudRate;
            this.charset = this.options.charset || this.charset;
            this.viewmode = this.options.viewmode || this.viewmode;
            this.enableDataMerge = true;
            if ( false === this.options.enableDataMerge ) {
                this.enableDataMerge = false;
            }

            await this.refreshSerialports();
            this.serialportOptions.baudRates = [
                '110','300','600','1200','2400','4800','9600','14400','19200',
                '38400','56000','57600','76800','115200','128000','153600',
                '230400','256000','307200','460800','614400','921600','1382400'
            ],
            this.serialportOptions.hasInited = true;
            this.hasInited = true;
        },

        /**
         * execute refresh serialport list
         */
        async refreshSerialports () {
            let serialports = await window.SerialPort.list();
            this.serialportOptions.serialports = [];
            for ( let i=0; i<serialports.length; i++ ) {
                this.serialportOptions.serialports.push(serialports[i].path);
            }

            if ( 0 == this.path.trim().length || 1 == this.serialportOptions.serialports.length ) {
                this.path = this.serialportOptions.serialports[0];
            }

            this.$forceUpdate();
        },

        /**
         * refresh serialport list
         */
        async actionSerialPortListRefresh() {
            await this.refreshSerialports();
            this.$message.success(this.$t('directive.communicator.serialport.deviceRefreshSuccess'));
            this.$forceUpdate();
        },

        /**
         * event handler on option updated
         * @param {Object|null} newOptions
         */
        async actionOptionUpdate( newOptions ) {
            if ( null == newOptions ) {
                newOptions = Common.objCopy(this.options);
            }
            newOptions.path = this.path;
            newOptions.baudRate = this.baudRate;
            newOptions.charset = this.charset;
            newOptions.viewmode = this.viewmode;
            newOptions.enableDataMerge = this.enableDataMerge;
            this.options = newOptions;
            await MdbRuntimeVariable.setVarValue('tool_serialport_server_options', JSON.stringify(newOptions));
            this.$forceUpdate();
        },

        /**
         * start server
         */
        actionStart() {
            if ( 0 === this.path.trim().length ) {
                this.$message.error(this.$t('app.toolSerialPortServer.pathCanNotBeEmpty'));
                return ;
            }
            
            this.serialPort = new window.SerialPort({
                path : this.path,
                baudRate: this.baudRate * 1,
                autoOpen: false,
            });
            this.serialPort.on('data', (data) => this.handleOnData(data));
            this.serialPort.on('error',(err) => console.log('SERIAL PORT ON ERROR',err));
            this.serialPort.on('close',(err) => this.handleOnClose(err));
            this.serialPort.open((err) => this.handleSerialportOpen(err));
        },

        /**
         * callback handler on serialport opened
         * @param {Object|undefined} error
         * @param {String} error.message
         */
        handleSerialportOpen( error ) {
            if (error) {
                let messageKey = 'directive.communicator.serialport.unableToOpen';
                let message = $this.$t(messageKey,[this.path, error.message]);
                $this.$message.error(message);
                return;
            }

            this.isConnected = true;
            this.$message.success(this.$t('app.toolSerialPortServer.connected'), 1);
        },

        /**
         * hanle event on serial port closed
         * @param {Error} err 
         */
        handleOnClose( err ) {
            this.$message.success(this.$t('app.toolSerialPortServer.disconnected'), 1);
            this.isConnected = false;
        },

        /**
         * handle event on serial port has data come in
         * @param {*} data 
         */
        handleOnData(data) {
            this.$refs.dataViewer.dataReceive(data);
            this.$refs.mockResponseHandler.setRequestData(null, data);
        },
        
        /**
         * stop server
         */
        actionStop() {
            this.$refs.dataViewer.reset();
            if ( !this.isConnected ) {
                return ;
            }

            this.serialPort.close(error => this.handleSerialportClose(error));
        },

        /**
         * callback handler on serialport close
         * @param {Object|undefined} error
         * @param {String} error.message
         */
        handleSerialportClose( error ) {
            if ( error ) {
                let messageKey = 'directive.communicator.serialport.unableToClose';
                this.$message.error(this.$t(messageKey, [this.options.path, error.message]));
                return;
            }
            this.isConnected = false;
        },

        /**
         * event handler on mock response generated
         * @param {Object} data
         */
        actionMockResponseGenerated( data ) {
            let $this = this;
            let response = null;
            if ( 'text' === data.mode ) {
                response = Common.charsetConvert(data.content, this.charset, 'utf8');
                response = Buffer.from(response);
            } else {
                response = Buffer.from(Common.convertStringToHex(data.content));
            }
            
            this.$refs.dataViewer.dataSend(response, data.note);
            $this.serialPort.write(response, function(err) {
                if (err) {
                    let messageKey = 'directive.communicator.serialport.unableToWrite';
                    let message = window.app.$t(messageKey, [$this.options.path, err.message]);
                    $this.$message.error(message);
                    return;
                }
            });
        },

        /**
         * reset data size send
         */
        actionDataSizeSendReset() {
            this.$refs.dataViewer.dataSizeSendReset();
            this.$forceUpdate();
        },

        /**
         * reset data size receive
         */
        actionDataSizeReceiveReset() {
            this.$refs.dataViewer.dataSizeReceiveReset();
            this.$forceUpdate();
        },
    },
}
</script>