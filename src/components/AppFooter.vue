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
        <mock-popovers />
        <communicator-popovers />
      </a-col>

    </a-row>
  </a-layout-footer>
</template>
<script>
import AppUpdate from './AppUpdate.vue'
import AppFeedback from './AppFeedback.vue'
import AppErrorHandler from './AppErrorHandler.vue'
import CommunicatorPopovers from '../modules/directive/communicators/CommunicatorPopovers.vue'
import MockPopovers from '../modules/mock/mockers/MockFooterPopovers.vue'
export default {
    name : 'AppFooter',
    components : {
        'app-update' : AppUpdate,
        'app-feedback' : AppFeedback,
        'app-error-handler' : AppErrorHandler,
        'communicator-popovers' : CommunicatorPopovers,
        'mock-popovers' : MockPopovers,
    },
    methods : {
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