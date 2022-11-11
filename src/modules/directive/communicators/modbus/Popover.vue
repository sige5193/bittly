<template>
  <div class="popover-trigger">
    <a-popover 
      :title="$t('app.device.infoTitle')" 
      placement="topRight" 
      trigger="click"
      @visibleChange="actionRefresh"
    >
      <template slot="content">
        <div class="d-inline-block">
          <p v-if="'RTU' == device.options.modbusMode || 'ASCII' == device.options.modbusMode">
            {{$t('directive.communicator.modbus.connection')}} : 
            {{device.options.modbusMode}}
            <span ref="lblSerialport">{{device.options.modbusSerialport}}</span>@{{device.options.modbusBaudRate}}
          </p>
          <p v-if="'TCP-IP' == device.options.modbusMode">
            {{$t('directive.communicator.modbus.connection')}} : 
            {{device.options.modbusMode}}
            <span ref="lblAddress">{{device.options.modbusHost}}:{{device.options.modbusPort}}</span>
          </p>
          <p>
            {{$t('app.device.dataTrans')}} : 
            {{$t('app.device.dataTransSend')}} {{device.getDataSendSize() | filesize}} 
            {{$t('app.device.dataTransReceive')}} {{device.getDataReceiveSize() | filesize}} 
          </p>
        </div>
      </template>
      <div class="name" ref="tagDevice">
        Modbus : {{shortName}}
      </div>
    </a-popover>
    <div ref="actionClose" class="action" @click="actionClose">
      <a-icon type="close" />
    </div>
  </div>
</template>
<script>
import PopoverMixin from '../PopoverMixin.js'
export default {
    name : 'CommunicatorPopoverNetwork',
    mixins : [PopoverMixin],
    computed : {
        shortName() {
            return this.generateShortName();
        },
    },
    methods : {
        /**
         * close device connection
         */
        actionClose() {
            this.device.close();
        },

        /**
         * generate short name
         */
        generateShortName() {
            let options = this.device.options;
            if ( 'RTU' == options.modbusMode || 'ASCII' == options.modbusMode ) {
                return `${options.modbusSerialport}@${options.modbusBaudRate}`
            } else if ( 'TCP-IP' === options.modbusMode ) {
                return `${options.modbusHost}:${options.modbusPort}`;
            }
        }
    }
}
</script>