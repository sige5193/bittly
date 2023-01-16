<template>
  <div class="d-inline-block">
    <!-- custom communicators -->
    <div v-for="(com, comKey) in communicators" :key="comKey" class="d-inline-block">
      <div v-if="true === com.isCustom" class="popover-trigger">
        <div class="name">{{com.title}}</div>
        <div ref="actionClose" class="action" @click="actionClose(comKey)">
          <a-icon type="close"/>
        </div>
      </div>

      <!-- build in communicators -->
      <component v-else
        :is="`device-popover-${com.getDeviceType()}`"
        :device="com"
      ></component>
    </div>
  </div>
</template>
<script>
require('./PopoverStyle.css');
import BluetoothPopover from './bluetooth/Popover.vue'
import NetworkPopover from './network/Popover.vue'
import SerialPortPopover from './serialport/Popover.vue'
import WebsocketPopover from './websocket/Popover.vue'
import MqttPopover from './mqtt/Popover.vue'
import ModbusPopover from './modbus/Popover.vue'
export default {
    name : 'DirectiveCommunicatorPopovers',
    components : {
        'device-popover-serialport' : SerialPortPopover,
        'device-popover-network' : NetworkPopover,
        'device-popover-bluetooth' : BluetoothPopover,
        'device-popover-websocket' : WebsocketPopover,
        'device-popover-mqtt' : MqttPopover,
        'device-popover-modbus' : ModbusPopover,
    },
    data() {
        return {
            communicators : {}
        };
    },
    created() {
        this.$eventBus.$on('communicator-online', () => this.refreshCommunicators());
        this.$eventBus.$on('communicator-offline', () => this.refreshCommunicators());
    },
    methods : {
        /**
         * refresh communicators
         */
        refreshCommunicators() {
            this.communicators = {};
            let list = this.$store.getters.communicators;
            for ( let key in list ) {
                this.communicators[key] = list[key];
            }
        },

        /**
         * close connection
         */
        actionClose(key) {
            debugger
            this.communicators[key].close();
        },
    }
}
</script>