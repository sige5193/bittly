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
            {{$t('directive.communicator.websocket.address')}} : <span ref="lblWsUrl"> {{device.options.wsUrl}} </span>
          </p>
          <p>
            {{$t('app.device.dataTrans')}} : 
            {{$t('app.device.dataTransSend')}} {{device.getDataSendSize() | filesize}} 
            {{$t('app.device.dataTransReceive')}} {{device.getDataReceiveSize() | filesize}} 
          </p>
        </div>
      </template>
      <div class="name" ref="tagDevice">
        {{device.options.wsUrl}}
      </div>
    </a-popover>
    <div ref="actionClose" class="action" @click="actionClose">
      <a-icon type="close"/>
    </div>
  </div>
</template>
<script>
import PopoverMixin from '../PopoverMixin.js'
require('../PopoverStyle.css');
export default {
    name : 'CommunicatorPopoverNetwork',
    mixins : [PopoverMixin],
    methods : {
        /**
         * close connection
         */
        actionClose() {
            this.device.close();
        },
    }
}
</script>