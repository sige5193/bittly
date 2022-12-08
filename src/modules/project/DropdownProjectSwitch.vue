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
        <a-menu-item key="CreateNew">{{$t('project.create')}}</a-menu-item>
      </a-menu>
    </a-dropdown>
    <modal-project-create ref="modalCreate"></modal-project-create>
  </div>
</template>
<script>
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
            if ( 'CreateNew' == event.key ) {
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