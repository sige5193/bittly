<!--
 - directive toc
 - @author sige
-->
<template>
  <div class="h-100 d-flex flex-dir-column">
    <div class="p-2 border-bottom border-right">
      <a-row>
        <a-col :span="19">
          <a-input ref="txtSearch" :placeholder="$t('button.search')" v-model="searchText" @input="actionSearchTextInput"/>
        </a-col>
        <a-col :span="3">
          <a-dropdown :trigger="['click']">
            <a-menu slot="overlay" @click="actionHandleQuickMenuClick">
              <a-menu-item key="Refresh">{{$t('button.refresh')}}</a-menu-item>
              <a-menu-item key="NewFolder">{{$t('button.newFolder')}}</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 10px"> <a-icon type="menu" /> </a-button>
          </a-dropdown>
        </a-col>
      </a-row>
    </div>
    
    <div v-if="0 == menuData.length" class="mt-3">
      <a-empty :description="false"/>
    </div>

    <a-tree 
      v-else
      show-icon
      blockNode
      draggable
      showLine
      class="flex-grow overflow-auto h-0 main-directive-entry"
      :tree-data="menuData"
      :expandedKeys="menuExpandedKeys"
      @drop="actionMenuItemDrop"
      @select="actionMenuItemSelected"
    >
      <a-icon slot="folder-icon" type="folder" />
      <a-icon slot="directive-icon" type="thunderbolt" />

      <template #title="{ 
        type:itemType, 
        title:title,
        value:entryId,
      }">
        <a-dropdown :trigger="['contextmenu']">
          <span class="entry-item-title" :id="`entry-item-${entryId}`">
            <a-row>
              <a-col :span="20" style="overflow: hidden;text-overflow: ellipsis;">{{title}}</a-col>
              <a-col :span="4" class="text-right">
                <a-icon :id="`entry-item-menu-${entryId}`" type="menu" @click="actionEntryItemMenuIconClicked"/>
              </a-col>
            </a-row>
          </span>
          <template #overlay>
            <a-menu @click="({ key: menuKey }) => actionMenuItemContextMenuClick(entryId, menuKey)">
              <a-menu-item v-if="'folder' == itemType" key="FolderNewSubFolder">{{$t('button.newFolder')}}</a-menu-item>
              <a-menu-item v-if="'folder' == itemType" key="FolderRename">{{$t('button.rename')}}</a-menu-item>
              <a-menu-item v-if="'folder' == itemType" key="FolderDelete">{{$t('button.delete')}}</a-menu-item>
              <a-menu-item v-if="'directive' == itemType" key="DirectiveCopy">{{$t('button.copy')}}</a-menu-item>
              <a-menu-item v-if="'directive' == itemType" key="DirectiveDelete">{{$t('button.delete')}}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-tree>

    <modal-directive-folder-edit 
      ref="modalFolderEdit" 
    ></modal-directive-folder-edit>
  </div>
