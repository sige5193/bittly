<template>
  <div class="d-inline-block mr-2">
    <a-dropdown :trigger="['click']">
      <span class="app-dropdown-menu-title">{{$t('plugin.moduleName')}}</span>

      <a-menu ref="menu" slot="overlay" @click="actionHandleMenuItemClicked">
        <!-- plugin menu-->
        <a-sub-menu v-for="(pluginMenu, pluginMenuIndex) in pluginMenuItems" 
          :key="`plugin_${pluginMenuIndex}`"
          :title="pluginMenu.label"
        >
          <a-menu-item v-for="(subPluginMenuItem, subPluginMenuItemIndex) in pluginMenu.items" 
            :key="`plugin_${pluginMenuIndex}_sub_${subPluginMenuItemIndex}`"
            :data-plugin-index="pluginMenuIndex"
            :data-action-index="subPluginMenuItemIndex"
          >{{subPluginMenuItem.label}}</a-menu-item>
        </a-sub-menu>

        <!-- manager -->
        <a-menu-item key="manager">{{$t('plugin.manager')}}</a-menu-item>
      </a-menu>
    </a-dropdown>
    <manager-modal ref="manager" />
  </div>
</template>
<script>
import ManagerModal from './ManagerModal.vue'
export default {
    name : 'PluginTitleMenu',
    components : {
        'manager-modal' : ManagerModal,
    },
    data() {
        return {
            pluginMenuItems : [],
        };
    },
    created() {
        this.$eventBus.$emit('app-title-menu-plugin-init', this);
    },
    methods : {
        /**
         * @param {Object} item
         */
        menuItemRegister( item ) {
            this.pluginMenuItems.push(item);
        },

        /**
         * handle menu item clicked
         */
        actionHandleMenuItemClicked( event ) {
            if ( 'manager' === event.key ) {
                this.$refs.manager.open();
                return ;
            }

            let data = event.domEvent.target.dataset;
            let plguinIndex = data.pluginIndex * 1;
            let actionIndex = data.actionIndex * 1;
            let action = this.pluginMenuItems[plguinIndex].items[actionIndex].action;
            action();
        }
    },
}
</script>