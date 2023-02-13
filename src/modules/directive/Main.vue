<template>
  <a-layout class="h-100">
    <!-- directive entry -->
    <a-layout-sider class="bg-white border-right d-none d-xl-block" width="300">
      <panel-entries 
        ref="entries"
        :projectId="curProjectId"
        @inited="actionEntryMenuInited"
        @directive-click="actionDirectiveEntryClicked"
      ></panel-entries>
    </a-layout-sider>
    
    <!-- detail of directive -->
    <a-layout-content class="bg-white p-2">
      <a-tabs 
        class="directive-tabs" 
        v-model="activedDirectiveTab" type="editable-card" 
        ref="directive-tab"
        @edit="actionDirectiveTabEdit"
        :animated="directiveTabAnimatedEnable"
      >
        <a-tab-pane ref="directiveTabPanel"
          v-for="(directive, dirIndex) in openedDirectives" 
          :key="directive.key" 
          :closable="true"
        >
          <span slot="tab" >
            <a-dropdown :trigger="['contextmenu']">
              <span ref="dropdownDirectiveTabTitle">
                <span v-if="null == directive.model"> {{$t('directive.nameDefault')}} </span>
                <span v-if="null != directive.model && directive.hasChanged">
                  {{directive.model.name}} &nbsp; <a-badge color="blue" ></a-badge> 
                </span>
                <span v-if="null != directive.model && !directive.hasChanged">
                  {{directive.model.name}}
                </span>
              </span>
              
              <a-menu ref="menuDirectiveTabTitle" slot="overlay" @click="actionHandleTabContextMenu">
                <a-menu-item :data-dirkey="directive.key" :data-index="dirIndex" key="CreateNew">{{$t('directive.main.button.createNew')}}</a-menu-item>
                <a-menu-item :data-dirkey="directive.key" :data-index="dirIndex" key="DuplicateThis">{{$t('directive.main.button.duplicateThis')}}</a-menu-item>
                <a-menu-divider />
                <a-menu-item :data-dirkey="directive.key" :data-index="dirIndex" key="CopyName">{{$t('directive.main.button.copyName')}}</a-menu-item>
                <a-menu-item :data-dirkey="directive.key" :data-index="dirIndex" key="CopyPathName">{{$t('directive.main.button.copyPathName')}}</a-menu-item>
                <a-menu-divider />
                <a-menu-item :data-dirkey="directive.key" key="CloseThis">{{$t('directive.main.button.closeThis')}}</a-menu-item>
                <a-menu-item :data-dirkey="directive.key" key="CloseOthers">{{$t('directive.main.button.closeOthers')}}</a-menu-item>
                <a-menu-item :data-dirkey="directive.key" key="CloseAll">{{$t('directive.main.button.closeAll')}}</a-menu-item>
              </a-menu>
            </a-dropdown>
          </span>
          <panel-directive 
            v-if="openedDirectives[dirIndex].hasRendered"
            :ref="`directivePanel_${dirIndex}`"
            v-model="openedDirectives[dirIndex]"
            @directive-saved="actionDirectiveSaved"
          ></panel-directive>
        </a-tab-pane>

        <div slot="tabBarExtraContent" class="tab-ext-tools">
          <a-dropdown :trigger="['click']" overlayClassName="directive-tabs-more-list-overlay">
            <a-button class="tab-ext-tools-more-list">
              <a-icon class="tab-ext-tools-more-list-icon" type="ellipsis" />
            </a-button>
            <a-menu ref="menuTabExtToolsMoreList" slot="overlay" @click="actionTabMoreListMenuClick">
              <a-menu-item v-for="directive in openedDirectives" :key="directive.key">
                <span v-if="null == directive.model"> {{$t('directive.nameDefault')}} </span>
                <span v-if="null != directive.model">{{directive.model.name}}</span>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>
