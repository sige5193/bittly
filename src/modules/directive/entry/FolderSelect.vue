<template>
  <div>
    <a-modal v-if="enable"
      ref="modelSelect"
      v-model="enable"
      :title="$t('directive.entry.folderSelectTitle')" 
      :cancelText="$t('button.cancel')"
      :okText="$t('button.ok')"
      @ok="actionOk" 
      @cancel="actionCancel"
    >
      <a-tree ref="treeDir"
        :selectedKeys="selectedEntryIds"
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
            /**
             * indicate whether folder selector is enabled.
             * @property {Boolean}
             */
            enable : false,
            /**
             * list of entry items
             * @property {Array<Object>}
             */
            treeData: [],
            /**
             * list of selected entry ids, but only one is allowed here.
             * @property {Array<String>}
             */
            selectedEntryIds : [],
            /**
             * action handler to resolve selector
             * @property {Function}
             */
            actResolve : null,
        };
    },
    methods : {
        /**
         * open dialog to list all folders and returns the selected id.
         * @returns {Promise<String|null>}
         */
        select () {
            let rootId = MyString.uuidNil();
            this.selectedEntryIds = [rootId];
            this.treeData = [{ 
                title: this.$t('directive.entry.folderSelectRootName'), 
                key:rootId, 
                value:rootId,
            }];

            this.enable = true;
            return new Promise(resolve => this.actResolve = resolve);
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
         * @param {Array<String>}
         */
        actionFolderSelected( selectedKeys ) {
            this.selectedEntryIds = [];
            if ( 0 < selectedKeys.length ) {
                this.selectedEntryIds.push(selectedKeys[0]);
            }
        },

        /**
         * cancel selection
         */
        actionCancel() {
            this.actResolve(null);
        },

        /**
         * done selection
         */
        actionOk() {
            if ( 0 === this.selectedEntryIds.length ) {
                this.$message.error(this.$t('directive.entry.folderSelectIsRequired'));
                return;
            }
            
            this.enable = false;
            let entryId = this.selectedEntryIds[0] || null;
            this.actResolve(entryId);
        }
    }
}
</script>