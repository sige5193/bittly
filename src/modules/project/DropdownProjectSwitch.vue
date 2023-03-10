<template>
  <div class="d-inline-block mr-2">
    <a-dropdown :trigger="['click']">
      <span class="app-dropdown-menu-title">{{$t('project.project')}}</span> 
      
      <a-menu slot="overlay" @click="actionHandleMenuItemClicked">
        <!-- project list -->
        <a-menu-item v-for="(project,index) in projects" :key="index">
          <a-icon v-if="index==activeProjectIndex" type="check" /> 
          {{project.name}}
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="ExportCurrent">{{$t('project.exportCurrent')}}</a-menu-item>
        <a-menu-item key="Import">{{$t('project.import')}}</a-menu-item>
        <a-menu-divider />
        <a-menu-item key="CreateNew">{{$t('project.create')}}</a-menu-item>
      </a-menu>
    </a-dropdown>
    <modal-project-create ref="modalCreate"></modal-project-create>
  </div>
</template>
<script>
import Importer from './Importer.js'
import Exporter from './Exporter.js'
import Common from '../../utils/Common.js'
import ModalProjectCreate from './ModalProjectCreate.vue'
import MdbProject from '../../models/MdbProject.js'
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'DropdownProjectSwitch',
    mixins : [ComponentProjectMixin],
    components : {
        'modal-project-create' : ModalProjectCreate,
    },
    data() {
        return {
            /**
             * list of projects.
             * @property {Array<MdbProject>}
             */
            projects : [],
            /**
             * index of active project
             * @property {Number}
             */
            activeProjectIndex : -1,
        };
    },
    async mounted() {
        await this.refreshProjects();
        this.$eventBus.$on('project-current-update', () => this.projectCurUpdate());
        this.$eventBus.$on('project-current-delete', () => this.refreshProjects());
    },
    methods : {
        /**
         * callback hander on project reloaded.
         * @override 
         */
        onProjectReloaded() {
            this.refreshActiveProjectIndex();
        },

        /**
         * refresh project list.
         * @method
         */
        async refreshProjects() {
            this.projects = [];
            this.projects = await MdbProject.findAll();
            this.refreshActiveProjectIndex();
        },

        /**
         * refresh active project index
         */
        refreshActiveProjectIndex() {
            this.activeProjectIndex = -1;
            let activeId = this.$store.getters.projectActivedId;
            for ( let i=0; i<this.projects.length; i++ ) {
                if ( this.projects[i].id == activeId ) {
                    this.activeProjectIndex = i;
                    break;
                }
            }
        },

        /**
         * 更新当前项目
         */
        async projectCurUpdate() {
            let id = this.projects[this.activeProjectIndex].id;
            this.projects[this.activeProjectIndex] = await MdbProject.findOne(id);
            this.$forceUpdate();
        },

        /**
         * 下拉菜单条目被点击
         * @method
         * @private
         */
        async actionHandleMenuItemClicked( event ) {
            let handler = `handleMenuItem${event.key}`;
            if ( 'function' == typeof(this[handler]) ) {
                this[handler]();
            } else if ( 'CreateNew' == event.key ) {
                try {
                    let project = await this.$refs.modalCreate.open();
                    await this.refreshProjects();
                    this.activeProjectById(project.id);
                } catch {}
            } else {
                this.activeProject(event.key);
            }
        },

        /**
         * import project
         * @returns {Promise<void>}
         */
        async handleMenuItemImport() {
            let filepath = await window.dialog.showOpenDialogSync({
                filters:[{name:'',extensions:['zip']}],
            });
            if ( undefined === filepath ) {
                return;
            }

            let $this = this;
            this.$confirm({
                title: this.$t('project.importConfirm'),
                content: h => this.$t('project.importNote'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                onOk : async () => {
                    let handler = new Importer(filepath[0]);
                    try {
                        let projectId = await handler.execute();
                        this.activeProjectById(projectId);
                        $this.$message.success($this.$t('project.importSuccess'));
                    } catch ( e ) {
                        $this.$message.error($this.$t('project.importFailed',[e.message]));
                    }
                },
            });
        },

        /**
         * export current project
         * @returns {Promise<void>}
         */
        async handleMenuItemExportCurrent() {
            if ( ! await Common.confirm(this.$t('project.exportCurrentConfirmMessage')) ) {
                return ;
            }

            let projectId = this.$store.getters.projectActivedId;
            let handler = new Exporter(projectId);
            await handler.execute();
        },

        /**
         * 通过ID激活项目
         */
        activeProjectById( id ) {
            let index = -1;
            for ( let i=0; i<this.projects.length; i++ ) {
                if ( this.projects[i].id == id ) {
                    index = i;
                }
            }
            this.activeProject(index);
        },

        /**
         * 切换项目
         */
        activeProject( index ) {
            if ( this.activeProjectIndex == index ) {
                return ;
            }
            this.activeProjectIndex = index;
            this.$store.dispatch('projectActivedIdSet', this.projects[index].id);
        }
    }
}
</script>