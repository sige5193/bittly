<template>
  <a-layout class="h-100">
    <!-- panel list -->
    <a-layout-sider class="bg-white border-right" width="300">
      <div class="h-100 d-flex flex-dir-column">
        <div class="border-bottom p-2">
          <a-button @click="actionCreateNew"> {{$t('button.create')}} </a-button>
        </div>
        <a-menu class="h-0 flex-grow overflow-y-auto overflow-x-hidden" mode="inline" :selectedKeys="[panelActiveIndex]">
          <a-menu-item ref="menuItemPanel"
            v-for="(panel, index) in panels" 
            :key="index"
            @click="actionPanelMenuItemClicked"
          > {{panel.model.name}} </a-menu-item>
        </a-menu>
        <div v-if="0 == panels.length" class="mt-5">
          <a-empty :description="false" />
        </div>
      </div>
    </a-layout-sider>
    
    <!-- no active panel -->
    <a-layout-content v-if="-1 == panelActiveIndex" class="bg-white pt-5">
      <a-empty class="mt-5" ref="emptyNoActivePanel">
        <span slot="description"> {{$t('panel.noActivePanelDesc')}} </span>
        <a-button ref="btnPanelCreate" type="primary" @click="actionCreateNew">
          {{$t('panel.btnCreatePanel')}}
        </a-button>
      </a-empty>
    </a-layout-content>

    <!-- panel content -->
    <template v-if="-1 != panelActiveIndex">
      <template v-for="(panel,pindex) in panels">
        <panel v-if="panel.isActived" :key="panel.id"
          :panel="panel.model"
          :visiable="pindex == panelActiveIndex"
          @panel-delete="actionPanelDelete"
        ></panel>
      </template>
    </template>

  </a-layout>
</template>
<script>
import ProjectMixin from '../../utils/ProjectMixin.js'
import MdbPanel from '../../models/MdbPanel.js'
import Panel from './Panel.vue'
export default {
    name : 'PanelMain',
    mixins : [ProjectMixin],
    components : {
        'panel' : Panel
    },
    data() {
        return {
            /**
             * the active panel index
             * @property {Number}
             */
            panelActiveIndex : -1,
            /**
             * list fo panels of current project
             * @property {Array<Object{model:MdbPanel,isActived:Boolean}>}
             */
            panels : [],
        };
    },
    created() {
        this.$store.commit('moduleIdSet', 'panel');
        this.$eventBus.$emit('app-module-panel-init', this);
    },
    async mounted() {
        await this.refreshPanels();
        this.$log('done');
    },
    /**
     * hook handler before componment destroyed.
     */
    async beforeDestroy() {
        await this.$store.dispatch('closeAllCommunicators');
        this.$log('done');
    },
    methods : {
        /**
         * register widget element
         * @public
         * @param {Object} widget 
         */
        widgetsElemRegister( name, elemClass ) {
            let elemName = `panel-widget-${name}`;
            if ( undefined === window.customElements.get(elemName) ) {
                window.customElements.define(elemName, elemClass);
            }
        },

        /**
         * handle on project changed
         * @see {ProjectMixin.handleCurProjectIdChanged()}
         */
        handleCurProjectIdChanged() {
            this.refreshPanels();
        },

        /**
         * refresh panel list
         */
        async refreshPanels() {
            this.panelActiveIndex = -1;
            this.panels = [];
            let list = await MdbPanel.findAll({project_id:this.curProjectId});
            list.sort((a,b) => a.name.localeCompare(b.name));

            for ( let i=0; i<list.length; i++ ) {
                let item = {};
                item.model = list[i];
                item.isActived = false;
                this.panels.push(item);
            }
        },

        /**
         * active panel on menu item clicked.
         * @param {Event} event
         */
        actionPanelMenuItemClicked( event ) {
            this.panelActiveIndex = event.key;
            this.panels[this.panelActiveIndex].isActived = true;
        },

        /**
         * create new panel and active it to edit mode.
         */
        async actionCreateNew() {
            let panel = new MdbPanel();
            panel.name = this.$t('panel.editMode.defaultName');
            panel.projectId = this.curProjectId;
            this.panels.push({model:panel,isActived:true});
            this.panelActiveIndex = this.panels.length - 1;
        },

        /**
         * event handler on panel deleted, refresh the panel list.
         */
        async actionPanelDelete( id ) {
            this.panelActiveIndex = -1;
            for ( let i=0; i<this.panels.length; i++ ) {
                if ( this.panels[i].model.id == id ) {
                    this.panels.splice(i,1);
                }
            }
            if ( this.panels.length > 0 ) {
                this.panelActiveIndex = 0;
            }
        },
    },
}
</script>