<template>
  <div class="d-inline-block w-45">
    <!-- device list -->
    <a-select class="w-100 rounded-none" style="z-index:1;"
      v-model="deviceId"
      :showArrow="false" 
      :dropdownMatchSelectWidth="false"
      :placeholder="$t('directive.communicator.modbus.deviceSelectPlaceholder')"
      @change="actionDeviceIdChange"
    >
      <a-select-option v-for="(device,deviceName) in devices" :key="deviceName" :value="deviceName">
        {{deviceName}}
      </a-select-option>
      <div slot="dropdownRender" slot-scope="menu">
        <v-nodes :vnodes="menu" />
        <a-divider style="margin: 4px 0;" />
        <div class="device-list-ext-action" @mousedown="e => e.preventDefault()">
          <a-icon type="reload" class="action" @click="actionRefreshDevice"/>
          <a-divider type="vertical" style="height:22px;"/>
          <a-icon type="plus" class="action" @click="actionRequestDevice"/> 
        </div>
      </div>
    </a-select>
    
    <!-- device name editor -->
    <a-modal v-if="devNameEditEnable" :visible="devNameEditEnable" 
      :title="$t('directive.communicator.modbus.webSerialDeviceNameEdit')"
      :okText="$t('button.ok')"
      :cancelText="$t('button.cancel')"
      @ok="actionDevNameEditOk"
    >
      <a-input v-model="devNameEditValue"
        :placeholder="$t('directive.communicator.modbus.webSerialDeviceNamePlaceholder')" 
      />
    </a-modal>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject';
import MyString from '../../../../utils/datatype/MyString';
export default {
    name : 'DirectiveComModbuWebSerialDeviceSelector',
    components: {
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes,
        },
    },
    props : {
        /**
         * @property {String}
         */
        value : {},
    },
    data() {
        return {
            /**
             * indicate whether device name editor is opened.
             * @property {Boolean}
             */
            devNameEditEnable : false,
            /**
             * resolve or reject handler of editor action.
             * @property {null|Object}
             */
            devNameEditPromiseHandlers : null,
            /**
             * name of device to edit
             * @property {String}
             */
            devNameEditValue : '',
            /**
             * list of devices
             * @property {Object<String:Object>}
             */
            devices : {},
            /**
             * selected device id
             * @property {String|null}
             */
            deviceId : null,
        };
    },
    created() {
        this.deviceId = this.value;
    },
    mounted() {
        this.actionRefreshDevice({displayNotice:false});
    },
    methods : {
        /**
         * refresh device list.
         */
        async actionRefreshDevice(options) {
            MyObject.applyDefaultValues(options, {
                displayNotice : true,
            });

            let ports = await navigator.serial.getPorts();
            for ( let i=0; i<ports.length; i++ ) {
                let port = ports[i];
                if ( undefined === port.devName ) {
                    continue;
                }
                this.devices[port.devName] = port;
            }
            this.$forceUpdate();
            if ( options.displayNotice ) {
                this.$message.info(this.$t('directive.communicator.modbus.webSerialDeviceRefreshed'));
            }
        },

        /**
         * request a new device and add it to device list.
         */
        async actionRequestDevice() {
             try {
                let device = await navigator.serial.requestPort();
                if ( undefined === device.devName ) {
                    device.devName = await this.editDeviceName();
                }
                this.devices[device.devName] = device;
                this.deviceId = device.devName;
                this.actionDeviceIdChange();
                this.$forceUpdate();
            } catch {}
        },

        /**
         * edit device name.
         * @returns {Promise<String>}
         */
        editDeviceName() {
            let $this = this;
            return new Promise(( resolve, reject ) => {
                let devId = MyString.generateShortSecKey();
                $this.devNameEditEnable = true;
                $this.devNameEditValue = `mb-${devId}`;
                $this.devNameEditPromiseHandlers = {resolve,reject};
            });
        },

        /**
         * event handler on edit modal ok
         */
        actionDevNameEditOk() {
            if ( 0 === this.devNameEditValue.trim().length ) {
                let messageKey = 'directive.communicator.modbus.webSerialDeviceNameCannotBeEmpty';
                this.$message.error(this.$t(messageKey));
                return ;
            }
            this.devNameEditEnable = false;
            this.devNameEditPromiseHandlers.resolve(this.devNameEditValue);
        },

        /**
         * event handler on device id changed
         */
        actionDeviceIdChange () {
            this.$emit('input', this.deviceId);
            this.$emit('change');
        }
    },
}
</script>
<style scoped>
.device-list-ext-action {display: flex;flex-direction: row;justify-content: space-evenly;padding: 3px;}
.device-list-ext-action .action {
    cursor: pointer;
    width: 45%;
    line-height: 24px;
    display: block;
    border-radius: 5px;
}
.device-list-ext-action .action:hover {background: whitesmoke;}
</style>