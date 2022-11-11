<!--
 - target eidotr for serial port
 - @author sige
-->
<template>
  <a-row>
    <!-- path -->
    <a-col :span="7" class="pr-1">
      <a-input-group compact>
        <a-auto-complete 
          ref="path"
          style="width: 80%"
          v-model="target.path" 
          :data-source="serialportOptions.serialports"
          :open="showSerialportPathList"
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

    <!-- dataBits -->
    <a-col :span="4" class="pr-1">
      <a-input-group compact>
        <a-input class="text-body" style="width: 60%" :value="$t('directive.communicator.serialport.dataBits')" disabled />
        <a-select ref="dataBits" style="width: 40%" v-model="target.dataBits" @change="actionUpdateTarget(true)" :showArrow="false" :dropdownMatchSelectWidth="false">
          <a-select-option value="5">5</a-select-option>
          <a-select-option value="6">6</a-select-option>
          <a-select-option value="7">7</a-select-option>
          <a-select-option value="8">8</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>

    <!-- stopBits -->
    <a-col :span="4" class="pr-1">
      <a-input-group compact>
        <a-input class="text-body" style="width: 50%" :value="$t('directive.communicator.serialport.stopBits')" disabled />
        <a-select ref="stopBits" style="width: 50%" v-model="target.stopBits" @change="actionUpdateTarget(true)" :showArrow="false" :dropdownMatchSelectWidth="false">
          <a-select-option value="1">1</a-select-option>
          <a-select-option value="1.5">1.5</a-select-option>
          <a-select-option value="2">2</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>
    
    <!-- parity -->
    <a-col :span="4" class="pr-1">
      <a-input-group compact>
        <a-input class="text-body" style="width: 50%" :value="$t('directive.communicator.serialport.parity')" disabled />
        <a-select ref="parity" style="width: 50%" v-model="target.parity" @change="actionUpdateTarget(true)" :showArrow="false" :dropdownMatchSelectWidth="false">
          <a-select-option value="none">None</a-select-option>
          <a-select-option value="odd">Odd</a-select-option>
          <a-select-option value="even">Even</a-select-option>
          <a-select-option value="mark">Mark</a-select-option>
          <a-select-option value="space">Space</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>
  </a-row>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js'
import Common from '@/utils/Common.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
import CommunicatorSerialPort from './Communicator.js'
export default {
    name : 'Serialport',
    mixins : [TargetEditorMixin],
    data() {
        return {
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
    mounted() {
        this.initOptions();
    },
    methods : {
        /**
         * init options for editor
         */
        async initOptions() {
            await this.refreshSerialports();
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
                baudRate : '9600'
            });

            // if serialport path is empty and only one device in the list, then we use that 
            // device as serialport path.
            if ( Common.isEmpty(this.target.path) && 1 == this.serialportOptions.serialports.length ) {
                this.target.path = this.serialportOptions.serialports[0];
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
         * refresh serialport list
         */
        async actionSerialPortListRefresh() {
            await this.refreshSerialports();
            if ( 0 === this.serialportOptions.serialports.length ) {
                this.$message.info(this.$t('directive.communicator.serialport.deviceRefreshEmpty'), 1);
                return;
            }
            
            this.$message.success(this.$t('directive.communicator.serialport.deviceRefreshSuccess'), 1);
            if ( 1 === this.serialportOptions.serialports.length ) {
                this.target.path = this.serialportOptions.serialports[0];
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
                this.serialportOptions.serialports.push(serialports[i].path);
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
    },
    /**
     * target editor config
     */
    editorConfig() {
        return {
            name : window.app.$t('directive.communicator.serialport.name'),
            defaultDataType:'byte',
            defaultResponseViewer : 'hex'
        };
    }
}
</script>