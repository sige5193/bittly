<template>
  <div class="d-flex flex-dir-column h-100">
    <div class="p-2 border-bottom border-right">
      <a-row>
        <a-col :span="19">
          <a-input :placeholder="$t('button.search')" v-model="searchText" @input="actionSearchTextInput"/>
        </a-col>
        <a-col :span="3">
          <a-dropdown :trigger="['click']">
            <a-menu slot="overlay" @click="actionHandleQuickMenuClick">
              <a-menu-item key="Refresh">{{$t('button.refresh')}}</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="ExportAsMarkdown">{{$t('document.exportAsMarkdown')}}</a-menu-item>
              <a-menu-item key="ExportAsPDF">{{$t('document.exportAsPdf')}}</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 10px"> <a-icon type="menu" /> </a-button>
          </a-dropdown>
        </a-col>
      </a-row>
    </div>
    
    <div class="flex-grow h-0 overflow-auto" >
      <div v-if="0 == menuData.length" class="mt-3">
        <a-empty :description="false"/>
      </div>
      <a-tree 
        v-else
        show-icon
        blockNode
        :tree-data="menuData"
        @select="actionMenuItemSelected"
      >
        <a-icon slot="directive" type="thunderbolt" />
        <a-icon slot="folder" type="folder" />
        <template #title="{title,value}">
          <span :ref="`entryTitle_${value}`">{{title}}</span> 
        </template>
      </a-tree>
    </div>
    <export-markdown ref="exportMarkdown"></export-markdown>
    <export-pdf ref="exportPDF"></export-pdf>
  </div>
</template>
<script>
import { NIL as NIL_UUID } from 'uuid';
import ExportPDF from './ExportPDF.vue'
import ExportMarkdown from './ExportMarkdown.vue'
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry.js'
export default {
    name : 'DirectiveEntries',
    props : {
        projectId : String,
    },
    components : {
        'export-markdown' : ExportMarkdown,
        'export-pdf' : ExportPDF,
    },
    data() {
        return {
            searchText : '',
            entries : {},
            menuData : [],
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
         * init
         */
        async init() {
            await this.loadMenuData();
        },

        /**
         * load menu data
         */
        async loadMenuData() {
            let entrieItems = await MdbDirectiveEntry.findAll({project_id:this.projectId});
            
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
         * filter children item by given paren id
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
         * event handler on directive menu item clicked
         * @param {Array} selectedKeys
         */
        actionMenuItemSelected( selectedKeys ) {
            if ( 0 == selectedKeys.length ) {
                return;
            }
            let selectedKey = selectedKeys[0];
            let item = this.entries[selectedKey];
            if ( 'directive' == item.entry.type ) {
                let directive = item.target;
                this.$emit('directive-click', directive);
            }
        },

        /**
         * event handler for quick menu item clicked
         * @param {Event} event
         */
        actionHandleQuickMenuClick( event ) {
            let handler = `handleQuickMenuClick${event.key}`;
            this[handler]();
        },

        /**
         * quick menu handler : refresh list
         */
        async handleQuickMenuClickRefresh() {
            await this.loadMenuData();
            this.$message.success(this.$t('directive.entry.refreshSuccess'));
        },

        /**
         * quick menu handler : export as Markdown
         */
        handleQuickMenuClickExportAsMarkdown() {
            this.$refs.exportMarkdown.start();
        },

        /**
         * quick menu handler : export as PDF
         */
        handleQuickMenuClickExportAsPDF() {
            this.$refs.exportPDF.open();
        },

        /**
         * update filter text on search inptut changed
         */
        actionSearchTextInput() {
            this.menuData = this.filterMenuItemChildren(NIL_UUID);
        },
    }
}
</script>