<template>
  <div class="bg-white h-100">
    <a-page-header class="border-bottom mb-4" :title="$t('project.panelDeletion.title')" />
    <div class="p-3" v-if="null != project">
      <a-alert
        :message="$t('project.panelDeletion.confirmMessage',[project.name])"
        :description="$t('project.panelDeletion.noteMessage')"
        type="warning"
        show-icon
      />
      <div class="mt-4" v-if="'' != project.remoteUuid">
        <a-checkbox disabled default-checked ref="checkboxDeleteRemoteProject">
          {{$t('project.panelDeletion.deleteRemoteProject')}}
        </a-checkbox>
      </div>
      <div class="mt-4">
        <a-popconfirm
          ref="deletePopConfirm"
          :title="$t('project.panelDeletion.confirmMessage',[project.name])"
          :ok-text="$t('button.yes')"
          :cancel-text="$t('button.no')"
          @confirm="actionDelete"
        >
          <a-button type="danger" ref="btnDelete"> {{$t('button.delete')}} </a-button>
        </a-popconfirm>
      </div>
    </div>
  </div>
</template>
<script>
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'PanelDelete',
    mixins : [ComponentProjectMixin],
    methods : {
        /**
         * delete project
         */
        async actionDelete() {
            if ( '' != this.project.remoteUuid ) {
                if ( this.$bittly.isGuest() ) {
                    this.$eventBus.$emit('user-login-required');
                    return ;
                }
                let deletion = await this.$bittly.projectDelete(this.project.remoteUuid);
                if ( !deletion.success ) {
                    this.$message.error(deletion.message);
                }
            }

            await this.project.delete();
            this.$store.dispatch('projectActivedIdSet', null);
            this.$eventBus.$emit('project-current-delete');
            this.$message.success(this.$t('project.panelDeletion.deleteSuccess'));
        },
    },
}
</script>