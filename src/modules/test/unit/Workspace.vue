<template>
  <div>
    <a-empty v-if="null == directive" :description="false" />
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
      <div>
        <a-empty v-if="0 == testcases.length" :description="false" class="mt-5" />
        <testcase ref="testcase"
          v-for="(testcase,index) in testcases" :key="index"
          :index="index"
          :testcase="testcase"
          :directive="directive"
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
         * refresh testcase list of current directive
         */
        async refreshTestcaseList() {
            this.testcases = [];
            this.testResults = [];
            this.testcases = await MdbTestcase.findAll({
                directive_id : this.directive.id,
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
         * execute all the testcases of current directive
         */
        async actionExecCasesOfThisDirective() {
            if ( 0 >= this.testcases.length ) {
                return null;
            }

            this.isExecuting = true;
            let isAllPassed = true;
            let testcases = this.$refs.testcase;
            for ( let i=0; i<testcases.length; i++ ) {
                if ( this.isDestroying 
                || (this.executeAll.isExecuting && this.executeAll.stopExecuting)
                ) {
                    isAllPassed = false;
                    break;
                }
                let isPassed = await testcases[i].execute();
                isAllPassed = isAllPassed && isPassed;

                this.executeAllLogTestcase(testcases[i]);
            }
            this.isExecuting = false;
            return isAllPassed;
        },

        /**
         * event handler of testcase deleting
         * @param {Number} index
         */
        actionTestcaseDelete( index ) {
            this.testcases.splice(index, 1);
        },

        /**
         * log testcase status after executing it.
         * @param {VueComponent} testcaseRef
         * @private
         */
        executeAllLogTestcase( testcaseRef ) {
            if ( !this.executeAll.isExecuting || this.isDestroying ) {
                return;
            }

            this.executeAll.exportor.logTestcase(
                this.directive.id, 
                testcaseRef.getTestcase(),
                testcaseRef.getResult(),
                testcaseRef.getResultStatus(),
            );

            let isPassed = testcaseRef.getResultStatus() == 'success';
            this.executeAll.testcaseCount ++;
            if ( true == isPassed ) {
                this.executeAll.testcaseSuccessCount ++;
            } else if ( false == isPassed ) {
                this.executeAll.testcaseErrorCount ++;
            }
        },
    },
}
</script>