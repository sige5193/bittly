<template>
  <div class="bg-white h-100">
    <a-page-header class="border-bottom" :title="$t('project.membershipHeader')">
      <template slot="extra">
        <a-button 
          v-if="remoteEnable" 
          type="primary" 
          @click="actionAdd"
        >{{$t('project.membershipBtnAddMember')}}</a-button>
      </template>
    </a-page-header>

    <div v-if="!remoteEnable" class="p-3">
      <a-alert 
        ref="alterNoRemoteProject"
        :message="$t('messages.tip')" 
        :description="$t('project.membershipNoRemoteProject')" 
        type="warning"
      />
    </div>

    <div v-else>
      <a-empty v-if="0 == tableData.length" class="mt-5" :description="false" />
      <a-table v-else :columns="tableColumns" :data-source="tableData">
        <span slot="action" slot-scope="record">
          <a-popconfirm
            :title="$t('project.membershipMemberDeleteConfirmMessage')"
            :ok-text="$t('button.yes')"
            :cancel-text="$t('button.no')"
            @confirm="actionDeleteMembership(record.id)"
          >
            <a-button size="small">{{$t('button.delete')}}</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
  
    <a-modal 
      v-model="addModalEnable" 
      :title="$t('project.membershipAddModalTitle')" 
      :okText="$t('project.membershipBtnAddMember')" 
      :cancelText="$t('button.no')"
      :okButtonProps="{props:{disabled:null===userSearchResult}}"
      @ok="actionAddUserToMember"
    >
      <a-input-search 
        :placeholder="$t('project.membershipAddMemberSearchPlaceholder')" 
        enter-button 
        @search="actionSearchAccount"
      />
      <div class="mt-3">
        <a-empty v-if="null == userSearchResult" :description="false" />
        <div v-else>
          <a-avatar shape="square" :style="{ backgroundColor: '#1890ff', verticalAlign: 'middle' }">
            {{userSearchResult.account[0]}}
          </a-avatar>
          &nbsp;
          <span>{{userSearchResult.account}}</span>
        </div>
      </div>
    </a-modal>

  </div>
</template>
<script>
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'PanelMember',
    mixins : [ComponentProjectMixin],
    data() {
        return {
            remoteEnable : false,
            addModalEnable : false,
            userSearchResult : null,
            tableColumns : [
                {title: this.$t('project.membershipAttrAccount'),dataIndex: 'account',key: 'account'},
                {title: this.$t('project.membershipAttrOperation'),key: 'action',className: 'text-right',scopedSlots: { customRender: 'action' }},
            ],
            tableData : [],
        };
    },
    methods : {
        /**
         * event handler on project reloaded
         * @overide 
         */
        async onProjectReloaded() {
            if ( '' != this.project.remoteUuid ) {
                this.remoteEnable = true;
            } else {
                this.remoteEnable = false;
            }

            await this.refreshTableData();
        },
        
        /**
         * refresh project members
         */
        async refreshTableData() {
            if ( !this.loginRequiredCheck() ) {
                return;
            }

            this.tableData = [];
            let members = await this.$bittly.projectMemberList(this.project.remoteUuid);
            members = members.data;
            if ( null === members ) {
                members = [];
            }
            for ( let i=0; i<members.length; i++ ) {
                let member = {};
                member.id = members[i].id;
                member.key = members[i].id;
                member.account = members[i].account;
                this.tableData.push(member);
            }
        },

        /**
         * open member add modal
         */
        actionAdd() {
            this.addModalEnable = true;
        },

        /**
         * search account by given value
         */
        async actionSearchAccount( value ) {
            if ( !this.loginRequiredCheck() ) {
                return;
            }

            let search = await this.$bittly.userGetByAccount(value);
            if ( null == search.data ) {
                this.userSearchResult = null;
            } else {
                this.userSearchResult = search.data;
            }
            this.$forceUpdate();
        },

        /**
         * add member to project members
         */
        async actionAddUserToMember() {
            if ( !this.loginRequiredCheck() ) {
                return;
            }

            let remoteUuid = this.project.remoteUuid;
            let uid = this.userSearchResult.id;
            let memberAdd = await this.$bittly.projectMemberAdd(remoteUuid, uid);
            if ( !memberAdd.success ) {
                this.$message.error(memberAdd.message);
                return;
            }

            await this.refreshTableData();
            this.addModalEnable = false;
            this.$message.success(this.$t('project.membershipAddSuccess'));
        },

        /**
         * delete project member
         */
        async actionDeleteMembership( uid ) {
            if ( !this.loginRequiredCheck() ) {
                return;
            }

            let deletion = await this.$bittly.projectMemberDelete(this.project.remoteUuid, uid);
            if ( !deletion.success ) {
                this.$message.error(deletion.message);
            }

            await this.refreshTableData();
            this.$message.success(this.$t('project.membershipDeleteFailed'));
        }
    },
}
</script>