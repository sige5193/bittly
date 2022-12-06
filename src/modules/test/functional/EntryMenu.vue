<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-empty v-if="0 == Object.keys(entries).length" :description="false" class="mt-5"/>
    <a-menu v-model="activedIds" class="flex-grow-1 h-0 overflow-y-auto" @click="actionEntryMenuItemClicked">
      <a-menu-item v-for="(entry,entryId) in entries" :key="entryId">
        {{entry.title}}
      </a-menu-item>
    </a-menu>
    
    <!-- toolbar -->
    <div class="d-flex flex-dir-row p-1 border-top">
      <a-button class="mr-1" block @click="actionCreateNewTestcase">{{$t('test.functional.create')}}</a-button>
      <a-dropdown :trigger="['click']">
        <a-button><a-icon type="menu" /></a-button>
        <a-menu slot="overlay" @click="actionActionMenuItemClicked">
          <a-menu-item key="ExecuteAll">{{$t('test.functional.executeAll')}}</a-menu-item>
          <a-menu-item key="Import">{{$t('test.functional.import')}}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <modal-execute-all ref="modalExecuteAll" :getWorkspace="getWorkspace" />
    <modal-import ref="modalImport"/>
  </div>
</template>
<script>
import ProjectMixin from '../../../utils/ProjectMixin.js'
import MdbFunctionalTestcase from '../../../models/MdbFunctionalTestcase.js'
import MyDate from '../../../utils/datatype/MyDate.js';
import ModalExecuteAll from './ModalExecuteAll.vue'
import ModalImport from './ModalImport.vue'
export default {
    name : 'TestFunctionEntryMenu',
    mixins : [ProjectMixin],
    components : {
        'modal-execute-all' : ModalExecuteAll,
        'modal-import' : ModalImport,
    },
    props : {
        /**
         * @property {Function}
         */
        getWorkspace : {type:Function,required:true},
    },
    data() {
        return {
            /**
             * @property {Array<MdbFunctionalTestcase>}
             */
            entries : [],
            /**
             * @property {String[]}
             */
            activedIds : [],
        };
    },
    mounted() {
        this.refreshEntries();
    },
    methods : {
        /**
         * load functional testcases.
         * @public
         */
        async refreshEntries( activeId=null ) {
            this.activedIds = [];
            this.entries = {};

            let list = await MdbFunctionalTestcase.findAll({project_id:this.curProjectId});
            list.sort((itemA,itemB ) => itemA.title.localeCompare(itemB.title));

            for ( let i=0; i<list.length; i++ ) {
                this.entries[list[i].id] = list[i];
            }

            if ( null !== activeId ) {
                this.activedIds.push(activeId);
            }
            this.$forceUpdate();
        },

        /**
         * open testcase by given id
         */
        openTestcaseById( id ) {
            let testcase = this.entries[id];
            this.getWorkspace().openTestcase(testcase);
        },

        /**
         * event handle on project changed.
         * @overide
         */
        handleCurProjectIdChanged() {
            this.refreshEntries();
        },

        /**
         * event handler to create new testcase
         * @event
         */
        actionCreateNewTestcase() {
            this.activedIds = [];
            let testcase = new MdbFunctionalTestcase();
            testcase.projectId = this.curProjectId;
            testcase.title = this.$t('test.functional.unnamed', [MyDate.formatAsShortKey(null)]);
            let workspace = this.getWorkspace();
            workspace.openTestcase(testcase);
            this.$forceUpdate();
        },

        /**
         * event handle on entry menu item clicked
         * @param {Event} event
         */
        actionEntryMenuItemClicked( event ) {
            let testcase = this.entries[event.key];
            this.getWorkspace().openTestcase(testcase);
        },

        /**
         * action handler on action menu item clicked
         * @param {Event} event
         */
        actionActionMenuItemClicked( event ) {
            let handle = `handleActionMenuItem${event.key}`;
            this[handle]();
        },

        /**
         * action handler to execute all testcases.
         */
        handleActionMenuItemExecuteAll() {
            this.$refs.modalExecuteAll.open();
        },

        /**
         * action handler for import
         */
        handleActionMenuItemImport() {
            this.$refs.modalImport.open();
        }
    },
}
</script>