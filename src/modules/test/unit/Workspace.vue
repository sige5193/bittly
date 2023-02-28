<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-empty v-if="null == directive" :description="false" class="mt-5"/>
    <template v-else>
      <a-page-header style="border: 1px solid rgb(235, 237, 240)" :title="directive.name">
        <template slot="extra">
          <a-button 
            :disabled="isExecuting"
            @click="actionCreateNewTestcase"
          >{{$t('test.editModal.createNewTestcase')}}</a-button>
          <a-button 
            type="primary" 
            :loading="isExecuting"
            :disabled="isExecuting"
            @click="actionExecCasesOfThisDirective"
          >{{$t('button.execute')}}</a-button>
        </template>
      </a-page-header>
      
      <!-- testcase list -->
      <div class="flex-grow overflow-y-auto">
        <a-empty v-if="0 == testcases.length" :description="false" class="mt-5" />
        <testcase ref="testcase" v-for="(testcase,index) in testcases" :key="index"
          :index="index" :testcase="testcase" :directive="directive"
          @testcase-delete="actionTestcaseDelete"
        ></testcase>
      </div>
    </template>
    <modal-testcase-edit ref="modalTestcaseEdit"></modal-testcase-edit>
  </div>
</template>
<script>
import MdbTestcase from '../../../models/MdbTestcase.js'
import ModalTestcaseEdit from './ModalTestcaseEdit.vue'
import Testcase from './Testcase.vue'
export default {
    components : {
        'testcase' : Testcase,
        'modal-testcase-edit' : ModalTestcaseEdit,
    },
    data() {
        return {
            /**
             * @property {MdbDirective}
             */
            directive : null,
            /**
             * @property {Boolean}
             */
            isExecuting : false,
            /**
             * @property {Array<MdbTestcase>}
             */
            testcases : [],
        }
    },
    methods : {
        /**
         * open directive by given directive
         * @public
         * @property {MdbDirective}
         */
        async openDirective( directive ) {
            this.directive = directive;
            await this.refreshTestcaseList();
        },

        /**
         * expand testcase by given id
         * @param {Number} id
         */
        expandTestcaseById( id ) {
            for ( let i=0; i<this.testcases.length; i++ ) {
                if ( this.testcases[i].id === id ) {
                    this.$refs.testcase[i].expand();
                }
            }
        },

        /**
         * refresh testcase list of current directive
         */
        async refreshTestcaseList() {
            this.testcases = [];
            this.testResults = [];
            this.testcases = await MdbTestcase.findAll({
                directive_id : this.directive.id,
            });
            this.testcases.sort(( itemA, itemB ) => {
                if ( itemA.type == itemB.type ) {
                    return itemA.title.localeCompare(itemB.title);
                } else {
                    return 'folder' == itemA.type ? -1 : 1;
                }
            });
        },

        /**
         * create new testcase
         */
        async actionCreateNewTestcase() {
            try {
                await this.$refs.modalTestcaseEdit.open(this.directive);
                this.refreshTestcaseList();
            } catch {
                return;
            }
        },

        /**
         * execute all testcases
         */
        async execute() {
            let result = {};
            result.message = '';
            result.success = true;
            result.duration = 0;
            result.testcases = [];

            let startAt = (new Date()).getTime();
            this.isExecuting = true;
            let isAllPassed = true;
            let testcases = this.$refs.testcase || [];
            for ( let i=0; i<testcases.length; i++ ) {
                let executor = testcases[i];
                if ( this.isDestroying ) {
                    isAllPassed = false;
                    break;
                }
                let isPassed = false;
                try {
                    isPassed = await executor.execute(true);
                } catch ( e ) {
                    isPassed = false;
                }
                result.testcases.push({testcase:executor.testcase,success:isPassed});
                isAllPassed = isAllPassed && isPassed;
            }
            this.isExecuting = false;

            result.duration = (new Date()).getTime() - startAt;
            result.success = isAllPassed;
            return result;
        },

        /**
         * execute all the testcases of current directive
         */
        async actionExecCasesOfThisDirective() {
            this.isExecuting = true;
            let testcases = this.$refs.testcase || [];
            for ( let i=0; i<testcases.length; i++ ) {
                let executor = testcases[i];
                if ( this.isDestroying ) {
                    break;
                }
                await executor.execute();
            }
            this.isExecuting = false;
        },

        /**
         * event handler of testcase deleting
         * @param {Number} index
         */
        actionTestcaseDelete( index ) {
            this.testcases.splice(index, 1);
        },
    },
}
</script>