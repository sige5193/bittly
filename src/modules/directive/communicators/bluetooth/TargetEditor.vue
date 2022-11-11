<template>
  <a-row>
    <a-col :span="5" class="pr-1">
      <a-input-group compact class="my-input-group">
        <span class="label">{{$t('directive.communicator.bluetooth.type')}}</span>
        <a-select class="input" ref="sltType" v-model="target.btType" @change="actionUpdateTarget">
          <a-select-option value="classic">{{$t('directive.communicator.bluetooth.typeClassic')}}</a-select-option>
          <a-select-option value="ble">{{$t('directive.communicator.bluetooth.typeBle')}}</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>

   <!-- Classic -->
    <a-col :span="10" class="pr-1" v-if="'classic' == target.btType">
      <a-input-group compact>
        <a-select style="width: 80%" 
          :loading="isRefreshing" 
          v-model="target.btAddress" 
          @change="actionUpdateTarget"
        >
          <a-select-option 
            v-for="(device,dindex) in devlist" 
            :key="dindex" 
            :value="device.address"
          >{{device.name}}</a-select-option>
        </a-select>
        <a-button 
          ref="btnClassicRefresh"
          style="width:20%;"
          :disabled="isRefreshing" 
          @click="actionClassicDeviceListRefresh"
        ><a-icon type="search"/></a-button>
      </a-input-group>
    </a-col>

    <!-- BLE -->
    <a-col :span="13" class="pr-1" v-if="'ble' == target.btType">
      <a-input-group compact class="my-input-group">
        <span class="label">{{$t('directive.communicator.bluetooth.service')}}</span>

        <!-- service id -->
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{$t('directive.communicator.bluetooth.service')}} : {{target.btBleServiceId}}</span>
          </template>
          <a-auto-complete
            ref="txtBleServiceId"
            style="width: 50%"
            v-model="target.btBleServiceId"
            :data-source="bleHistoryServiceIds"
            :placeholder="$t('directive.communicator.bluetooth.servicePlaceholder')"
            :dropdownMatchSelectWidth="false"
            @change="actionUpdateTarget"
          />
        </a-tooltip>

        <a-button 
          ref="btnBleDeviceRefresh"
          class="pl-0 pr-0 w-10"
          v-if="!bleIsRefreshing"
          :disabled="!bleDeviceRefreshEnable"
          @click="actionBleDeviceListRefresh"
        ><a-icon type="search"/></a-button>
        <a-button 
          ref="btnBleDeviceRefreshStop"
          class="pl-0 pr-0 w-10"
          v-if="bleIsRefreshing" 
          @click="actionBleDeviceListRefreshStop"
        ><a-icon type="stop"/></a-button>
        
        <!-- ble device id -->
        <a-select class="w-40" 
          ref="selectDeviceId"
          v-model="target.btBleId"
          :open="bleDeviceListOpen"
          :disabled="0 == bleDeviceList.length"
          :loading="bleIsRefreshing" 
          :dropdownMatchSelectWidth="false"
          :placeholder="$t('directive.communicator.bluetooth.selectDevice')"
          :showArrow="false"
          @select="actionBleDeviceSelected"
        >
          <a-select-option 
            v-for="device in bleDeviceList" 
            :key="device.deviceId" 
            :value="device.deviceId"
          >{{device.deviceName}}</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>
    
    <a-col :span="6" v-if="'ble' == target.btType">
      <!-- characteristic -->
      <a-input-group compact class="my-input-group">
        <span class="label">{{$t('directive.communicator.bluetooth.characteristic')}}</span>
        
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{$t('directive.communicator.bluetooth.characteristic')}} : {{target.btBleCharId}}</span>
          </template>
          <a-select class="input"
            dropdownClassName="select-characteristic"
            v-model="target.btBleCharId" 
            :dropdownMatchSelectWidth="false"
            :loading="bleIsCharRefreshing"
            :disabled="!target.btBleId"
            @change="actionBleDeviceSelected"
          >
            <a-select-option v-for="char in bleCharList" :key="char.uuid" :value="char.uuid"
            >{{char.uuid}}</a-select-option>
          </a-select>
        </a-tooltip>
      </a-input-group>

    </a-col>
  </a-row>
