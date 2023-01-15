<template>
  <div class="h-100 d-flex flex-dir-column">
    <div class="menu-entry-container flex-grow h-0 overflow-y-auto" >
      <a-empty v-if="0 == menuData.length" class="mt-3" :description="false"/>
      <!-- entry tree -->
      <a-tree ref="entryTree" v-else show-icon block-node show-line
        :tree-data="menuData"
        :expandedKeys="menuExpandedKeys"
        @select="actionMenuItemSelected"
      > 
        <a-icon slot="directive" type="thunderbolt" />
        <a-icon slot="folder" type="folder" />
        <template #title="{title}">
          <div class="text-overflow-ellipsis">{{title}}</div>
        </template>
      </a-tree>
    </div>

    <div class="p-2 border-bottom border-right">
      <a-row>
        <a-col :span="19">
          <a-input ref="txtSearch" :placeholder="$t('button.search')" 
            v-model="searchText" @input="actionSearchTextInput"
          />
        </a-col>
        <a-col :span="3">
          <!-- quick menu -->
          <a-dropdown :trigger="['click']">
            <a-menu slot="overlay" @click="actionHandleQuickMenuClick">
              <a-menu-item key="ExecuteAllTestcases">{{$t('test.testcaseExecuteAll')}}</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 10px"> <a-icon type="menu" /> </a-button>
          </a-dropdown>
        </a-col>
      </a-row>
    </div>

    <execute-all ref="executeAll" :getWorkspace="getWorkspace"/>
  </div>
</template>
<script>
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import ExecuteAll from './ExecuteAll.vue'
import ProjectMixin from '../../../utils/ProjectMixin.js'
import MyString from '../../../utils/datatype/MyString.js';
export default {
    name : 'DirectiveEntries',
    mixins : [ProjectMixin],
    components : {
        'execute-all' : ExecuteAll,
    },
    props : {
        /**
         * function to get workspace componment.
         * @property {Function}
         */
        getWorkspace : {type:Function,required:true},
    },
    data() {
        return {
            /**
             * searhc text to filter menu data
             * @property {String}
             */
            searchText : '',
            /**
             * entry list
             * @property {Object<String:Object>}
             */
            entries : {},
            /**
             * menu data for entry tree
             * @property {Array<Object>}
             */
            menuData : [],
            /**
             * list of expanded keys
             * @property {Array<String>}
             */
            menuExpandedKeys : [],
        };
    },
    async created() {
       await this.loadMenuData();
    },
    methods : {
        /**
         * find all directive and organize them into menu data
         */
        async loadMenuData() {
            let entrieItems = await MdbDirectiveEntry.findAll({project_id:this.curProjectId});
            
            this.entries = [];
            for ( let i=0; i<entrieItems.length; i++ ) {
                let item = {};
                item.entry = entrieItems[i];
                item.target = await entrieItems[i].getTargetModel();
                this.entries[item.entry.id] = item;
            }

            this.menuData = this.filterMenuItemChildren(NIL_UUID);
        },

        /**
         * setup children data by given parent id
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
                menuItem.key = entryItem.entry.id;
                menuItem.title = entryItem.target.name;
                menuItem.scopedSlots = { switcherIcon:'directive' };
                menuItem.value = entryItem.entry.id;
                menuItem.type = entryItem.entry.type;
                if ( 'folder' == entryItem.entry.type ) {
                    menuItem.scopedSlots = { switcherIcon: 'folder' };
                    menuItem.children = this.filterMenuItemChildren(entryItem.entry.id);
                }
                if ( '' == this.searchText ) {
                    children.push(menuItem);
                } else {
                    if ( 'directive' == menuItem.type && -1 != menuItem.title.indexOf(this.searchText) ) {
                        children.push(menuItem);
                    } else if ( 'folder' == menuItem.type && 0 != menuItem.children.length ) {
                        children.push(menuItem);
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
         * event handler for directive entry menu item clicking
         * @param {Array} selectedKeys
         * @event
         */
        actionMenuItemSelected( selectedKeys, event ) {
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
                this.getWorkspace().openDirective(directive);
            }
        },

        /**
         * handle quick menu item clicked.
         * @param {Event} event
         */
        actionHandleQuickMenuClick( event ) {
            let handler = `handleQuickMenuClick${event.key}`;
            this[handler]();
        },

        /**
         * quick menu item handler : execute all tests
         */
        handleQuickMenuClickExecuteAllTestcases() {
            this.$refs.executeAll.open();
        },

        /**
         * event handle on user input text on search input
         */
        actionSearchTextInput() {
            this.menuData = this.filterMenuItemChildren(MyString.uuidNil());
        },
    }
}
</script>