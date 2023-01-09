<template>
  <div id="mainApp" class="h-100 d-flex flex-dir-column">
    <app-title v-if="!isLoading"></app-title>
    
    <!-- init -->
    <div v-if="isLoading" class="loading"> 
      <a-spin size="large" />
      <p class="mt-3" v-if="'' != loadingTitle">{{$t(`app.${loadingTitle}`)}}</p>
    </div>
    
    <!-- project index page -->
    <page-project-index v-else-if="null == projectCurId"></page-project-index>

    <!-- project main -->
    <a-layout v-else class="h-100">
      <a-layout>
        <!-- module menu bar -->
        <a-layout-sider :defaultCollapsed="true" :trigger="null" class="bg-white border-right">
          <a-menu mode="inline" :selectedKeys="[moduleName]" @click="actionModuleListMenuItemClicked">
            <a-menu-item key="directive"><a-icon type="box-plot" /> <span> {{$t('directive.moduleName')}} </span></a-menu-item>
            <a-menu-item key="panel"><a-icon type="dashboard" /> <span> {{$t('panel.moduleName')}} </span></a-menu-item>
            <a-menu-item key="test"><a-icon type="issues-close" /> <span>{{$t('test.moduleName')}}</span></a-menu-item>
            <a-menu-item key="mock"><a-icon type="robot" /> <span>{{$t('mock.moduleName')}}</span></a-menu-item>
            <a-menu-item key="document"><a-icon type="read" /> <span>{{$t('document.moduleName')}}</span></a-menu-item>
            <a-menu-item key="environment"><a-icon type="gold" /> <span>{{$t('environment.moduleName')}}</span></a-menu-item>
            <a-menu-item key="setting"><a-icon type="setting" /> <span>{{$t('project.setting')}}</span></a-menu-item>
          </a-menu>
        </a-layout-sider>
        
        <!-- module content -->
        <component :is="`module-${moduleName}-main`"></component>
      </a-layout>

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
require('./utils/Common.css');
export default {
    name: 'App',
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
        };
    },
    computed : {
        projectCurId () {
            return this.$store.getters.projectActivedId;
        },
    },
    watch : {
        projectCurId() {
            this.moduleName = 'directive';
        },
    },
    async mounted() {
        window.ipcRenderer.on('open-share-link', (event, info) => this.handleOpenShareLink(event, info) );
        window.onresize = () => this.handleWindowResized();
        await this.init();
    },
    methods : {
        /**
         * init
         */
        async init() {
            this.isLoading = true;
            
            document.title = `Bittly - ${PackageJSON.version}`;
            
            this.loadingTitle = 'initLoadingStepDatabaseSetup';
            await DatabaseSetup.start();

            this.loadingTitle = 'initLoadingStepServerSetup';
            await this.$bittly.start();

            this.loadingTitle = 'initLoadingStepI18nSetup';
            this.$i18n.locale = await AppHelper.langCodeGet();

            this.loadingTitle = 'initLoadingStepDirectionarySetup';
            await Dictionary.load();

            this.loadingTitle = 'initLoadingPlugins';
            await PluginManager.start();

            let activeProjectId = await MdbRuntimeVariable.findOne({key:'project_actived_id'});
            if ( null != activeProjectId && null != activeProjectId.value) {
                this.$store.dispatch('projectActivedIdSet', activeProjectId.value);
            }

            this.isLoading = false;
            this.loadingTitle = '';
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
            if ( null !== window.os.version().match('Windows 7') ) {
                let borderStyle = window.remote.getCurrentWindow().isMaximized() ? 'none' : 'solid 1px #b7b7b7';
                document.getElementsByTagName('body')[0].style.border = borderStyle;
            }
        }
    },
}
</script>
<style scoped>
.loading {text-align: center;width: 100%;padding-top: 20%;}
</style>