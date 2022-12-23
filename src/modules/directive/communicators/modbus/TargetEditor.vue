<template>
  <a-row>
    <a-col :span="9" class="pr-1">
      <a-input-group compact>
        <!-- mode -->
        <a-select 
          ref="sltMode"
          class="w-25"
          v-model="target.modbusMode" 
          :showArrow="false" 
          @change="actionUpdateTarget(true)"
        >
          <a-select-option value="RTU">RTU</a-select-option>
          <a-select-option value="ASCII">ASCII</a-select-option>
          <a-select-option value="TCP-IP">TCP/IP</a-select-option>
        </a-select>
        
        <!-- modbus-RTU or modbus-ASCII -->
        <template v-if="'RTU' === target.modbusMode || 'ASCII' ===  target.modbusMode">
          <a-auto-complete 
            ref="txtSerialport"
            class="w-35"
            v-model="target.modbusSerialport" 
            :data-source="serialportOptions.serialports"
            @change="actionUpdateTarget(true)"
          ><a-input style="border-right:none;"></a-input></a-auto-complete>
          <a-button 
            ref="btnSerialPortRefresh" 
            style="width:10%;padding:0;border-left:none;border-right:none;" 
            @click="actionSerialPortListRefresh(false)"
          ><a-icon type="reload" /></a-button>
          <a-input class="pl-0 pr-0 text-center text-body" style="width:10%;" value="@" disabled></a-input>
          <a-tooltip>
            <template slot="title">
              {{$t('directive.communicator.serialport.baudRate')}}
            </template>
            <a-auto-complete 
              ref="txtBaudRate"
              class="w-20"
              v-model="target.modbusBaudRate" 
              :data-source="serialportOptions.baudRates"
              @change="actionUpdateTarget(true)"
            ><a-input></a-input></a-auto-complete>
          </a-tooltip>
        </template>
        <!-- modbus TCP -->
        <template v-if="'TCP-IP' === target.modbusMode">
          <a-input 
            ref="txtHost"
            class="w-50"
            v-model="target.modbusHost" 
            @change="actionUpdateTarget(true)" 
          />
          <a-input style="width:5%;padding:0;text-align:center;background:white;border-left:none;" value=":" disabled></a-input>
          <a-input 
            style="width:20%;border-left:none;"
            v-model="target.modbusPort" 
            @change="actionUpdateTarget(true)" 
          />
        </template>
      </a-input-group>
    </a-col>
    
    <!-- device id -->
    <a-col :span="3" class="pr-1">
      <a-tooltip>
        <template slot="title">
          {{$t('directive.communicator.modbus.tooltipSlaveId')}}
        </template>
        <a-input 
          ref="txtSlaveId"
          addon-before="#" 
          v-model="target.modbusSlaveId" 
          @change="actionUpdateTarget" 
        />
      </a-tooltip>
    </a-col>

    <a-col :span="10" class="pr-1">
      <a-input-group compact>
        <!-- function code -->
        <a-select ref="sltFuncCode" style="width: 60%" v-model="target.modbusFuncCode" @change="actionFuncCodeChange">
          <a-select-option value="01">{{$t('directive.communicator.modbus.func01')}}</a-select-option>
          <a-select-option value="02">{{$t('directive.communicator.modbus.func02')}}</a-select-option>
          <a-select-option value="03">{{$t('directive.communicator.modbus.func03')}}</a-select-option>
          <a-select-option value="04">{{$t('directive.communicator.modbus.func04')}}</a-select-option>
          <a-select-option value="05">{{$t('directive.communicator.modbus.func05')}}</a-select-option>
          <a-select-option value="06">{{$t('directive.communicator.modbus.func06')}}</a-select-option>
          <a-select-option value="15">{{$t('directive.communicator.modbus.func15')}}</a-select-option>
          <a-select-option value="16">{{$t('directive.communicator.modbus.func16')}}</a-select-option>
        </a-select>
        
        <!-- data address -->
        <a-tooltip>
          <template slot="title">
            {{$t('directive.communicator.modbus.tooltipDataAddress')}}
          </template>
          <a-input 
            ref="txtAddress"
            style="width:20%" 
            :placeholder="$t('directive.communicator.modbus.address')"
            v-model="target.modbusAddress" 
            @change="actionUpdateTarget" 
          />
        </a-tooltip>

        <!-- data length -->
        <a-tooltip v-if="lenEnableMap[target.modbusFuncCode]">
          <template slot="title">
            {{$t('directive.communicator.modbus.tooltipDataLength')}}
          </template>
          <a-input 
            ref="txtLength"
            style="width:20%"
            :placeholder="$t('directive.communicator.modbus.length')"
            v-model="target.modbusLength" 
            @change="actionUpdateTarget" 
          />
        </a-tooltip>
      </a-input-group>
    </a-col>
    
    <!-- setting -->
    <a-col :span="1">
      <a-button 
        ref="btnSetting"
        @click="actionSetting"
      ><a-icon type="setting" /></a-button>
      <a-modal 
        v-if="settingEnable" 
        v-model="settingEnable"
        ref="modalSetting" 
        :title="$t('directive.communicator.modbus.settingTitle')"
        :okText="$t('button.ok')"
        :cancelText="$t('button.cancel')"
        @ok="actionSettingOk"
      >
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
          <!-- byteswap -->
          <a-form-item :label="$t('directive.communicator.modbus.byteswap')">
            <a-checkbox 
              ref="sltByteSwap" 
              v-model="settingOptions.modbusByteSwapEnable" 
              @change="actionForceUpdate"
            ></a-checkbox>
          </a-form-item>
          
          <template v-if="'RTU' === target.modbusMode || 'ASCII' ===  target.modbusMode" >
            <!-- dataBits -->
            <a-form-item :label="$t('directive.communicator.serialport.dataBits')">
              <a-select ref="sltDataBits" v-model="settingOptions.modbusDataBits" @change="actionForceUpdate">
                <a-select-option value="5">5</a-select-option>
                <a-select-option value="6">6</a-select-option>
                <a-select-option value="7">7</a-select-option>
                <a-select-option value="8">8</a-select-option>
              </a-select>
            </a-form-item>

            <!-- stopBits -->
            <a-form-item :label="$t('directive.communicator.serialport.stopBits')">
              <a-select ref="sltStopBits" v-model="settingOptions.modbusStopBits" @change="actionForceUpdate">
                <a-select-option value="1">1</a-select-option>
                <a-select-option value="1.5">1.5</a-select-option>
                <a-select-option value="2">2</a-select-option>
              </a-select>
            </a-form-item>
    
            <!-- parity -->
            <a-form-item :label="$t('directive.communicator.serialport.parity')">
              <a-select ref="sltParity" v-model="settingOptions.modbusParity" @change="actionForceUpdate">
                <a-select-option value="none">None</a-select-option>
                <a-select-option value="odd">Odd</a-select-option>
                <a-select-option value="even">Even</a-select-option>
                <a-select-option value="mark">Mark</a-select-option>
                <a-select-option value="space">Space</a-select-option>
              </a-select>
            </a-form-item>
          </template>
        </a-form>
      </a-modal>
    </a-col>
  </a-row>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js'
