<!--
 - popover for network
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
            {{$t('directive.communicator.network.protocol')}} : {{device.options.protocol}} 
            {{$t('directive.communicator.network.address')}} : <span ref="lblHost">{{device.options.host}}</span>
            {{$t('directive.communicator.network.port')}} : {{device.options.port}}
          </p>
          <p v-if="'UDP' === device.options.protocol">
            {{$t('directive.communicator.network.udpLocalAddress')}} : {{device.handler.connection.address().address}}
            {{$t('directive.communicator.network.udpLocalPort')}} : {{device.handler.connection.address().port}}
          </p>
          <p>
            {{$t('app.device.dataTrans')}} : 
            {{$t('app.device.dataTransSend')}} {{device.getDataSendSize() | filesize}} 
            {{$t('app.device.dataTransReceive')}} {{device.getDataReceiveSize() | filesize}} 
          </p>
        </div>
      </template>
      <div class="name" ref="tagDevice">
        {{$t('directive.communicator.network.name')}} : 
        {{device.options.protocol}} 
        {{device.options.host}}:{{device.options.port}}
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
         * Close network connection
         */
        actionClose() {
            this.device.close();
        },
    }
}
</script>