<script>
import ProjectMixin from '../../utils/ProjectMixin.js'
import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
import PanelEntries from './entry/PanelEntries.vue'
import PanelDirective from './Execute.vue'
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry.js'
import MdbDirective from '../../models/MdbDirective.js'
import ComponentBase from '../../utils/component/Base.js'
export default {
    name : 'ModuleDirectiveMain',
    mixins : [ProjectMixin,ComponentBase],
    components : {
        'panel-directive' : PanelDirective,
        'panel-entries' : PanelEntries,
    },
    data() {
        return {
            /**
             * runtime variable to remember opened directive of current project.
             * @property {MdbRuntimeVariable|null}
             */
            openedDirectiveMemory : null,
            /**
             * key of actived tab
             * @property {String}
             */
            activedDirectiveTab : null,
            /**
             * runtime variable to remember active directive id of current project.
             * @property {MdbRuntimeVariable|null}
             */
            activedDirectiveTabMemory : null,
            /**
             * indicate that tab animate enable
             * @property {Boolean}
             */
            directiveTabAnimatedEnable : false,
            /**
             * directive list key counter, use to generate tab key
             * @property {Number}
             */
            directiveListKeyCounter : 0,
            /**
             * is componment inited
             * @param {Boolean}
             */
            hasInited : false,
            /**
             * objects of open directives
             * @param {Array}
             */
            openedDirectives : [],
            /**
             * @param {Array<FunctionCallback>}
             */
            callbacks : {
                newTempDirective : null, 
                directiveDeleted : null,
            },
        };
    },
    watch : {
        async activedDirectiveTab(newValue) {
            await this.actionDirectiveTabChange(newValue);
        },
    },
    /**
     * init widget after widget mounted
     */
    async mounted() {
        this.$store.commit('moduleIdSet', 'directive');
        this.hasInited = false;
        this.callbacks.newTempDirective = (directiveData) => this.handleNewTempDirectiveCreated(directiveData);
        this.$eventBus.$on('directive-new-temp-create', this.callbacks.newTempDirective);

        this.callbacks.directiveDeleted = (directive) => this.actionDirectiveDelete(directive);
        this.$eventBus.$on('directive-delete', this.callbacks.directiveDeleted);

        this.registerEventHandler('project-active-id-change', id => this.onProjectActiveIdChange(id));
        this.hasInited = true;
    },
    /**
     * clean widget
     */
    async beforeDestroy() {
        this.$eventBus.$off('directive-new-temp-create', this.callbacks.newTempDirective);
        this.$eventBus.$off('directive-delete', this.callbacks.directiveDeleted);
        await this.$store.dispatch('closeAllCommunicators');
        this.unregisterAllEventHandlers();
    },
    methods : {
        /**
         * event handler on active project id changed.
         * @param {String} id
         */
        onProjectActiveIdChange(id) {
            this.openedDirectives = [];
        },

        /**
         * event handler for entry menu inited.
         */
        async actionEntryMenuInited() {
            this.hasInited = false;
            this.activedDirectiveTab = null;

            await this.openedDirectiveMemoryInit();
            await this.activedDirectiveTabMemoryInit();

            this.directiveTabAnimatedEnable = true;
            await this.openedDirectiveMemoryUpdate();
            this.hasInited = true;

            await this.$nextTick();
            if ( 'electron' === this.$env.name ) {
                setTimeout(() => this.$env.ipcRendererSend('window-app-ready'), 100);
            }
            this.$emit('ready');
            this.$appLog('module.directive.main:actionEntryMenuInited() => done');
        },

        /**
         * init runtime variable `directive_opened_list` and open directives in the list.
         * @private 
         */
        async openedDirectiveMemoryInit() {
            let projectId = this.curProjectId;
            this.openedDirectiveMemory = null;
            this.openedDirectiveMemory = await MdbRuntimeVariable.findOne({
                key : 'directive_opened_list',
                project_id : projectId
            });

            if ( null == this.openedDirectiveMemory ) {
                this.openedDirectiveMemory = new MdbRuntimeVariable();
                this.openedDirectiveMemory.projectId = projectId;
                this.openedDirectiveMemory.key = 'directive_opened_list';
                this.openedDirectiveMemory.value = '';
            }

            this.$appLog(`module.directive.main:openedDirectiveMemoryInit() => opened directive memory = "${this.openedDirectiveMemory.value}"`);
            // open remembered directives
            if ( '' != this.openedDirectiveMemory.value ) {
                let list = this.openedDirectiveMemory.value.split(',');
                for ( let i=0; i<list.length; i++ ) {
                    let directive = await this.$refs.entries.getDirectiveById(list[i]);
                    await this.actionDirectiveEntryClicked(directive);
                }
            }
        },

        /**
         * init runtime variable `directive_actived_id`
         * @private
         */
        async activedDirectiveTabMemoryInit() {
            let projectId = this.curProjectId;
            this.activedDirectiveTabMemory = null;
            this.activedDirectiveTabMemory = await MdbRuntimeVariable.findOne({
                key:'directive_actived_id',
                project_id : projectId,
            });

            if ( null == this.activedDirectiveTabMemory ) {
                this.activedDirectiveTabMemory = new MdbRuntimeVariable();
                this.activedDirectiveTabMemory.projectId = projectId;
                this.activedDirectiveTabMemory.key = 'directive_actived_id';
                this.activedDirectiveTabMemory.value = null;
            }
            
            let isLastDirectiveOpend = false;
            if ( null != this.activedDirectiveTabMemory.value ) {
                let activeId = this.activedDirectiveTabMemory.value;
                for ( let i=0; i<this.openedDirectives.length; i++ ) {
                    if ( null != this.openedDirectives[i].model && this.openedDirectives[i].model.id == activeId ) {
                        this.activedDirectiveTab = this.openedDirectives[i].key;
                        this.openedDirectives[i].hasRendered = true;
                        isLastDirectiveOpend = true;
                    }
                }
            }
            if ( !isLastDirectiveOpend ) {
                this.directiveTabAdd();
            }
        },

        /**
         * update runtime variable `directive_opened_list`
         * @private
         */
        async openedDirectiveMemoryUpdate() {
            let list = [];
            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                let model = this.openedDirectives[i].model;
                if ( null != model && !model.isNew ) {
                    list.push(this.openedDirectives[i].model.id);
                }
            }
            this.openedDirectiveMemory.value = list.join(',');
            await this.openedDirectiveMemory.save();
        },

        /**
         * event handler on directive item clicked.
         * @param {MdbDirective} directive
         */
        async actionDirectiveEntryClicked( directive ) {
            if ( null === directive ) {
                return ;
            }

            // if directive already been opend, jump to that tab
            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                if ( null != this.openedDirectives[i].model 
                && this.openedDirectives[i].model.id == directive.id ) {
                    this.activedDirectiveTab = this.openedDirectives[i].key;
                    return;
                }
            }

            // or create a new tab to tab list.
            let key = `dir-${this.directiveListKeyCounter}`;
            this.openedDirectives.push({
                hasChanged:false,
                model:directive,
                key : key,
                hasRendered : this.hasInited,
            });

            this.activedDirectiveTab = key;
            this.directiveListKeyCounter ++;
            if ( this.hasInited ) {
                await this.openedDirectiveMemoryUpdate();
            }
        },

        /**
         * event handler for tab edit.
         * @event
         * @param {Stirng} tabKey
         * @param {String} action
         */
        actionDirectiveTabEdit( tabKey, action ) {
            if ( 'remove' === action ) {
                this.actionDirectiveTabRemove(tabKey);
            } else if ('add' === action) {
                this.directiveTabAdd();
            }
        },

        /**
         * get directive index by given tab key
         * @public
         * @return {Number}
         */
        getDirectiveIndexByTabKey( tabKey ) {
            let index = -1;
            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                if ( tabKey === this.openedDirectives[i].key ) {
                    index = i;
                }
            }
            return index;
        },

        /**
         * close directive tab
         * @param {String} tabKey
         */
        async actionDirectiveTabRemove( tabKey ) {
            // find index by given tabkey
            let index = this.getDirectiveIndexByTabKey(tabKey);
            if ( -1 == index ) {
                return ;
            }

            // close tab directlly if directive not changed
            let $this = this;
            if ( !this.openedDirectives[index].hasChanged 
            || undefined == this.$refs[`directivePanel_${index}`] ) {
                await $this.directiveTabClose(index);
                return;
            }
            
            // or, ask user to save change or not
            let directiveSave = async function() {
                let panel = $this.$refs[`directivePanel_${index}`][0];
                if ( ! await panel.save() ) {
                    return;
                }
                await $this.directiveTabClose(index);
            };
            
            this.$confirm({
                title: this.$t('messages.dialogTitle.tip'),
                content: this.$t('directive.main.changedDirectiveCloseConfirm'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                onOk : directiveSave,
                onCancel : async function() {
                    await $this.directiveTabClose(index);
                },
            });
        },

         /**
         * add new directive tab
         * @param {Object} initData
         */
        directiveTabAdd(initData) {
            if ( undefined === initData ) {
                initData = null;
            } else {
                let model = new MdbDirective();
                model.setAttributes(initData);
                initData = model;
            }

            let key = `dir-${this.directiveListKeyCounter}`;
            this.openedDirectives.push({
                hasChanged: null != initData,
                model: initData,
                key : key,
                hasRendered : true,
            });
            this.activedDirectiveTab = key;
            this.directiveListKeyCounter ++;
        },

        /**
         * close tab by given index
         * @param {Number} index
         */
        async directiveTabClose( index ) {
            if ( this.openedDirectives.length > 1 ) {
                if ( this.openedDirectives[index].key == this.activedDirectiveTab ) {
                    if ( 0 < index ) {
                        this.activedDirectiveTab = this.openedDirectives[index - 1].key;
                    } else {
                        this.activedDirectiveTab = this.openedDirectives[index + 1].key;
                    }
                }
            }

            this.openedDirectives.splice(index, 1);
            await this.openedDirectiveMemoryUpdate();
            if ( 0 == this.openedDirectives.length ) {
                this.directiveTabAdd();
            }
        },
        
        /**
         * event handler for directive delete from entry
         * @param {MdbDirective} directive
         */
        actionDirectiveDelete(directive) {
            let id = directive.id;
            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                if ( null != this.openedDirectives[i].model 
                && this.openedDirectives[i].model.id == id ) {
                    this.directiveTabClose(i);
                    break;
                }
            }
        },

        /**
         * event handler after directive saved
         * @param {Boolean} isNew
         * @param {MdbDirective} directive
         * @param {MdbDirectiveEntry} newEntry
         */
        async actionDirectiveSaved( isNew, directive, newEntry ) {
            if ( isNew ) {
                this.$refs.entries.appendEntry(newEntry, directive);
                await this.openedDirectiveMemoryUpdate();
                await this.activedDirectiveTabMemorySetValue(directive.id);
            } else {
                this.$refs.entries.refreshDirective(directive);
            }
        },

        /**
         * handle new tmp directive
         * @param {Object} directiveData
         */
        handleNewTempDirectiveCreated( directiveData ) {
            directiveData.projectId = this.curProjectId;
            this.directiveTabAdd(directiveData);
        },

        /**
         * set id to runtime variable `directive_actived_id`
         * @private
         */
        async activedDirectiveTabMemorySetValue( directiveId ) {
            if ( null === this.activedDirectiveTabMemory ) {
                return ;
            }
            this.activedDirectiveTabMemory.value = directiveId;
            await this.activedDirectiveTabMemory.save();
        },

        /**
         * value change handler for `actionDirectiveTab`.
         * - set runtime variable to remember this directive id.
         * - mark this directive tab as rendered.
         * @param {String} activeKey
         */
        async actionDirectiveTabChange( activeKey ) {
            if ( !this.hasInited ) {
                return;
            }

            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                if ( this.openedDirectives[i].key != activeKey ) {
                    continue;
                }
                if ( null == this.openedDirectives[i].model ) {
                    this.activedDirectiveTabMemorySetValue(null);
                } else {
                    this.activedDirectiveTabMemorySetValue(this.openedDirectives[i].model.id);
                }
                this.openedDirectives[i].hasRendered = true;
            }
        },

        /**
         * active directive tab by more list menu item
         * @param {Event} event
         * - key : key of directive tab user clicked
         */
        actionTabMoreListMenuClick( event ) {
            this.activedDirectiveTab = event.key;
        },
        
        /**
         * directive tab context menu handler
         * @event
         * @param {Object} item
         */
        actionHandleTabContextMenu( item ) {
            let handler = `actionHandleTabContextMenu${item.key}`;
            this[handler](item);
        },

        /**
         * directive tab context menu handler : Close This Tab
         * @param {Object} item
         */
        actionHandleTabContextMenuCloseThis(item) {
            let dirkey = item.domEvent.target.dataset.dirkey;
            this.actionDirectiveTabRemove(dirkey);
        },

        /**
         * directive tab context menu handler : Close Other Tabs
         * @param {Object} item
         */
        async actionHandleTabContextMenuCloseOthers(item) {
            let dirkey = item.domEvent.target.dataset.dirkey;
            let keys = [];
            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                if ( dirkey == this.openedDirectives[i].key ) {
                    continue;
                }
                keys.push(this.openedDirectives[i].key);
            }
            for ( let i=0; i<keys.length; i++ ) {
                await this.actionDirectiveTabRemove( keys[i] );
            }
        },

        /**
         * directive tab context menu handler : Close All Tabs
         * @param {Object} item
         */
        async actionHandleTabContextMenuCloseAll() {
            let keys = [];
            for ( let i=0; i<this.openedDirectives.length; i++ ) {
                keys.push(this.openedDirectives[i].key);
            }
            for ( let i=0; i<keys.length; i++ ) {
                await this.actionDirectiveTabRemove( keys[i] );
            }
        },

        /**
         * directive tab context menu handler : Copy directive name
         * @param {Object} item
         */
        actionHandleTabContextMenuCopyName( item ) {
            let index = item.domEvent.target.dataset.index;
            let name = this.openedDirectives[index].model.name;
            window.navigator.clipboard.writeText(name);
            this.$message.success(this.$t('directive.main.directiveNameCopySuccessed'));
        },
        
        /**
         * directive tab context menu handler : Copy directive full path name
         * @param {Object} item
         */
        async actionHandleTabContextMenuCopyPathName( item ) {
            let index = item.domEvent.target.dataset.index;
            let name = this.openedDirectives[index].model.name;
            let path = [];
            path.unshift(name);

            let directive = this.openedDirectives[index].model;
            if ( directive.isNew ) {
                this.$message.error(this.$t('directive.main.directivePathNameCopyFailedUnsaved'));
                return;
            }

            let directiveId = this.openedDirectives[index].model.id;
            let entry = await MdbDirectiveEntry.findOne({type:'directive',target:directiveId});
            do {
                let parent = await MdbDirectiveEntry.findOne({type:'folder',id:entry.parentId});
                if ( null == parent ) {
                    break;
                }
                let targetName = await parent.targetName();
                path.unshift(targetName);
                entry = parent;
            } while ( 0 != entry.parentId );

            let pathName = path.join('/');
            window.navigator.clipboard.writeText(pathName);
            this.$message.success(this.$t('directive.main.directivePathNameCopySuccessed'));
        },

        /**
         * directive tab context menu handler : create new directive
         * @param {Object} item
         */
        actionHandleTabContextMenuCreateNew(item) {
            this.directiveTabAdd();
        },

        /**
         * directive tab context menu handler : duplicate this directive
         * @param {Object} item
         */
        actionHandleTabContextMenuDuplicateThis(item) {
            let index = item.domEvent.target.dataset.index;
    
            let model = this.openedDirectives[index].model;
            let modelData = null;
            if ( null !== model ) {
                modelData = model.getData();
                delete modelData.id;
                modelData.name = this.$t('directive.entry.directiveCopyName', [modelData.name]);
            }
            this.directiveTabAdd(modelData);
        },
    },
}
</script>
<style scoped>
.tab-ext-tools {display: inline-block;padding-left: 5px;}
.tab-ext-tools-more-list {height: 20px !important;line-height: 21px;width: 20px !important;padding: 0 !important;vertical-align: 2px;}
.tab-ext-tools-more-list-icon {vertical-align: initial;}
</style>
<style>
.directive-tabs-more-list-overlay > ul {max-height: 500px;overflow-y: auto;}
.directive-tabs {height: 100%;display: flex;flex-direction: column;}
.directive-tabs .ant-tabs-content {margin-left: 0%;flex-grow: 1;height: 0;}
</style>