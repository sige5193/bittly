<template>
  <a-modal
    :title="$t('test.testcaseExecuteSummaryTitle')"
    v-if="executeAll.modalEnable"
    :visible="executeAll.modalEnable"
  >
    <p>{{$t('test.testcaseExecuteSummaryTotalCount')}} : {{executeAll.testcaseCount}}</p>
    <p>
      {{$t('test.testcaseExecuteSummaryStatusCount')}} : 
      <a-tag color="green">{{$t('test.testcaseExecuteStatusPass')}} : {{executeAll.testcaseSuccessCount}}</a-tag>  
      <a-tag color="red">{{$t('test.testcaseExecuteStatusNotPass')}} : {{executeAll.testcaseErrorCount}}</a-tag>
    </p>
    <p>{{$t('test.testcaseExecuteSummaryDuration')}} : {{executeAll.durationString}}</p>
    <template slot="footer">
      <a-button @click="actionCloseExecuteAllSummaryModal">{{$t('button.close')}}</a-button>
      <a-dropdown :trigger="['click']">
        <a-menu slot="overlay" @click="actionExecuteAllSummaryMenuExport">
          <a-menu-item key="html">HTML</a-menu-item>
          <a-menu-item key="excel">Excel</a-menu-item>
        </a-menu>
        <a-button type="primary" style="margin-left: 8px"> {{$t('test.exportTestReport')}} <a-icon type="down" /> </a-button>
      </a-dropdown>
    </template>
  </a-modal>
</template>
<script>
export default {
    data() {
        return {
            executeAll : { 
                modalEnable : false, 
                isExecuting : false,
            },
        };
    },
    methods : {
        /**
         * execute all testcases
         * @public 
         */
        async execute() {
            // setup batch env
            this.executeAll.modalEnable = false;
            this.executeAll.testcaseCount = 0;
            this.executeAll.testcaseSuccessCount = 0;
            this.executeAll.testcaseErrorCount = 0;
            this.executeAll.durationString = '';
            this.executeAll.stopExecuting = false;
            this.executeAll.isExecuting = true;
            this.executeAll.startedAt = new Date();
            this.executeAll.exportor = new Exportor();

            // get all directive and execute testcase by menu item
            let menuData = this.$refs.unitEntryMenu.getMenuData();
            for ( let i=0; i<menuData.length; i++ ) {
                if ( this.isDestroying ) {
                    this.executeAll.isExecuting = false;
                    this.executeAll.stopExecuting = true;
                    return;
                }
                await this.autoExecuteTestcases(menuData[i]);
            }

            // done batch executing, calculate summary info, and display result modal.
            let duration = (new Date()).getTime() - this.executeAll.startedAt;
            duration = parseInt(duration / 1000);

            let sec = duration % 60;
            let min = (duration - sec) / 60;
            if ( 10 > sec ) {
                sec = '0' + sec;
            }
            if ( 10 > min ) {
                min = '0' + min;
            }
            this.executeAll.durationString = `${min}:${sec}`;
            this.executeAll.modalEnable = true;
            this.executeAll.isExecuting = false;
            let coms = this.$store.getters.communicators;
            for ( let comKey in coms ) {
                await coms[comKey].close();
            }

            this.$refs.unitEntryMenu.batchExecuteStoped();
            this.$forceUpdate();
        },

        /**
         * stop executing all testcases. it would not stop directly, it would 
         * stop executing after done executing current testcase and then stop 
         * alll.
         */
        stop() {
            this.executeAll.stopExecuting = true;
        },

        /**
         * close modal of batch executing summary modal
         */
        actionCloseExecuteAllSummaryModal() {
            this.executeAll.modalEnable = false;
            this.$forceUpdate();
        },

        /**
         * export test summary to report file.
         */
        async actionExecuteAllSummaryMenuExport( action ) {
            await this.executeAll.exportor.export(action.key);
            this.executeAll.modalEnable = false;
            this.$forceUpdate();
        },

        /**
         * execute testcase by menu entry
         * @param {Object} menu
         */
        async autoExecuteTestcases( menu ) {
            if ( this.executeAll.stopExecuting || this.isDestroying ) {
                return;
            }

            let entries  = this.$refs.unitEntryMenu;
            if ( "folder" == menu.type ) {
                entries.menuExpandedKeyAdd(menu.key);
                for ( let i=0; i<menu.children.length; i++ ) {
                    await this.autoExecuteTestcases(menu.children[i]);
                }
            } else {
                entries.directiveTestStatusUpdate(menu.key, 'testing');
                let directive = entries.getDirectiveByEntryKey(menu.key);
                this.executeAll.exportor.logDirective(directive);
                await this.actionDirectiveClicked(directive);
                await this.$nextTick();
                let isPassed = await this.actionExecCasesOfThisDirective();
                await Common.msleep(200);
                
                let status = null;
                if ( null == isPassed ) {
                    status = 'warning';
                } else {
                    status = isPassed ? 'success' : 'error';
                }
                entries.directiveTestStatusUpdate(menu.key, status);
            }
        },
    }
}
</script>