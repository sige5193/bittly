<template>
  <div class="d-inline-block mr-2">
    <a-dropdown :trigger="['click']">
      <span ref="btnDropdownTrigger" class="app-dropdown-menu-title">{{$t('environment.moduleName')}}</span>

      <a-menu ref="menu" slot="overlay" @click="actionHandleMenuItemClicked">
        <a-menu-item key="none">
          <a-icon v-if="null === curIndex" type="check" /> 
          {{$t('environment.defualtEnvName')}}
        </a-menu-item>
        <a-menu-item v-for="(env, index) in envs" :key="index"
        >
          <a-icon v-if="index==curIndex" type="check" /> 
          {{env.name}}
        </a-menu-item>
      </a-menu>
      
    </a-dropdown>
  </div>
</template>
<script>
import ProjectMixin from '../../utils/ProjectMixin.js'
import MdbEnvironment from '../../models/MdbEnvironment.js'
export default {
    name : 'DropdownEnvSwitch',
    mixins : [ProjectMixin],
    data() {
        return {
            curIndex : null,
            envs : [],
            newEnvName : null,
        };
    },
    async mounted() {
        await this.refreshEnvList();
        this.$eventBus.$on('environment-delete', this.refreshEnvList);
        this.$eventBus.$on('environment-save', this.handleEnvironmentSave);
    },
    beforeDestroy() {
        this.$eventBus.$off('environment-save', this.handleEnvironmentSave);
        this.$eventBus.$off('environment-delete', this.refreshEnvList);
    },
    methods : {
        /**
         * event handler on env model saved, this event triggered
         * from env edit component.
         */
        async handleEnvironmentSave( id ) {
            await this.refreshEnvList();
            
            let curEnvId = this.$store.getters.envActivedId;
            if ( curEnvId == id ) {
                this.$store.dispatch('envActivedIdSet', id);
                for ( let i=0; i<this.envs.length; i++ ) {
                    if ( this.envs[i].id == curEnvId ) {
                        this.curIndex = i;
                    }
                }
            }
        },

        /**
         * event handler on proejct change
         * @see {ProjectMixin.handleCurProjectIdChanged}
         */
        handleCurProjectIdChanged() {
            this.refreshEnvList();
        },

        /**
         * fetch all envs from current project.
         */
        async refreshEnvList() {
            this.curIndex = null;
            this.envs = [];
            let id = this.$store.getters.projectActivedId;
            if ( null == id ) {
                return;
            }

            this.envs = await MdbEnvironment.findAll({project_id:id});
        },

        /**
         * event handler for env menu item clicked. it would check event key 
         * and switch to target env in need.
         * @private
         * @param {Event} event
         */
        async actionHandleMenuItemClicked( event ) {
            if ( 'none' == event.key ) {
                this.curIndex = null;
                this.$store.dispatch('envActivedIdSet', null);
                return;
            }
            
            if ( this.curIndex == event.key ) {
                return ;
            }

            this.curIndex = event.key;
            this.$store.dispatch('envActivedIdSet', this.envs[this.curIndex].id);
        },
    },
}
</script>