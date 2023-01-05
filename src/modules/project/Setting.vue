<template>
  <a-layout>
    <a-layout-sider width="300" class="bg-white border-right">
      <a-menu mode="inline" @click="actionHandleMenuItemClicked" :selectedKeys="[activePanel]">
        <a-menu-item key="base"> {{$t('project.menuItemBaseInfo')}} </a-menu-item>
        <a-menu-item key="script"> {{$t('project.menuItemScript')}} </a-menu-item>
        <a-menu-item key="publish"> {{$t('project.publishLabel')}} </a-menu-item>
        <a-menu-item key="update"> {{$t('project.updateMenuTitle')}} </a-menu-item>
        <a-menu-item key="member"> {{$t('project.membershipMenuTitle')}} </a-menu-item>
        <a-menu-item key="delete"> {{$t('project.menuItemDelete')}} </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content>
        <component :is="`panel-${activePanel}`"></component>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import PanelMember from './PanelMember.vue'
import PanelPublish from './PanelPublish.vue'
import PanelBaseInfo from './PanelBaseInfo.vue'
import PanelDelete from './PanelDelete.vue'
import PanelUpdate from './PanelUpdate.vue'
import PanelScript from './PanelScript.vue'
export default {
    name : 'ProjectSetting',
    components : {
        'panel-base' : PanelBaseInfo,
        'panel-delete' : PanelDelete,
        'panel-publish' : PanelPublish,
        'panel-update' : PanelUpdate,
        'panel-member' : PanelMember,
        'panel-script' : PanelScript,
    },
    data() {
        return {
            activePanel : 'base',
        };
    },
    created() {
        this.$store.commit('moduleIdSet', 'project');
    },
    methods : {
        /**
         * event handle on menu item clicked
         * @param {Event} event
         */
        actionHandleMenuItemClicked( event ) {
            this.activePanel = event.key;
        }
    },
}
</script>