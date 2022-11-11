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
          <p v-if="'classic' == device.options.btType"> 
            {{$t('directive.communicator.bluetooth.address')}} : <br/> 
            <span ref="lblClassicAddress">{{device.options.btAddress}}</span>
          </p>
          <template v-if="'ble' == device.options.btType">
            <p> 
              {{$t('directive.communicator.bluetooth.deviceId')}} : <br/> 
              <span>{{device.options.btBleId}}</span>
            </p>
            <p> 
              {{$t('directive.communicator.bluetooth.service')}} : <br/> 
              <span>{{device.options.btBleServiceId}}</span>
            </p>
            <p> 
              {{$t('directive.communicator.bluetooth.characteristic')}} : <br/> 
              <span>{{device.options.btBleCharId}}</span>
            </p>
          </template>
          <p>
            {{$t('app.device.dataTrans')}} : 
            {{$t('app.device.dataTransSend')}} {{device.getDataSendSize() | filesize}} 
            {{$t('app.device.dataTransReceive')}} {{device.getDataReceiveSize() | filesize}} 
          </p>
        </div>
      </template>
      <div class="name" ref="tagDevice">
        {{$t('directive.communicator.bluetooth.name')}} 
        {{device.handler.getDeviceTitle()}}
      </div>
    </a-popover>
    <div class="action" @click="actionClose" ref="btnClose">
      <a-icon :type="isClosing ? 'loading' : 'close'"/>
    </div>
  </div>
</template>
<script>
import PopoverMixin from '../PopoverMixin.js'
export default {
    name : 'CommunicatorPopoverBluetooth',
    mixins : [PopoverMixin],
    data() {
        return {
            isClosing : false,
        };
    },
    methods : {
        /**
         * close connection
         */
        actionClose() {
            if ( this.isClosing ) {
                return;
            }
            this.isClosing = true;
            this.device.close();
        },
    }
}
</script>