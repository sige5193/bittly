<template>
  <a-layout class="h-100">
    <!-- menu entry -->
    <a-layout-sider class="bg-white border-right" width="300">
      <a-tabs v-model="mode" class="h-100 d-flex flex-dir-column test-main-sider-tab" :tabBarStyle="{marginBottom:0}">
        <a-tab-pane key="functional" :tab="$t('test.functional.title')" class="h-100">
          <functional-entrymenu ref="functionalEntryMenu" :getWorkspace="getWorkspace"/>
        </a-tab-pane>
        <a-tab-pane key="unit" :tab="$t('test.unit.title')" force-render>
          <unit-entrymenu ref="unitEntryMenu" :getWorkspace="getWorkspace" />
        </a-tab-pane>
      </a-tabs>
    </a-layout-sider>
    
    <!-- workspace -->
    <a-layout-content class="h-100 bg-white">
      <component :is="`${mode}-workspace`" ref="workspace" 
        :getFunctionalEntryMenu="getFunctionalEntryMenu"
      ></component>
    </a-layout-content>
  </a-layout>
</template>
<script>
import ProjectMixin from '../../utils/ProjectMixin.js'
import FunctionalEntryMenu from './functional/EntryMenu.vue'
import FunctionalWorkspace from './functional/Workspace.vue'
import UnitEntryMenu from './unit/EntryMenu.vue'
import UnitWorkspace from './unit/Workspace.vue'
export default {
    name : 'TestMain',
    mixins : [ProjectMixin],
    components : {
        'functional-entrymenu' : FunctionalEntryMenu,
        'functional-workspace' : FunctionalWorkspace,
        'unit-entrymenu' : UnitEntryMenu,
        'unit-workspace' : UnitWorkspace,
    },
    data() {
        return {
            /**
             * mode name of test workspace
             * @property {String}
             */
            mode : 'functional',
        };
    },
    methods : {
        /**
         * get workspace component
         * @returns {Object}
         */
        getWorkspace() {
            return this.$refs.workspace;
        },

        /**
         * get functional entry menu componemnt
         * @returns {VueComponent}
         */
        getFunctionalEntryMenu() {
            return this.$refs.functionalEntryMenu;
        },
    },
}
</script>
<style>
.test-main-sider-tab .ant-tabs-content {flex-grow:1;}
</style>