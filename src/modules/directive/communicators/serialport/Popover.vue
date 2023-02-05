<!-- 
 - popover for serial port
 - @author sige
-->
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
          <p>
            {{$t('directive.communicator.serialport.name')}} : <span ref="lblPath">{{device.options.path}}</span> 
            {{$t('directive.communicator.serialport.baudRate')}} : {{device.options.baudRate}}
          </p>
          <p>
            {{$t('app.device.dataTrans')}} : 
            {{$t('app.device.dataTransSend')}} {{device.getDataSendSize() | filesize}} 
            {{$t('app.device.dataTransReceive')}} {{device.getDataReceiveSize() | filesize}} 
          </p>
        </div>
      </template>
      <div class="name" ref="tagDevice">
        {{$t('directive.communicator.serialport.name')}} : {{device.options.path}}
      </div>
    </a-popover>
    <div class="action" ref="actionClose" @click="actionClose">
      <a-icon type="close"/>
    </div>
  </div>
</template>
<script>
import PopoverMixin from '../PopoverMixin.js'
require('../PopoverStyle.css');
export default {
    name : 'CommunicatorPopoverSerialPort',
    mixins : [PopoverMixin],
    methods : {
        /**
         * Close device
         */
        async actionClose() {
            await this.device.close();
        },
    }
}
</script>