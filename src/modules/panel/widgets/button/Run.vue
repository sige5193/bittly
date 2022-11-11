<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-button 
        ref="button"
        :size="widget.btnSize"
        :type="widget.btnType" 
        @click="actionButtonExec" 
        :loading="isExecuting"
      >
        <a-icon ref="icon" v-if="widget.icon" :type="widget.icon" /> 
        {{widget.label}}
      </a-button>
    </a-tooltip>
  </div>
</template>
<script>
import Common from '../../../../utils/Common.js'
import WidgetRunMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetButton',
    mixins : [WidgetRunMixin],
    methods : {
        /**
         * execute button click action
         */
        async actionButtonExec() {
            if ( Common.isEmpty(this.widget.confirmMessage) ) {
                await this.actionExecute();
                return;
            }
            
            this.$confirm({
                title: this.$t('panel.widgets.button.confirmTitle'),
                content: this.widget.confirmMessage,
                okText: this.$t('button.ok'),
                okType: 'danger',
                cancelText: this.$t('button.cancel'),
                onOk : () => this.actionExecute(),
            });
        },
    },
}
</script>