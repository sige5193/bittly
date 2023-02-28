<!--
 - target eidotr for serial port
 - @author sige
-->
<template>
  <a-row>
    <!-- path : for node-serialport -->
    <a-col v-if="'node-serialport' == handlerType" :span="12" class="pr-1 white-space-nowrap">
      <a-input-group compact>
        <a-auto-complete 
          ref="path"
          style="width: 80%"
          v-model="target.path" 
          :data-source="serialportOptions.serialports"
          :open="showSerialportPathList"
          :dropdownMatchSelectWidth="false"
          @blur="showSerialportPathList=false"
          @focus="showSerialportPathList=true"
          @change="actionSerialportPathChange"
        ><a-input></a-input></a-auto-complete>
        <a-button 
          ref="btnSerialPortRefresh" 
          style="width:20%;" 
          @click="actionSerialPortListRefresh"
        ><a-icon type="reload" /></a-button>
      </a-input-group>
    </a-col>

     <!-- path : for web-serial -->
    <a-col v-if="'web-serial' == handlerType" :span="12" class="pr-1">
      <web-serial-device-selector v-model="target.path"
        @change="actionUpdateTarget(true)"
      ></web-serial-device-selector>
    </a-col>

    <!-- baudRate -->
    <a-col :span="5" class="pr-1">
      <a-auto-complete class="w-100" 
        v-model="target.baudRate" 
        :data-source="serialportOptions.baudRates"
        @change="actionUpdateTarget(true)"
        ref="baudRate"
      >
        <a-input :addon-before="$t('directive.communicator.serialport.baudRate')"></a-input>
      </a-auto-complete>
    </a-col>

    <!-- ext setting -->
    <a-col :span="4" class="pr-1 white-space-nowrap">
      <a-button @click="actionExtSettingOpen"><a-icon type="setting" /></a-button>

      <a-modal v-if="null != extSettings" :visible="null != extSettings"
        :title="$t('directive.communicator.serialport.extSettingTitle')"
        :okText="$t('button.ok')"
        :cancelText="$t('button.cancel')"
        @ok="actionExtSettingOk"
        @cancel="actionExtSettingCancel"
      >
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
          <!-- dataBits -->
          <a-form-item :label="$t('directive.communicator.serialport.dataBits')">
            <a-select v-model="extSettings.dataBits" @change="actionForceUpdate">
              <a-select-option value="5">5</a-select-option>
              <a-select-option value="6">6</a-select-option>
              <a-select-option value="7">7</a-select-option>
              <a-select-option value="8">8</a-select-option>
            </a-select>
          </a-form-item>
          <!-- stopBits -->
          <a-form-item :label="$t('directive.communicator.serialport.stopBits')">
            <a-select v-model="extSettings.stopBits" @change="actionForceUpdate">
              <a-select-option value="1">1</a-select-option>
              <a-select-option value="1.5">1.5</a-select-option>
              <a-select-option value="2">2</a-select-option>
            </a-select>
          </a-form-item>
          <!-- parity -->
          <a-form-item :label="$t('directive.communicator.serialport.parity')">
            <a-select v-model="extSettings.parity" @change="actionForceUpdate">
              <a-select-option value="none">None</a-select-option>
              <a-select-option value="odd">Odd</a-select-option>
              <a-select-option value="even">Even</a-select-option>
              <a-select-option value="mark">Mark</a-select-option>
              <a-select-option value="space">Space</a-select-option>
            </a-select>
          </a-form-item>
          <!-- flow control -->
          <a-form-item :label="$t('directive.communicator.serialport.flowControl')">
            <a-select v-model="extSettings.flowControl" @change="actionForceUpdate">
              <a-select-option value="none">{{$t('directive.communicator.serialport.flowControlNone')}}</a-select-option>
              <a-select-option value="software">{{$t('directive.communicator.serialport.flowControlSoftware')}}</a-select-option>
              <a-select-option value="hardware">{{$t('directive.communicator.serialport.flowControlHardware')}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
    </a-col>
  </a-row>
</template>
<script>
import CommunicatorSerialPort from './Communicator.js'
import Environment from '../../../../environments/Environment.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
import Common from '@/utils/Common.js'
import MyObject from '../../../../utils/datatype/MyObject.js'
import WebSerialDeviceSelector from './TargetEditorWebSerialDeviceSelector.vue'
export default {
    name : 'Serialport',
    mixins : [TargetEditorMixin],
    components : {
        'web-serial-device-selector' : WebSerialDeviceSelector,
    },
    data() {
        return {
            /**
             * ext settings for serialport connection.
             * @property {Object}
             */
            extSettings : null,
            /**
             * name of serialport handler
             * @property {String}
             */
            handlerType : null,
            showSerialportPathList : false,
            serialportOptions : {
                hasInited : false,
                serialports : [],
                baudRates : [],
                dataBitsList : [],
                stopBitsList : [],
                parities : [],
            },
        };
    },
    created() {
        this.handlerType = Environment.getEnv().serialportHandler;
    },
    mounted() {
        this.initOptions();
    },
    methods : {
        /**
         * init options for editor
         */
        async initOptions() {
            if ( 'node-serialport' === this.handlerType ) {
                await this.refreshSerialports();
            }
            
            this.serialportOptions.baudRates = [
                '110','300','600','1200','2400','4800','9600','14400','19200',
                '38400','56000','57600','76800','115200','128000','153600',
                '230400','256000','307200','460800','614400','921600','1382400'
            ],
            this.serialportOptions.hasInited = true;

            let hasChanged = MyObject.applyDefaultValues(this.target, {
                parity : 'none',
                stopBits : '1',
                dataBits : '8',
                baudRate : '9600',
                flowControl : 'none',
            });

            // if serialport path is empty and only one device in the list, then we use that 
            // device as serialport path.
            if ( Common.isEmpty(this.target.path) && 1 == this.serialportOptions.serialports.length ) {
                this.target.path = this.serialportOptions.serialports[0].value;
                hasChanged = true;
            }
            if ( hasChanged ) {
                this.updateVModel();
            }

            this.$forceUpdate();
            this.isEditorInited = true;
        },

        /**
         * event handler on serialpost path changed
         */
        actionSerialportPathChange() {
            this.showSerialportPathList = false;
            this.actionUpdateTarget(true);
        },

        /**
         * refresh serialport list or request 
         */
        async actionSerialPortListRefresh() {
            await this.refreshSerialports();
            if ( 0 === this.serialportOptions.serialports.length ) {
                this.$message.info(this.$t('directive.communicator.serialport.deviceRefreshEmpty'), 1);
                return;
            }
            
            this.$message.success(this.$t('directive.communicator.serialport.deviceRefreshSuccess'), 1);
            if ( 1 === this.serialportOptions.serialports.length ) {
                this.target.path = this.serialportOptions.serialports[0].value;
                this.updateVModel();
                this.$forceUpdate();
            } else {
                this.$forceUpdate();
                let $this = this;
                this.$nextTick(() => {
                    $this.showSerialportPathList = true;
                    $this.$refs.path.focus()
                });
            }
        },
        
        /**
         * execute refresh serialport list
         */
        async refreshSerialports () {
            let serialports = await CommunicatorSerialPort.list();
            this.serialportOptions.serialports = [];
            for ( let i=0; i<serialports.length; i++ ) {
                let option = {
                    value: serialports[i].path,
                    text: serialports[i].friendlyName,
                };
                this.serialportOptions.serialports.push(option);
            }
        },

        /**
         * get device key by options use to close device after options change.
         * @overide
         * @param {Object} options
         * @returns {String}
         */
        getComKeyByOptions(options) {
            return CommunicatorSerialPort.generateKeyFromOptions(options);
        },

        /**
         * open extension setting modal
         */
        actionExtSettingOpen() {
            this.extSettings = MyObject.copy(this.target);
        },

        /**
         * update target setting
         */
        actionExtSettingOk() {
            this.target = MyObject.copy(this.extSettings);
            this.extSettings = null;
            this.actionUpdateTarget(true);
        },

        /**
         * close the ext setting modal
         */
        actionExtSettingCancel() {
            this.extSettings = null;
        }
    },
    /**
     * target editor config
     */
    editorConfig() {
        return {
            name : 'SerialPort',
            label : window.app.$t('directive.communicator.serialport.name'),
            defaultDataType:'byte',
            defaultResponseViewer : 'hex'
        };
    }
}
</script>