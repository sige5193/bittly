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
            {{$t('directive.communicator.mqtt.uri')}} : <br>
            <small ref="lblUri">{{device.options.mqttUri}}</small>
          </p>
          <p>{{$t('directive.communicator.mqtt.publishTopic')}} : {{device.options.mqttPublishTopic}}</p>
          <p>
            {{$t('app.device.dataTrans')}} : 
            {{$t('app.device.dataTransSend')}} {{device.getDataSendSize() | filesize}} 
            {{$t('app.device.dataTransReceive')}} {{device.getDataReceiveSize() | filesize}} 
          </p>
        </div>
      </template>
      <div class="name" ref="tagDevice">
        {{device.options.mqttUri}}
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
    name : 'CommunicatorPopoverNetwork',
    mixins : [PopoverMixin],
    methods : {
        /**
         * Close device
         */
        actionClose() {
            this.device.close();
        },
    }
}
</script>