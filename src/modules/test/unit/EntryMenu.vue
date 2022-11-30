<template>
  <div class="h-100 d-flex flex-dir-column">
    <div class="menu-entry-container flex-grow h-0 overflow-y-auto" >
      <div v-if="0 == menuData.length" class="mt-3">
        <a-empty :description="false"/>
      </div>
      <!-- entry tree -->
      <a-tree v-else show-icon blockNode
        :tree-data="menuData"
        :expandedKeys.sync="menuExpandedKeys"
        @select="actionMenuItemSelected"
      >
        <a-icon slot="directive" type="thunderbolt" />
        <a-icon slot="folder" type="folder" />
        <template #title="{title,test,key}">
          <span :ref="`entryTitle_${key}`">
            <span v-if="'testing' == test"><a-badge status="processing" />{{title}}</span>
            <a-tag v-if="'error' == test" color="red">{{title}}</a-tag>
            <a-tag v-if="'success' == test" color="green">{{title}}</a-tag>
            <a-tag v-if="'warning' == test" color="orange">{{title}}</a-tag>
            <span v-if="null == test">{{title}}</span> 
          </span>
        </template>
      </a-tree>
    </div>

    <div class="p-2 border-bottom border-right">
      <a-row>
        <a-col :span="19">
          <a-input :placeholder="$t('button.search')" v-model="searchText" @input="actionSearchTextInput"/>
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
import { NIL as NIL_UUID } from 'uuid';
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import ExecuteAll from './ExecuteAll.vue'
import ProjectMixin from '../../../utils/ProjectMixin.js'
export default {
    name : 'DirectiveEntries',
    mixins : [ProjectMixin],
    components : {
        'execute-all' : ExecuteAll,
    },
    props : {
        /**
         * @property {Function}
         */
        getWorkspace : {type:Function,required:true},
    },
    data() {
        return {
            searchText : '',
            entries : {},
            menuData : [],
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
                menuItem.slots = { icon: 'directive' };
                menuItem.value = entryItem.entry.id;
                menuItem.type = entryItem.entry.type;
                menuItem.test = null;

                if ( 'folder' == entryItem.entry.type ) {
                    menuItem.slots = { icon: 'folder' };
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
         * event handler for directive entry menu item clicking,
         * if item is an directive, it would emit an `directive-click` with
         * directive model instance, so that the parent component could 
         * listen this event and open directive to show detail.
         * if batch executing is running, this click handler would not 
         * emit any event.
         * @param {Array} selectedKeys
         * @event
         */
        actionMenuItemSelected( selectedKeys ) {
            if ( 0 == selectedKeys.length ) {
                return;
            }

            let selectedKey = selectedKeys[0];
            let item = this.entries[selectedKey];
            if ( 'directive' == item.entry.type ) {
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
            this.menuData = this.filterMenuItemChildren(NIL_UUID);
        },
    }
}
</script>