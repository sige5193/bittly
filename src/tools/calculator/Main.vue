<template>
  <div class="h-100 d-flex flex-dir-column">
    <app-tool-menu :tname="$t('app.toolCalculator.windowTitle')"/>

    <template v-if="hasInited">
      <a-layout class="h-100">
        <a-layout-sider width="250" class="h-100" theme="light">
          <a-menu mode="vertical" @click="actionMenuClick">
            <a-menu-item v-for="(cal, cindex) in cals" :key="cindex">
              <a-icon type="calculator" />
              {{cal.name}}
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        <a-layout-content>
          <component v-if="null != activeCal" :is="activeCal"></component>
        </a-layout-content>
      </a-layout>
    </template>
  </div>
</template>
<script>
import ToolMixin from '../utils/ToolMixin.js'
import AppToolMenu from '../utils/AppToolMenu.vue'
import AppHelper from '../../utils/AppHelper.js'
import CalsRegistryMixin from './CalsRegistryMixin.js'
require('../../utils/Common.css');
export default {
    name : 'ToolCalculator',
    mixins : [CalsRegistryMixin,ToolMixin],
    components : {
        'app-tool-menu' : AppToolMenu,
    },
    data() {
        return {
            hasInited : false,
            activeCal : null,
        };
    },
    mounted () {
        this.init();
    },
    methods : {
        /**
         * 初始化
         */
        async init() {
            this.hasInited = false;
            this.$i18n.locale = await AppHelper.langCodeGet();
            document.title = this.$t('app.toolCalculator.windowTitle');
            this.initCalList();
            this.hasInited = true;
        },

        /**
         * 菜单项目点击
         */
        actionMenuClick( event ) {
            this.activeCal = this.cals[event.key].key;
        }
    },
}
</script>