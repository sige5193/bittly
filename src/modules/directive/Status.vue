<template>
  <div class="d-inline-block" v-if="0 < status.length">
    <a-popover trigger="click" placement="bottom" v-model="isEditorVisiable">
      <!-- title of directive status editor -->
      <a-row slot="title">
        <a-col :span="12">{{$t('directive.statusPopoverTitle')}}</a-col>
        <a-col class="text-right" :span="12">
          <a-button size="small" ref="btnClear" @click="actionClear">{{$t('directive.statusClear')}}</a-button>
        </a-col>
      </a-row>
      
      <!-- status list edit -->
      <template slot="content">
        <a-input v-for="(statusItem,index) in status" :key="index" 
          ref="inputStatusValue"
          size="small"
          v-model="statusItem.value"
          :addon-before="statusItem.name"
          @input="actionForceUpdate"
        >
          <div slot="addonAfter" class="btn-ok" @click="actionStatusChange(index)">
            <a-icon type="check" ref="iconCheck"/>
          </div>
        </a-input>
      </template>
      
      <!-- toggler of editor -->
      <a-button ref="btnOpenStausPopover" size="small" class="ml-1">
        {{$t('directive.statusViewerButton')}}
      </a-button>
    </a-popover>
  </div>
</template>
<script>
import ComponentMixin from '../../utils/ComponentMixin.js'
import MdbDirective from '../../models/MdbDirective.js'
export default {
    name : 'DirectiveStatus',
    mixins : [ComponentMixin],
    props : {
        /**
         * instance of directive model
         * @property {MdbDirective}
         */
        directive : {type:MdbDirective, required:true},
    },
    data() {
        return {
            /**
             * if status editor visiable.
             * @property {Boolean}
             */
            isEditorVisiable : false,
            /**
             * status list of current directive
             * @property {Array<Object>}
             */
            status : [],
            /**
             * callback function on directive status changed
             * @property {Function|null}
             */
            statusUpdateHandler : null,
        };
    },
    mounted() {
        this.statusUpdateHandler = () => this.refreshStatus();
        this.directive.on('status-update', this.statusUpdateHandler);
    },
    beforeDestroy() {
        this.directive.off('status-update', this.statusUpdateHandler);
    },
    methods : {
        /**
         * update directive manually
         * @param {Number} index
         */
        actionStatusChange(index) {
            let status = this.status[index];
            this.directive.statusSet(status.name, status.value);
            this.isEditorVisiable = false;
            this.$forceUpdate();
        },

        /**
         * reload all status from directive, this function would be 
         * called everytime the directive status updated.
         */
        refreshStatus() {
            this.status = [];
            let statusList = this.directive.statusList();
            for ( let status in statusList ) {
                this.status.push({name:status,value:statusList[status].value});
            }
        },

        /**
         * clear 
         */
        actionClear() {
            this.isEditorVisiable = false;
            this.directive.statusClear();
            this.refreshStatus();
        }
    }
}
</script>
<style scoped>
.btn-ok {cursor: pointer; width: 32px;margin: -5px -11px;display: table;}
.btn-ok:hover {background: white;}
</style>