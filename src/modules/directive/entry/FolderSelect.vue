<template>
  <div>
    <a-modal 
      ref="modelSelect"
      v-model="enable" 
      :title="$t('directive.entry.folderSelectTitle')" 
      :cancelText="$t('button.cancel')"
      :okText="$t('button.ok')"
      @ok="actionOk" 
      @cancel="actionCancel"
    >
      <a-tree v-if="enable"
        ref="treeDir"
        :load-data="actionLoadData" 
        :tree-data="treeData"
        @select="actionFolderSelected"
      ></a-tree>
    </a-modal>
  </div>
</template>
<script>
import MdbDirectiveEntry from '@/models/MdbDirectiveEntry.js'
import MdbDirectiveFolder from '@/models/MdbDirectiveFolder.js';
import MyString from '../../../utils/datatype/MyString';
export default {
    name : 'DialogFolderSelect',
    data() {
        return {
            enable : false,
            treeData: [],
            selectedEntryId : null,
            actResolve : null,
            actReject : null,
        };
    },
    methods : {
        /**
         * open dialog to list all folders
         * @returns {Promise}
         */
        select ( ) {
            this.selectedEntryId = null;
            this.treeData = [{ 
                title: this.$t('directive.entry.folderSelectRootName'), 
                key:MyString.uuidNil(), 
                value:MyString.uuidNil()
            }];

            let $this = this;
            return new Promise(function( resolve, reject ) {
                $this.enable = true;
                $this.actResolve = resolve;
                $this.actReject = reject;
            });
        },

        /**
         * load item data by given node
         * @param {Object} treeNode
         */
        async actionLoadData( treeNode ) {
            if (undefined !== treeNode.dataRef.children) {
                return;
            }

            let entries = await MdbDirectiveEntry.findAll({
                project_id : this.$store.getters.projectActivedId,
                parent_id : treeNode.value,
                type : 'folder'
            });
            let folders = [];
            for ( let i=0; i<entries.length; i++ ) {
                let folder = await MdbDirectiveFolder.findOne(entries[i].target);
                if ( null == folder ) {
                    continue;
                }
                folders.push({title:folder.name,key:entries[i].id,value:entries[i].id});
            }
            folders.sort(function( itemA, itemB ) {
                if ( itemA.type == itemB.type ) {
                    return itemA.title.localeCompare(itemB.title);
                }
            });

            treeNode.dataRef.children = folders;
            this.treeData = [... this.treeData];
        },

        /**
         * event handle for item selected.
         */
        actionFolderSelected( selectedKeys ) {
            if ( 0 == selectedKeys.length ) {
                this.selectedEntryId = null;
            } else {
                this.selectedEntryId = selectedKeys[0];
            }
        },

        /**
         * cancel selection
         */
        actionCancel() {
            this.actReject(Error('user cancel folder selection'));
        },

        /**
         * done selection
         */
        actionOk() {
            this.enable = false;
            this.actResolve(this.selectedEntryId);
        }
    }
}
</script>