</template>
<script>
import Common from '@/utils/Common.js'
import ClassicHandler from './ClassicHandler.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
import BleDeviceScanner from './BleDeviceScanner.js'
import MdbRuntimeVariable from '../../../../models/MdbRuntimeVariable.js'
import MyObject from '../../../../utils/datatype/MyObject.js'
export default {
    name : 'TargetEditorBluetooth',
    mixins : [TargetEditorMixin],
    data() {
        return {
            isRefreshing : false,
            /**
             * classic bluetooth device list
             * @property {Array<Object>}
             */
            devlist : [],
            

            bleDevice : null,
            bleDeviceList : [],
            bleDeviceListOpen : false,
            bleCharList : [],
            bleScanner : null,
            bleIsRefreshing : false,
            bleIsCharRefreshing : false,
            bleHistoryServiceIds : [],

            /**
             * indicate if device refresh button available.
             * @property {Boolean}
             */
            bleDeviceRefreshEnable : true,
        };
    },
    mounted() {
        this.initTarget();
        this.init();
    },
    methods : {
        /**
         * init target model
         */
        initTarget() {
            let hasChanged = MyObject.applyDefaultValues(this.target, {
                btType : 'classic',
            });
            if ( hasChanged ) {
                this.updateVModel();
            }
            this.isEditorInited = true;
        },

        /**
         * init this target editor
         */
        async init() {
            this.bleHistoryServiceIds = [];
            this.bleHistoryServiceIds = await MdbRuntimeVariable.getVarValue('bluetooth_ble_history_service_ids',null);
            if ( null != this.bleHistoryServiceIds ) {
                this.bleHistoryServiceIds = JSON.parse(this.bleHistoryServiceIds);
            }
        },

        /**
         * refresh classic device list
         */
        async actionClassicDeviceListRefresh() {
            this.isRefreshing = true;
            this.devlist = [];
            
            let list = await ClassicHandler.list();
            if ( 0 == list.length ) {
                this.$message.info(this.$t('directive.communicator.bluetooth.noDeviceFound'));
            }
            for ( let i=0; i<list.length; i++ ) {
                // if address is empty, we ignore it. this issue was found on my win 7 without 
                // bluetooth device support.
                if ( 0 == list[i].address.length ) {
                    continue;
                }

                if ( 0 === list[i].name.length ) {
                    list[i].name = list[i].address;
                }
                this.devlist.push(list[i]);
            }
            this.isRefreshing = false;
        },

        /**
         * refresh ble device list
         */
        async actionBleDeviceListRefresh() {
            if ( Common.isEmpty(this.target.btBleServiceId) ) {
                this.$message.error(this.$t('directive.communicator.bluetooth.serviceIdCannotBeEmpty'));
                return;
            }
            
            this.bleDeviceRefreshEnable = false;
            this.target.btBleId = '';
            this.bleDeviceList = [];
            if ( null === this.bleScanner ) {
                this.bleScanner = BleDeviceScanner.getScanner();
            }
            let $this = this;
            this.bleScanner.onRefresh(( devices ) => {
                $this.bleDeviceList = devices;
                $this.bleDeviceListOpen = true;
            });
            this.bleScanner.onDeviceSelected(( device ) => {
                $this.handleOnBleDeviceSelected(device);
            });
            this.bleScanner.onError(( error ) => {
                if ( 'User cancelled the requestDevice() chooser.' != error.message ) {
                    $this.$message.error(error.message);
                }
                $this.bleIsRefreshing = false;
                $this.bleDeviceRefreshEnable = true;
            });

            try {
                this.bleScanner.serviceId = this.target.btBleServiceId;
                await this.bleScanner.start();
                this.bleIsRefreshing = true;
            } catch (error) {
                console.error(error);
                this.$message.error(error.message);
                this.bleDeviceRefreshEnable = true;
            }
            this.$forceUpdate();
        },

        /**
         * once the ble device is selected, we need to refresh characteristics
         * of this ble device.
         */
        async handleOnBleDeviceSelected( device ) {
            console.log(`handleOnBleDeviceSelected({id:${device.id},name:${device.name}})`);
            this.bleDeviceList = [{deviceId:this.target.btBleId,deviceName:device.name}];
            this.bleDevice = device;
            this.bleIsCharRefreshing = true;
            this.bleCharList = [];
            this.bleIsRefreshing = true;

            try {
                this.$message.loading(this.$t('directive.communicator.bluetooth.connecting'), 0);
                
                console.log(`bluetooth ble device [${device.name}] gatt server connecting ...`);
                let server = await this.bleDevice.gatt.connect();
                this.bleIsRefreshing = false;
                console.log(`bluetooth ble device [${device.name}] gatt server connectted`);
                
                console.log(`bluetooth ble device [${device.name}] fetching services from gatt server ...`);
                let services = await server.getPrimaryServices();
                let service = services[0];
                console.log(`bluetooth ble device [${device.name}] services : `, services);

                console.log(`bluetooth ble device [${device.name}] fetching characteristics from service ...`);
                this.bleCharList = await service.getCharacteristics();
                console.log(`bluetooth ble device [${device.name}] characteristics : `, this.bleCharList);

                this.$message.destroy();
            } catch ( e ) {
                this.bleDeviceRefreshEnable = true;
                if ( this.bleDevice.gatt.connected ) {
                    this.bleDevice.gatt.disconnect();
                }
                this.target.btBleId = '';
                this.bleDeviceList = [];
                this.bleIsCharRefreshing = false;
                this.bleIsRefreshing = false;
                this.$message.destroy();
                this.bleDevice = null;
                this.$message.error(this.$t('directive.communicator.bluetooth.unableToConnectToDevice', [e.message]));
                console.error(e);
                return;
            }
            
            if ( 1 == this.bleCharList.length ) {
                this.target.btBleCharId = this.bleCharList[0].uuid;
                this.updateVModel();
            }

            this.bleIsCharRefreshing = false;
            this.bleDeviceRefreshEnable = true;

            // add service uuid to history
            if ( -1 == this.bleHistoryServiceIds.indexOf(this.target.btBleServiceId) ) {
                this.bleHistoryServiceIds.push(this.target.btBleServiceId);
                if ( this.bleHistoryServiceIds.length > 10 ) {
                    this.bleHistoryServiceIds.shift();
                }
                await MdbRuntimeVariable.setVarValue(
                    'bluetooth_ble_history_service_ids', 
                    JSON.stringify(this.bleHistoryServiceIds)
                );
            }

            this.$forceUpdate();
        },

        /**
         * stop refreshing ble device
         */
        actionBleDeviceListRefreshStop() {
            this.bleScanner.stop();
            this.bleIsRefreshing = false;
            this.bleDeviceList = [];
        },

        /**
         * event handelr for ble device selected
         */
        actionBleDeviceSelected() {
            this.bleDeviceListOpen = false;
            if ( this.bleIsRefreshing ) {
                this.bleScanner.select(this.target.btBleId);
                this.bleIsRefreshing = false;
            }
            this.updateVModel();
            this.$forceUpdate();
        },
    },
    /**
     * Target editor config
     */
    editorConfig() {
        return { 
            name : window.app.$t('directive.communicator.bluetooth.name'), 
            defaultDataType:'byte', 
            defaultResponseViewer:'hex'
        };
    }
}
</script>
<style>
.select-characteristic > .ant-select-dropdown-content {
    position: absolute;
    right: 0;
    border: solid 1px #e7e4e4;
    border-radius: 4px;
    background: white;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}
</style>