import Communicator from './Communicator.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
export default {
    name : 'ModbusTargetEditor',
    mixins : [TargetEditorMixin],
    data() {
        return {
            /**
             * indicate whether enable setting modal
             * @property {Boolean}
             */
            settingEnable : false,
            /**
             * ext setting options
             * @property {Object}
             */
            settingOptions : {},
            /**
             * serialport options
             * @property {Object}
             */
            serialportOptions : {
                serialports : [],
                baudRates : [
                    '110','300','600','1200','2400','4800','9600','14400','19200',
                    '38400','56000','57600','76800','115200','128000','153600',
                    '230400','256000','307200','460800','614400','921600','1382400'
                ],
            },
            /**
             * function ocde - length requirement map
             * @property {Object}
             */
            lenEnableMap : {
                '01' : true,'02' : true,'03' : true,'04' : true,
                '05' : false,'06' : false,'15' : false,'16' : false,
            },
        };
    },
    mounted() {
        this.initTarget();
    },
    methods: {
        /**
         * init target model
         */
        async initTarget() {
            let hasChanged = MyObject.applyDefaultValues(this.target, {
                modbusMode : 'RTU',
                modbusSerialport : ' ',
                modbusBaudRate : '9600',
                modbusDataBits : '8',
                modbusStopBits : '1',
                modbusParity : 'none',
                modbusHost : '127.0.0.1',
                modbusPort : '502',
                modbusSlaveId : '1',
                modbusFuncCode : '03',
                modbusAddress : '0',
                modbusLength : '1',
                modbusByteSwapEnable : false,
            });

            if ( hasChanged ) {
                this.updateVModel();
                this.$forceUpdate();
            }
            
            this.parameterEditorEnable(this.shouldDisableParameter());
            this.isEditorInited = true;
        },

        /**
         * get indicator if parameter editor should be disabled by current configuration.
         * @returns {Boolean}
         */
        shouldDisableParameter() {
            return -1 == ['01','02','03','04'].indexOf(this.target.modbusFuncCode);
        },

        /**
         * refresh serial port list
         * @param {Boolean} disableMessage default to false
         */
        async actionSerialPortListRefresh( disableMessage ) {
            let serialports = await Communicator.listSerialPorts();
            this.serialportOptions.serialports = [];
            for ( let i=0; i<serialports.length; i++ ) {
                this.serialportOptions.serialports.push(serialports[i].path);
            }

            if ( '' == this.target.modbusSerialport.trim() && 1 < serialports.length ) {
                this.target.modbusSerialport = this.serialportOptions.serialports[0];
                this.actionUpdateTarget(true);
            }

            if ( !(disableMessage || false) ) {
                this.$message.success(this.$t('directive.communicator.modbus.deviceRefreshSuccess'));
            }

            this.$forceUpdate();
        },

        /**
         * enable setting modal
         */
        actionSetting() {
            this.settingOptions = MyObject.copy(this.target);
            this.settingEnable = true;
        },

        /**
         * event handler on setting done
         */
        actionSettingOk() {
            if ( !MyObject.isEqual(this.settingOptions, this.target) ) {
                this.target = MyObject.copy(this.settingOptions);
                this.actionUpdateTarget(true);
            }
            this.settingEnable = false;
        },

        /**
         * event handler on function code changed
         */
        actionFuncCodeChange() {
            this.actionUpdateTarget();
            this.parameterEditorEnable(this.shouldDisableParameter());
        },

        /**
         * @overide
         * @param {Object} options
         * @returns {String}
         */
        getComKeyByOptions(options) {
            return Communicator.generateKeyFromOptions(options);
        },
    },

    /**
     * editor config
     * @returns {Object}
     */
    editorConfig() {
        return {
            name : 'Modbus',
            label : window.app.$t('directive.communicator.modbus.name'),
            defaultDataType:'short',
            defaultResponseViewer : 'hex'
        };
    }
}
</script>