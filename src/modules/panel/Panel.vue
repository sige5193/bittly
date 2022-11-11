<template>
  <a-layout-content v-show="visiable" class="bg-white p-2">
    <!-- run -->
    <panel-run v-if="'run' == mode" 
      :panel="panel"
      @switch-mode-to-edit="mode = 'edit'"
    ></panel-run>
    
    <!-- edit -->
    <panel-edit v-else ref="panelEdit"
      v-model="panel" 
      @panel-delete="actionPanelDelete"
      @switch-mode-to-run="mode = 'run'"
    ></panel-edit>
  </a-layout-content>
</template>
<script>
import PanelEdit from './PanelEdit.vue'
import PanelRun from './PanelRun.vue'
export default {
    name : 'PanelContent',
    components : {
        'panel-edit':PanelEdit,
        'panel-run' : PanelRun,
    },
    props : {
        /**
         * @property {MdbPanel}
         */
        panel : {type:Object},
        /**
         * @property {Boolean}
         */
        visiable : {type:Boolean},
    },
    data() {
        return {
            mode : 'run',
        };
    },
    created() {
        if ( this.panel.isNew ) {
            this.mode = 'edit';
        }
    },
    methods : {
        /**
         * event handler on 
         */
        actionPanelDelete() {
            this.$emit('panel-delete', this.panel.id);
        }
    },
}
</script>