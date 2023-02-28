<template>
  <a-row>
    <a-col :span="5" class="pr-1">
      <a-input-group compact class="my-input-group">
        <span class="label">{{$t('directive.communicator.bluetooth.type')}}</span>
        <a-select class="input" ref="sltType" v-model="target.btType" @change="actionBtTypeChange">
          <a-select-option value="classic">{{$t('directive.communicator.bluetooth.typeClassic')}}</a-select-option>
          <a-select-option value="ble">{{$t('directive.communicator.bluetooth.typeBle')}}</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>

   <!-- Classic -->
    <a-col :span="10" class="pr-1" v-if="'classic' == target.btType && $env.bluetoothClassicAvailable">
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
        
        <!-- web bluetooth request device -->
        <template v-if="'browser' === $env.name">
          <a-button class="pl-0 pr-0 w-10"
            :disabled="!bleDeviceRefreshEnable"
            @click="actionWebBleDeviceListRefresh"
          ><a-icon type="search"/></a-button>
        </template>

        <!-- electron bluetooth requests device -->
        <template v-else>
          <a-button v-if="!bleIsRefreshing" ref="btnBleDeviceRefresh" class="pl-0 pr-0 w-10"
            :disabled="!bleDeviceRefreshEnable"
            @click="actionBleDeviceListRefresh"
          ><a-icon type="search"/></a-button>
          <a-button v-if="bleIsRefreshing" ref="btnBleDeviceRefreshStop" class="pl-0 pr-0 w-10"
            @click="actionBleDeviceListRefreshStop"
          ><a-icon type="stop"/></a-button>
        </template>

        <!-- ble device id -->
        <a-select class="w-40" ref="selectDeviceId"
          v-model="target.btBleId"
          :open="bleDeviceListOpen"
          :disabled="0 == bleDeviceList.length"
          :loading="bleIsRefreshing" 
          :dropdownMatchSelectWidth="false"
          :placeholder="$t('directive.communicator.bluetooth.selectDevice')"
          :showArrow="false"
          @select="actionBleDeviceSelected"
        >
          <a-select-option v-for="device in bleDeviceList" 
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
import BtHandlerClassic from './BtHandlerClassic.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
import ElectronBleDeviceScanner from './ElectronBleDeviceScanner.js'
import MdbRuntimeVariable from '../../../../models/MdbRuntimeVariable.js'
import MyObject from '../../../../utils/datatype/MyObject.js'
import ComponentBase from '../../../../utils/component/Base.js'
import BtHandlerWebBluetoothBle from './BtHandlerWebBluetoothBle.js'
export default {
    name : 'TargetEditorBluetooth',
    mixins : [ComponentBase,TargetEditorMixin],
    data() {
        return {
            /**
             * list of ble devices
             * @property {Array<Object>}
             */
            bleDeviceList : [],
            /**
             * indicate whether the device list is open
             * @property {Boolean}
             */
            bleDeviceListOpen : false,
            /**
             * indicate whether device refresh button available.
             * @property {Boolean}
             */
            bleDeviceRefreshEnable : true,
            /**
             * indicate whether device list is refreshing or device is connecting.
             * @property {Boolean}
             */
            bleIsRefreshing : false,
            /**
             * list of characteristics of given service
             * @property {Array<>}
             */
            bleCharList : [],
            /**
             * indicate whether characteristic list is refreshing.
             * @property {Boolean}
             */
            bleIsCharRefreshing : false,
            /**
             * list of service ids in history.
             * @property {Array<String>}
             */
            bleHistoryServiceIds : [],
            /**
             * instance of electron ble scanner
             * @property {ElectronBleDeviceScanner}
             */
            bleElectronScanner : null,

            isRefreshing : false,
            /**
             * classic bluetooth device list
             * @property {Array<Object>}
             */
            devlist : [],
        };
    },
    mounted() {
        this.initTarget();
        this.init();
    },
    methods : {
        /**
         * event handler to request ble device for web browser
         * @environment browser
         */
        async actionWebBleDeviceListRefresh() {
            try {
                if ( Common.isEmpty(this.target.btBleServiceId) ) {
                    throw Error(this.$t('directive.communicator.bluetooth.serviceIdCannotBeEmpty'));
                }

                let serviceId = this.target.btBleServiceId.toLowerCase();
                if ( serviceId.startsWith('0x') ) {
                    serviceId = serviceId * 1;
                }

                let requestOptions = {};
                requestOptions.optionalServices = [serviceId];
                requestOptions.acceptAllDevices = true;
                let device = await navigator.bluetooth.requestDevice(requestOptions);
                
                this.target.btBleId = device.id;
                this.updateVModel();

                this.bleDeviceRefreshEnable = false;
                let isSuccessed = await this.handleOnBleDeviceSelected(device);
                if ( isSuccessed ) {
                    await BtHandlerWebBluetoothBle.cacheDevice(device);
                }
            } catch (e) {
                this.$message.error(e.message);
            }
        },

        /**
         * once the ble device is selected, we need to refresh characteristics
         * of this ble device.
         * @param {BluetoothDevice} device
         * @returns {Primise<Boolean>}
         */
        async handleOnBleDeviceSelected( device ) {
            this.bleDeviceList = [{deviceId:device.id,deviceName:device.name}];
            this.bleIsCharRefreshing = true;
            this.bleIsRefreshing = true;
            this.bleCharList = [];

            try {
                this.$message.loading(this.$t('directive.communicator.bluetooth.connecting'), 0);
                let server = await device.gatt.connect();
                this.bleIsRefreshing = false;
                let services = await server.getPrimaryServices();
                let service = null;
                
                let serviceId = this.target.btBleServiceId.toLowerCase();
                if ( '0x' === serviceId.substr(0, 2) ) {
                    serviceId = parseInt(serviceId);
                }
                serviceId = BluetoothUUID.getService(serviceId);
                for ( let i=0; i<services.length; i++ ) {
                    if ( services[i].uuid === serviceId ) {
                        service = services[i];
                        break;
                    }
                }
                if ( null === server ) {
                    throw Error('unable to get service');
                }
                
                this.bleCharList = await service.getCharacteristics();
                this.$message.destroy();

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
                    let history = JSON.stringify(this.bleHistoryServiceIds);
                    await MdbRuntimeVariable.setVarValue('bluetooth_ble_history_service_ids',history);
                }

                this.$forceUpdate();
                return true;
            } catch ( e ) {
                this.target.btBleId = '';
                this.updateVModel();

                this.bleCharList = [];
                this.bleDeviceList = [];
                this.bleIsRefreshing = false;
                this.bleIsCharRefreshing = false;
                this.bleDeviceRefreshEnable = true;

                if ( device.gatt.connected ) {
                    device.gatt.disconnect();
                }
                
                this.$message.destroy();
                let errorMessageKey = 'directive.communicator.bluetooth.unableToConnectToDevice';
                this.$message.error(this.$t(errorMessageKey, [e.message]));
                return false;
            }
        },

        /**
         * init target model
         */
        initTarget() {
            let hasChanged = MyObject.applyDefaultValues(this.target, {
                btType : this.$env.bluetoothDefaultType,
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
            } else {
                this.bleHistoryServiceIds = [];
            }
        },

        /**
         * event handler on bluetooth type changed
         */
        actionBtTypeChange() {
            this.actionUpdateTarget();
            if ( 'classic' === this.target.btType && !this.$env.bluetoothClassicAvailable ) {
                this.environmentNotSupport();
            }
        },

        /**
         * refresh classic device list
         */
        async actionClassicDeviceListRefresh() {
            this.isRefreshing = true;
            this.devlist = [];
            
            let list = await BtHandlerClassic.list();
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
            this.target.btBleCharId = '';
            this.bleCharList = [];
            this.bleDeviceList = [];
            if ( null === this.bleElectronScanner ) {
                this.bleElectronScanner = ElectronBleDeviceScanner.getScanner();
            }
            let $this = this;
            this.bleElectronScanner.onRefresh(( devices ) => {
                $this.bleDeviceList = devices;
                $this.bleDeviceListOpen = true;
            });
            this.bleElectronScanner.onDeviceSelected(( device ) => {
                $this.handleOnBleDeviceSelected(device);
            });
            this.bleElectronScanner.onError(( error ) => {
                if ( 'User cancelled the requestDevice() chooser.' != error.message ) {
                    $this.$message.error(error.message);
                }
                $this.bleIsRefreshing = false;
                $this.bleDeviceRefreshEnable = true;
            });

            try {
                this.bleElectronScanner.serviceId = this.target.btBleServiceId;
                await this.bleElectronScanner.start();
                this.bleIsRefreshing = true;
            } catch (error) {
                console.error(error);
                this.$message.error(error.message);
                this.bleDeviceRefreshEnable = true;
            }
            this.$forceUpdate();
        },

        /**
         * stop refreshing ble device
         */
        actionBleDeviceListRefreshStop() {
            this.bleElectronScanner.stop();
            this.bleIsRefreshing = false;
            this.bleDeviceList = [];
        },

        /**
         * event handelr for ble device selected
         */
        actionBleDeviceSelected() {
            this.bleDeviceListOpen = false;
            if ( this.bleIsRefreshing ) {
                this.bleElectronScanner.select(this.target.btBleId);
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
            name : 'Bluetooth',
            label : window.app.$t('directive.communicator.bluetooth.name'), 
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