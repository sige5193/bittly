<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-page-header class="border-bottom mb-2 pl-0 pr-0" :title="panel.name">
      <template slot="extra">
        <a-button-group class="mr-2">
          <a-button ref="btnToggleLog" @click="actionDrawerToggle('log')">{{$t('panel.runMode.log')}}</a-button>
          <a-button ref="btnToggleVariable" @click="actionDrawerToggle('variable')">{{$t('panel.editMode.variablePanelTitle')}}</a-button>
        </a-button-group>
        
        <a-radio-group button-style="solid" value="run" @change="actionModeSwitch">
          <a-radio-button value="edit">{{$t('panel.mode.edit')}}</a-radio-button>
          <a-radio-button value="run">{{$t('panel.mode.run')}}</a-radio-button>
        </a-radio-group>
      </template>
    </a-page-header>
    
    <div class="flex-grow position-relative">
      <!-- variable drawer -->
      <a-drawer placement="right"
        :title="''"
        :mask="false"
        :visible="variableDrawerEnable"
        :get-container="false"
        :wrap-style="{position:'absolute'}"
        :headerStyle="{display:'none'}"
        :body-style="{padding:0,height:'100%',overflow: 'hidden'}"
        @close="variableDrawerEnable = false"
      >
        <a-row v-for="(variable, varkey) in runtime.variables" :key="varkey" class="border-bottom">
          <a-col :span="12" class="p-2 var-key">{{varkey}}</a-col>
          <a-col :span="12" class="p-2 bg-light var-content">
            <a-tooltip placement="bottomRight">
              <template slot="title">
                <span>{{variable.value}}</span>
              </template>
              {{variable.value}}
            </a-tooltip>
            &nbsp;
          </a-col>
        </a-row>
      </a-drawer>

      <!-- log drawer -->
      <a-drawer placement="bottom"
        :height="200"
        :mask="false"
        :title="''"
        :visible="logDrawerEnable"
        :get-container="false"
        :wrap-style="logDrawerWrapStyle"
        :headerStyle="{display:'none'}"
        :body-style="{padding:0,height:'100%',overflow: 'auto',display: 'flex',flexDirection: 'column'}"
        :afterVisibleChange="actionLogDrawerVisibleChange"
      ><request-log-viewer ref="requestLogViewer" :runtime="runtime"/></a-drawer>
      
      <!-- widgets -->
      <div ref="widget-panel" class="widget-panel">
        <div v-for="(widget, index) in panel.widgets" :key="index" class="position-absolute" 
          :style="{top:`${widget.pos.y}px`,left:`${widget.pos.x}px`}"
        >
          <component :is="getWidgetComponentName(widget)" 
            :name="widget.name"
            :panel="panel" 
            :widget="panel.widgets[index]"
            :runtime="runtime"
            ref="widgets"
          ></component>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import RequestLogViewer from './RequestLogViewer.vue'
import Runtime from './Runtime.js'
import WidgetRegisterMixin from './widgets/WidgetRunRegisterMixin.js'
import CustomWidgetRunTrigger from './widgets/CustomWidgetRunTrigger.vue'
import CustomWidgetRunViewer from './widgets/CustomWidgetRunViewer.vue'
export default {
    name : 'PanelPanelRun',
    props : ['panel'],
    mixins : [WidgetRegisterMixin],
    components : {
        'request-log-viewer' : RequestLogViewer,
        'custom-widget-trigger' : CustomWidgetRunTrigger,
        'custom-widget-viewer' : CustomWidgetRunViewer,
    },
    data() {
        return {
            runtime : null,
            /**
             * indicate whether vairbale drawer is enabled
             * @property {Boolean}
             */
            variableDrawerEnable : false,
            /**
             * indicate whether log drawer is enabled
             * @property {Boolean}
             */
            logDrawerEnable : false,
            /**
             * wrap style of log drawer
             * @property {Object}
             */
            logDrawerWrapStyle : {},
        };
    },
    created() {
        this.initRuntime();
    },
    async beforeDestroy() {
        await this.$store.dispatch('closeAllCommunicators');
    },
    methods : {
        /**
         * init runtime
         */
        initRuntime() {
            this.runtime = new Runtime(this.panel, this);
        },

        /**
         * get component name by given widget options.
         * @param {Object} widget
         * @returns {String}
         */
        getWidgetComponentName( widget ) {
            if ( undefined != widget.isCustom && true == widget.isCustom ) {
                if ( 'trigger' == widget.type ) {
                    return 'custom-widget-trigger';
                } else {
                    return 'custom-widget-viewer';
                }
            } else {
                return `widget-${widget.name}`;
            }
        },

        /**
         * toggle drawer by given name
         * @property {String} name
         */
        actionDrawerToggle( name ) {
            let drawerPropertyName = `${name}DrawerEnable`;
            let drawerStatus = this[drawerPropertyName];

            this[drawerPropertyName] = !drawerStatus;
            if ( 'log' === name && this[drawerPropertyName] ) {
                this.logDrawerWrapStyle = {position:'absolute'};
            }
        },

        /**
         * handler on log drawer visible changed
         * @param {Boolean} visiable
         */
        actionLogDrawerVisibleChange( visible ) {
            if ( !visible ) {
                this.logDrawerWrapStyle={};
            }
        },

        /**
         * refresh panel
         * @public
         */
        refreshPanel() {
            this.$forceUpdate();
            if ( undefined != this.$refs.requestLogViewer ) {
                this.$refs.requestLogViewer.refresh();
            }
        },

        /**
         * switch to edit mode
         */
        async actionModeSwitch() {
            this.$emit('switch-mode-to-edit');
        },
    },
}
</script>
<style scoped>
.widget-panel {background: #f7f7f7;height: 100%;position: relative;overflow: hidden;}
.var-content {white-space: nowrap;overflow: hidden;text-overflow: ellipsis;}
.var-key {white-space: nowrap;word-break: keep-all;overflow: hidden;text-overflow: ellipsis;}
</style>