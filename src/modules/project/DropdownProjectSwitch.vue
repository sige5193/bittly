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
export default {
    name : 'DropdownProjectSwitch',
    components : {
        'modal-project-create' : ModalProjectCreate,
    },
    data() {
        return {
            projects : [],
            activeProjectIndex : -1,
        };
    },
    async mounted() {
        await this.refreshProjects();
        
        let $this = this;
        this.$eventBus.$on('project-current-update', function() {
            $this.projectCurUpdate();
        });
        this.$eventBus.$on('project-current-delete', function() {
            $this.refreshProjects();
        });
    },
    methods : {
        /**
         * 更新当前项目
         */
        async projectCurUpdate() {
            let id = this.projects[this.activeProjectIndex].id;
            this.projects[this.activeProjectIndex] = await MdbProject.findOne(id);
            this.$forceUpdate();
        },

        /**
         * 加载项目列表
         * @method
         */
        async refreshProjects() {
            this.activeProjectIndex = -1;
            this.projects = [];
            this.projects = await MdbProject.findAll();

            let activeId = this.$store.getters.projectActivedId;
            if ( null != activeId ) {
                for ( let i=0; i<this.projects.length; i++ ) {
                    if ( this.projects[i].id == activeId ) {
                        this.activeProjectIndex = i;
                        break;
                    }
                }
            }
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