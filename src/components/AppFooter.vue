<template>
  <a-layout-footer class="footer border-top">
    <a-row>
      <a-col :span="8">
        <app-update />
        <app-error-handler />

        <!-- contact : QQ -->
        <a-popover placement="topLeft">
          <template slot="title"><a-icon type="qq" /> : 568109749 </template>
          <template slot="content">
            <p><img src="../assets/sige-qq.jpg" style="width:150px;height:150px;"></p>
          </template>
          <a-icon ref="iconQQ" class="cursor-pointer" type="qq" @click="actionStartQQ"/>
        </a-popover>

        <!-- contact : Wechat -->
        <a-popover placement="topLeft">
          <template slot="title"><a-icon type="wechat" /> : sige-5193 </template>
          <template slot="content">
            <p><img src="../assets/sige-wechat.jpg" style="width:150px;height:150px;"></p>
          </template>
          <a-icon class="cursor-pointer ml-1" type="wechat" />
        </a-popover>
        
        <a-icon class="cursor-pointer ml-2" type="github" @click="actionStartGithub"/>

        <app-feedback></app-feedback>
      </a-col>

      <!-- communicators -->
      <a-col :span="16" class="text-right pr-2">
        &nbsp;
        <component ref="communicators" v-for="(com, comKey) in communicators" 
          :key="comKey"
          :is="`device-popover-${com.getDeviceType()}`"
          :device="com"
        ></component>
      </a-col>

    </a-row>
  </a-layout-footer>
</template>
<script>
import AppUpdate from './AppUpdate.vue'
import AppFeedback from './AppFeedback.vue'
import AppErrorHandler from './AppErrorHandler.vue'
import DevicePopoverRegistryMixin from '../modules/directive/communicators/PopoverRegistryMixin.js'
export default {
    name : 'AppFooter',
    components : {
        'app-update' : AppUpdate,
        'app-feedback' : AppFeedback,
        'app-error-handler' : AppErrorHandler,
    },
    mixins : [DevicePopoverRegistryMixin],
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
         * open QQ link
         */
        actionStartQQ() {
            window.shell.openExternal("http://wpa.qq.com/msgrd?v=1&uin=568109749&site=qq&menu=yes");
        },

        /**
         * start github page
         */
        actionStartGithub() {
            window.shell.openExternal("https://github.com/sige5193/bittly");
        },
    },
}
</script>
<style scoped>
.footer {padding: 3px;background: white;border-top: 1px solid #dee2e6 !important;}
</style>