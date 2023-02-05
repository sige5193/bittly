<template>
  <div id="mainApp" class="h-100 d-flex flex-dir-column">
    <a-alert v-if="'browser' == $env.name" banner closable >
      <span slot="message">
        {{$t('app.browserTip')}}
        <a class="app-download" target="_blank" href="https://bittly.sigechen.com/download"
        >{{$t('app.browserDownloadClient')}}</a>
      </span>
    </a-alert>

    <app-title v-if="!isLoading"></app-title>
    
    <!-- init -->
    <div v-if="isLoading" class="loading"> 
      <a-spin size="large" />
      <p class="mt-3" v-if="'' != loadingTitle">{{$t(`app.${loadingTitle}`)}}</p>
      <div class="mt-5">
        <a-button size="small" @click="actionDevTool">Open Dev Tool</a-button>
      </div>
    </div>
    
    <!-- project index page -->
    <page-project-index v-else-if="null == projectId" ref="projectIndex" />

    <!-- project main -->
    <a-layout v-else class="h-100">
      <a-layout>
        <!-- module menu bar -->
        <a-layout-sider :defaultCollapsed="true" :trigger="null" class="bg-white border-right d-none d-xl-block">
          <a-menu id="app-module-menu" mode="inline" :selectedKeys="[moduleName]" @click="actionModuleListMenuItemClicked">
            <a-menu-item v-for="appModule in modulesList" :key="appModule.id" :data-module="appModule.id">
              <a-icon :type="appModule.icon" /> 
              <span>{{appModule.label}}</span>
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        
        <!-- module content -->
        <component :is="`module-${moduleName}-main`"></component>
      </a-layout>
      
      <!-- footer -->
      <app-footer></app-footer>
    </a-layout>
  </div>