</template>
<script>
import MdbDirective from '@/models/MdbDirective.js'
import MdbDirectiveEntry from '@/models/MdbDirectiveEntry.js'
import ModalDirectiveFolderEdit from './FolderEdit.vue'
import MyString from '../../../utils/datatype/MyString';
export default {
    name : 'PanelEntries',
    components : {
        'modal-directive-folder-edit' : ModalDirectiveFolderEdit,
    },
    props : {
        projectId : String,
    },
    data() {
        return {
            searchText : '',
            entries : {},
            menuData : [],
            /**
             * list of key that expanded folders
             * @property {string[]}
             */
            menuExpandedKeys : [], 
        };
    },
    watch : {
        async projectId () {
            await this.init();
        },
    },
    async created() {
       await this.init();
    },
    methods : {
        /**
         * init toc
         */
        async init() {
            await this.loadMenuData();
            this.$emit('inited');
        },

        /**
         * get directive model by given id
         * @public
         * @param {String} id
         * @return {MdbDirective | null}
         */
        getDirectiveById( id ) {
            for ( let key in this.entries ) {
                if ( 'directive' == this.entries[key].entry.type 
                && id == this.entries[key].target.id ) {
                    return this.entries[key].target;
                }
            }
            return null;
        },

        /**
         * append entry to toc
         * @param {MdbDirectiveEntry} entry
         * @param {MdbDirective|MdbDirectiveFolder} target
         */
        appendEntry( entry, target ) {
            this.entries[entry.id] = {
                entry : entry,
                target : target,
            };
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },

        /**
         * refresh directive by given directive model
         * @param {MdbDirective} directive
         */
        refreshDirective( directive ) {
            for ( let id in this.entries ) {
                let item = this.entries[id];
                if ( 'directive' == item.entry.type && directive.id == item.target.id ) {
                    this.entries[id].target = directive;
                    break;
                }
            }
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },

        /**
         * load menu data
         */
        async loadMenuData() {
            let entrieItems = await MdbDirectiveEntry.findAll({project_id:this.projectId});
            
            this.entries = {};
            for ( let i=0; i<entrieItems.length; i++ ) {
                let item = {};
                item.entry = entrieItems[i];
                item.target = await entrieItems[i].getTargetModel();
                if ( null == item.target ) {
                    console.log(`MdbDirectiveEntry(${item.entry.id}) can not find target`);
                    continue;
                }
                this.entries[item.entry.id] = item;
            }
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },

        /**
         * filter menu item children item by given parent id
         * @param {String} parentId
         * @returns []
         */
        filterMenuItemChildren( parentId ) {
            let children = [];
            for ( let key in this.entries ) {
                let entryItem = this.entries[key];
                if ( parentId != entryItem.entry.parentId ) {
                    continue;
                }

                let menuItem = {};
                menuItem.class = 'main-directive-entry';
                menuItem.key = entryItem.entry.id;
                menuItem.title = entryItem.target.name;
                menuItem.scopedSlots = { switcherIcon:'directive-icon' };
                menuItem.value = entryItem.entry.id;
                menuItem.type = entryItem.entry.type;
                if ( 'folder' == entryItem.entry.type ) {
                    menuItem.scopedSlots = { switcherIcon:'folder-icon' };
                    menuItem.children = this.filterMenuItemChildren(entryItem.entry.id);
                }
                if ( '' == this.searchText ) {
                    children.push(menuItem);
                } else {
                    if ( 'directive' == menuItem.type && -1 != menuItem.title.indexOf(this.searchText) ) {
                        children.push(menuItem);
                    } else if ( 'folder' == menuItem.type && 0 != menuItem.children.length ) {
                        children.push(menuItem);
                        this.menuExpandedKeys.push(menuItem.key);
                    }
                }
            }

            children.sort(function( itemA, itemB ) {
                if ( itemA.type == itemB.type ) {
                    return itemA.title.localeCompare(itemB.title);
                } else {
                    return 'folder' == itemA.type ? -1 : 1;
                }
            });
            return children;
        },

        /**
         * event handler on user click entry menu icon
         * @param {MouseEvent} event
         */
        actionEntryItemMenuIconClicked( event ) {
            event.stopPropagation();
            let entryNode = event.currentTarget.parentElement.parentElement.parentElement;
            let contextmenuEvent = new MouseEvent("contextmenu", {
                screenX : event.screenX,
                screenY : event.screenY,
                clientX : event.clientX,
                clientY : event.clientY,
            });
            entryNode.dispatchEvent(contextmenuEvent);
        },

        /**
         * Event hander for toc item clicked.
         * @params {String[]} selectedKeys
         * @event
         */
        actionMenuItemSelected( selectedKeys, event) {
            let selectedKey = event.node.value;
            let item = this.entries[selectedKey];
            if ( 'folder' == item.entry.type ) {
                let folderKeyIndex = this.menuExpandedKeys.indexOf(selectedKey);
                if ( -1 === folderKeyIndex ) {
                    this.menuExpandedKeys.push(selectedKey);
                } else {
                    this.menuExpandedKeys.splice(folderKeyIndex,1);
                }
            } else {
                let directive = item.target;
                this.$emit('directive-click', directive);
            }
        },

        /**
         * event handler for menu item droped
         * @param {Object} action
         */
        async actionMenuItemDrop( action ) {
            if ( null === action.dragNode ) {
                return ;
            }
            
            let parentId = null;
            if ( action.dropToGap ) {
                parentId = MyString.uuidNil();
            } else {
                if ( null === action.node || undefined === action.node
                || undefined === action.node.$vnode 
                || 'folder' != action.node.$vnode.data.props.type ) {
                    return;
                }
                parentId = action.node.$vnode.data.props.value;
            }
            
            // ignore if user drag something like text, image or anything else but 
            // entry item.
            if ( undefined === action.dragNode ) {
                return ;
            }

            let source = action.dragNode.$vnode.data.props;
            let sourceEntry = this.entries[source.value].entry;
            sourceEntry.parentId = parentId;
            await sourceEntry.save();
            
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },

        /**
         * Toc quick menu item click handler
         * @param {Event} event
         */
        actionHandleQuickMenuClick( event ) {
            let handler = `handleQuickMenuClick${event.key}`;
            this[handler]();
        },

        /**
         * Toc menu handler ：Refresh
         */
        async handleQuickMenuClickRefresh() {
            await this.loadMenuData();
            this.$message.success(this.$t('directive.entry.refreshSuccess'));
        },

        /**
         * Toc menu handler ：create new folder 
         */
        async handleQuickMenuClickNewFolder() {
            try {
                let newEntry = await this.$refs.modalFolderEdit.create(MyString.uuidNil());
                let item = {};
                item.entry = newEntry;
                item.target = await newEntry.getTargetModel();
                this.entries[item.entry.id] = item;
                this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
            } catch {}
        },

        /**
         * toc item context menu handler 
         * @param {String} entryId
         * @param {String} menuKey
         */
        actionMenuItemContextMenuClick(entryId, menuKey) {
            let handler = `actionMenuItemContextMenuClick${menuKey}`;
            this[handler](entryId);
        },

        /**
         * toc item context menu handler : Create new folder
         * @param {String} entryId
         */
        async actionMenuItemContextMenuClickFolderNewSubFolder(entryId) {
            let entry = this.entries[entryId].entry;
            try {
                let newEntry = await this.$refs.modalFolderEdit.create(entry.id);
                let item = {};
                item.entry = newEntry;
                item.target = await newEntry.getTargetModel();
                this.entries[item.entry.id] = item;
                this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
            } catch {}
        },

        /**
         * toc item context menu handler : Rename folder
         * @param {String} entryId
         */
        async actionMenuItemContextMenuClickFolderRename( entryId ) {
            let item = this.entries[entryId];
            try {
                await this.$refs.modalFolderEdit.update(item.target);
                this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
            } catch {}
        },

        /**
         * toc item context menu handler : delete folder
         * @param {String} entryId
         */
        async actionMenuItemContextMenuClickFolderDelete( entryId ) {
            let item = this.entries[entryId];
            let $this = this;
            this.$confirm({
                title: this.$t('messages.dialogTitle.tip'),
                content: this.$t('directive.entry.folderDeleteConfirm', [item.target.name]),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                async onOk() {
                    await item.entry.deleteRecursively();
                    await $this.loadMenuData();
                },
                onCancel() {},
            });
        },

        /**
         * toc item context menu handler : copy directive
         * @param {String} entryId
         */
        async actionMenuItemContextMenuClickDirectiveCopy( entryId ) {
            let entry = this.entries[entryId].entry;
            let target = this.entries[entryId].target;
            let data = target.getData();
            data.name = this.$t('directive.entry.directiveCopyName', [target.name]);
            data.id = MyString.uuidV4();
            let directive = new MdbDirective();
            directive.setAttributes(data);
            await directive.save();

            let newEntry = new MdbDirectiveEntry();
            let entryData = entry.getData();
            entryData.id = MyString.uuidV4();
            entryData.target = directive.id;
            newEntry.setAttributes(entryData);
            await newEntry.save();
            
            this.entries[newEntry.id] = {entry:newEntry,target:directive};
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },
        
        /**
         * toc item context menu handler : directive delete
         * @param {String} entryId
         */
        async actionMenuItemContextMenuClickDirectiveDelete( entryId ) {
            let entry = this.entries[entryId].entry;
            let target = this.entries[entryId].target;
            
            let $this = this;
            this.$confirm({
                title: this.$t('messages.dialogTitle.tip'),
                content: this.$t('directive.entry.directiveDeleteConfirm', [target.name]),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                async onOk() {
                    let id = target.id;
                    await target.delete();
                    await entry.delete();
                    delete $this.entries[entryId];
                    $this.menuData = $this.filterMenuItemChildren(MyString.uuidNil());
                },
                onCancel() {},
            });
        },

        /**
         * event handler for search input box input event
         */
        actionSearchTextInput() {
            this.menuExpandedKeys = [];
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },
    }
}
</script>
<style scoped>
.entry-item-title {display: inline-block;width: 100%;}
</style>