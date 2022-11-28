<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-empty v-if="0 == Object.keys(entries).length" :description="false" class="mt-5"/>
    <a-menu class="flex-grow-1" @click="actionEntryMenuItemClicked">
      <a-menu-item v-for="(entry,entryId) in entries" :key="entryId">
        {{entry.title}}
      </a-menu-item>
    </a-menu>
    <a-button block @click="actionCreateNewTestcase">{{$t('test.functional.create')}}</a-button>
  </div>
</template>
<script>
import ProjectMixin from '../../../utils/ProjectMixin.js'
import MdbFunctionalTestcase from '../../../models/MdbFunctionalTestcase.js'
import MyDate from '../../../utils/datatype/MyDate.js';
export default {
    name : 'TestFunctionEntryMenu',
    mixins : [ProjectMixin],
    props : {
        /**
         * @property {Function}
         */
        getWorkspace : {type:Function,required:true},
    },
    data() {
        return {
            entries : [],
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
        async refreshEntries() {
            this.entries = {};
            let list = await MdbFunctionalTestcase.findAll({project_id:this.curProjectId});
            for ( let i=0; i<list.length; i++ ) {
                this.entries[list[i].id] = list[i];
            }
            this.$forceUpdate();
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
            let testcase = new MdbFunctionalTestcase();
            testcase.projectId = this.curProjectId;
            testcase.title = this.$t('test.functional.unnamed', [MyDate.formatAsShortKey(null)]);
            let workspace = this.getWorkspace();
            workspace.openTestcase(testcase);
        },

        /**
         * event handle on entry menu item clicked
         * @param {Event} event
         */
        actionEntryMenuItemClicked( event ) {
            let testcase = this.entries[event.key];
            this.getWorkspace().openTestcase(testcase);
        },
    },
}
</script>