</template>
<script>
import PackageJSON from '../package.json'
import MdbRuntimeVariable from './models/MdbRuntimeVariable.js'
import Dictionary from './utils/Dictionary.js'
import DatabaseSetup from './utils/database/Setup.js'
import AppHelper from './utils/AppHelper.js'
import AppTitle from './components/AppTitle.vue'
import AppFooter from './components/AppFooter.vue'
import ModuleDirectiveMain from './modules/directive/Main.vue'
import ModulePanelMain from './modules/panel/Main.vue'
import ModuleTestMain from './modules/test/Main.vue'
import ModuleDocumentMain from './modules/document/Main.vue'
import ModuleEnvironmentMain from './modules/environment/Main.vue'
import ModuleSettingMain from './modules/project/Setting.vue'
import PageProjectIndex from './modules/project/PageProjectIndex.vue'
import PluginManager from './modules/plugin/Manager.js'
import ModuleMockMain from './modules/mock/Main.vue'
import ComponentBase from './utils/component/Base.js'
require('./utils/Common.css');
export default {
    name: 'App',
    mixins : [ComponentBase],
    components : {
        'app-title' : AppTitle,
        'page-project-index' : PageProjectIndex,
        'module-directive-main' : ModuleDirectiveMain,
        'module-panel-main' : ModulePanelMain,
        'module-test-main' : ModuleTestMain,
        'module-document-main':ModuleDocumentMain,
        'module-environment-main' : ModuleEnvironmentMain,
        'module-setting-main' : ModuleSettingMain,
        'module-mock-main' : ModuleMockMain,
        'app-footer' : AppFooter,
    },
    data() {
        return {
            /**
             * id of active project
             * @property {String}
             */
            projectId : null,
            /**
             * indicate loading or not
             * @property {Boolean}
             */
            isLoading : true,
            /**
             * title of loading step
             * @property {String}
             */
            loadingTitle : '',
            /**
             * name of actived module
             * @property {String}
             */
            moduleName : 'directive',
            /**
             * list of modules
             * @property {Array<Object>}
             */
            modulesList : [],
        };
    },
    async mounted() {
        this.registerEventHandler('project-active-id-change', id => this.handleProjectActiveIdChange(id));
        this.$env.on('ipcRenderer', 'open-share-link', (event, info) => this.handleOpenShareLink(event, info));
        window.onresize = () => this.handleWindowResized();
        await this.init();
    },
    beforeDestroy() {
        this.unregisterAllEventHandlers();
    },
    methods : {
        /**
         * init
         */
        async init() {
            this.isLoading = true;
            document.title = `Bittly - ${PackageJSON.version}`;

            // setup i18n
            this.loadingTitle = 'initLoadingStepI18nSetup';
            this.$i18n.locale = await AppHelper.langCodeGet();
            
            // check env
            try {
                this.$env.check();
            } catch ( e ) {
                this.$error({title: this.$t('app.environmentCheckFailed'),content: e.message});
                return ;
            } 

            // setup database
            this.loadingTitle = 'initLoadingStepDatabaseSetup';
            await DatabaseSetup.start();

            // setup api client
            this.loadingTitle = 'initLoadingStepServerSetup';
            await this.$bittly.start();
            
            // setup dictionary
            this.loadingTitle = 'initLoadingStepDirectionarySetup';
            await Dictionary.load();
            
            // setup plugins
            this.loadingTitle = 'initLoadingPlugins';
            await PluginManager.start();
            
            // active default project
            let activeProjectId = await MdbRuntimeVariable.findOne({key:'project_actived_id'});
            if ( null != activeProjectId && null != activeProjectId.value) {
                this.$store.dispatch('projectActivedIdSet', activeProjectId.value);
            }
            
            // setup modules
            this.modulesList.push({id:'directive',label:this.$t('directive.moduleName'),icon:'box-plot'});
            this.modulesList.push({id:'panel',label:this.$t('panel.moduleName'),icon:'dashboard'});
            this.modulesList.push({id:'test',label:this.$t('test.moduleName'),icon:'issues-close'});
            this.modulesList.push({id:'mock',label:this.$t('mock.moduleName'),icon:'robot'});
            this.modulesList.push({id:'document',label:this.$t('document.moduleName'),icon:'read'});
            this.modulesList.push({id:'environment',label:this.$t('environment.moduleName'),icon:'gold'});
            this.modulesList.push({id:'setting',label:this.$t('project.setting'),icon:'setting'});
            
            // done
            this.isLoading = false;
            this.loadingTitle = '';

            this.$nextTick(() => this.$emit('ready'));
        },
        

        /**
         * callback handler on project changed
         * @property {String} id
         */
        handleProjectActiveIdChange(id) {
            this.projectId = id;
            this.moduleName = 'directive'
        },

        /**
         * handle event on event `open-share-link` fired.
         * when user click a share link on browser, it would open bittly main view 
         * and emit this event.
         * @param {Object} info sharing information
         * @param {String} info.shareId id of sharing info.
         */
        async handleOpenShareLink( event, info ) {
            this.$appLog('App:handleOpenShareLink({0})', info);
            let response = await this.$bittly.shareGet(info.shareId);
            if ( !response.success ) {
                this.$message.error(response.message);
                return;
            }

            let shareData = response.data.data;
            if ( 'directive' == response.data.type ) {
                this.moduleName = 'directive';
                this.$nextTick(() => this.$eventBus.$emit('directive-new-temp-create', shareData));
            }
        },

        /**
         * event handler on module menu clicked
         * @param {Object} event
         * @param {String} event.key name of module to active
         */
        actionModuleListMenuItemClicked( event ) {
            this.moduleName = event.key;
        },

        /**
         * event handler on window resized
         */
        handleWindowResized() {
            if ( 'electron' === this.$env.name && null !== this.$env.getOS().version().match('Windows 7') ) {
                let borderStyle = window.remote.getCurrentWindow().isMaximized() ? 'none' : 'solid 1px #b7b7b7';
                document.getElementsByTagName('body')[0].style.border = borderStyle;
            }
        },

        /**
         * open dev tools
         */
        actionDevTool() {
            this.$env.openDevTools();
        }
    },
}
</script>
<style scoped>
.loading {text-align: center;width: 100%;padding-top: 20%;}
.app-download {border: solid 1px #1890ff;background: #1890ff;color: white;padding: 1px 5px;border-radius: 3px;margin-left: 10px;}
.app-download:hover {background: #2475c0;}
</style>