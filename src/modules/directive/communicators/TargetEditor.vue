<template>
  <div class="config-bar p-2 rounded" v-if="null != target">
    <a-row>
      <a-col :span="3" class="pr-1">
        <a-select 
          ref="selectTargetType" 
          class="w-100" 
          v-model="target.type" 
          @change="actionTargetTypeChange"
        >
          <a-select-option v-for="(targetEditor, teKey) in targetEditors" 
            :key="teKey" 
            :value="teKey"
          > {{targetEditor.label}} </a-select-option>
        </a-select>
      </a-col>
      
      <!-- target editor -->
      <a-col :span="19" class="pr-1">
        <target-editor-custom-wrapper
          v-if=" undefined != targetEditors[target.type].isCustom && true == targetEditors[target.type].isCustom"
          :name="target.type"
          v-model="target"
          @change="actionTargetConfigChanged"
        />
        <component v-else
          ref="targetEditor"
          :is="`target-${target.type}`"
          v-model="target"
          @change="actionTargetConfigChanged"
          @parameter-editor-enable-change="actionParameterEditorEnableChange"
        ></component>
      </a-col>
      
      <!-- execute -->
      <a-col :span="2" class="text-right">
        <a-popover :visible="null != autoSendRuntime" placement="topRight">
          <template slot="content" v-if="null != autoSendRuntime">
            {{$t('directive.target.autoSendExecuteCount')}} : {{autoSendRuntime.execCount}} <a-icon type="loading" />
          </template>
          
          <a-dropdown-button ref="btnSend" :type="null == autoSendRuntime ? 'primary' : 'danger'" 
            @click="actionSendToggle" 
            :trigger="['click']"
          >
            <span v-if="null == autoSendRuntime">{{$t('directive.target.send')}}</span>
            <span v-else>{{$t('directive.target.autoSendBtnStop')}}</span>
            <div slot="icon" style="position: relative;width: 5px;height: 15px;">
              <a-icon ref="btnSendMenuTrigger" type="more" style="position: absolute;top: 0;left: -5px;"/>
            </div>
            <a-menu ref="menuAutoSend" slot="overlay" @click="actionSendMenuClick">
              <a-menu-item key="AutoSend" :disabled="null != autoSendRuntime"> <a-icon type="clock-circle" /> {{$t('directive.target.autoSend')}} </a-menu-item>
            </a-menu>
          </a-dropdown-button>
        </a-popover>
      </a-col>
    </a-row>
   
    <!-- auto send modal -->
    <a-modal
      ref="modalAutoSend" 
      v-model="autoSendModalEnable" 
      :title="$t('directive.target.autoSend')" 
      :okText="$t('directive.target.autoSendBtnStart')" 
      :cancelText="$t('button.cancel')"
      @ok="actionAutoSendStart"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item :label="$t('directive.target.autoSendIntervalTime')">
          <a-row>
            <a-col :span="6">
              <a-checkbox ref="checkboxAutoSendTimeFixed" 
                v-model="autoSendOptions.enableIntervalTimeFixed" 
                @change="actionForceUpdate"
              >
                {{$t('directive.target.autoSendIntervalTimeFixed')}}
              </a-checkbox>
            </a-col>
            <a-col :span="18">
              <a-input-group v-if="!autoSendOptions.enableIntervalTimeFixed" compact>
                <a-input-number ref="checkboxAutoSendTimeMin" 
                  style=" width: 40%;" 
                  v-model="autoSendOptions.intervalTimeMin"
                  :precision="0"
                  :min="0"
                  :step="1000"
                  :placeholder="$t('directive.target.autoSendIntervalMin')"
                  @change="actionForceUpdate"
                />
                <a-input
                  class="w-10 pl-0 pr-0 bg-white text-center"
                  style="border-left: 0; pointer-events: none;"
                    placeholder="~"
                    disabled
                />
                <a-input-number ref="checkboxAutoSendTimeMax"
                  style="width: 40%;border-left: 0" 
                  v-model="autoSendOptions.intervalTimeMax"
                  :precision="0"
                  :min="0"
                  :step="1000"
                  :placeholder="$t('directive.target.autoSendIntervalMax')"
                  @change="actionForceUpdate"
                />
                <a-input disabled
                  class="w-10 pl-0 pr-0 text-center bg-white"
                  style="border-left: 0; pointer-events: none;"
                  placeholder="ms"
                />
              </a-input-group>
              <a-input-group v-else compact>
                <a-input-number 
                  class="w-90"
                  ref="inputIntervalTime" 
                  v-model="autoSendOptions.intervalTime"
                  :precision="0"
                  :min="0"
                  :step="1000"
                  :placeholder="$t('directive.target.autoSendIntervalTime')"
                  @change="actionForceUpdate"
                />
                <a-input disabled
                  class="w-10 pl-0 pr-0 text-center bg-white"
                  style="border-left: 0; pointer-events: none;"
                  placeholder="ms"
                />
              </a-input-group>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item :label="$t('directive.target.autoSendExecuteCount')">
          <a-row>
            <a-col :span="8">
              <a-checkbox 
                ref="checkboxExecuteAlways"
                v-model="autoSendOptions.enableExecuteAlways" 
                @change="actionForceUpdate"
              >
                {{$t('directive.target.autoSendExecuteCountAlways')}}
              </a-checkbox>
            </a-col>
            <a-col :span="16">
              <a-input-number 
                ref="inputExecuteCount"
                class="w-100" 
                v-if="!autoSendOptions.enableExecuteAlways" 
                v-model="autoSendOptions.executeCount"
                :precision="0"
                :min="1"
                :step="1"
                :placeholder="$t('directive.target.autoSendExecuteCount')"
                @change="actionForceUpdate"
              />
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>
<script>
import MdbRuntimeVariable from '../../../models/MdbRuntimeVariable.js'
import ProjectMixin from '@/utils/ProjectMixin.js'
import Common from '@/utils/Common.js'
import TargetEditorRegistryMixin from './TargetEditorRegistryMixin.js'
import MyNumber from '../../../utils/datatype/MyNumber.js'
import MyObject from '../../../utils/datatype/MyObject.js'
import TargetEditorCustomWrapper from './TargetEditorCustomWrapper.vue'
export default {
    name : 'BlockTargetConfig',
    mixins : [TargetEditorRegistryMixin,ProjectMixin],
    components : {
        'target-editor-custom-wrapper' : TargetEditorCustomWrapper,
    },
    props : {
        /**
         * callback handler to execute directive
         * @property {Callback}
         */
        sendExecutor : {},
        /**
         * instance of directive
         * @property {MdbDirective}
         */
        value : {},
    },
    data() {
        return {
            /**
             * instance of directive model
             * @property {MdbDirective}
             */
            directive : null,
            /**
             * target object to communicator
             * @property {Object|null}
             */
            target : null,
            /**
             * indicate whether auto send modal is enabled.
             * @property {Boolean}
             */
            autoSendModalEnable : false,
            /**
             * auto send options
             * @property {Object}
             */
            autoSendOptions : {},
            /**
             * the runtime of auto send
             * @property {Object|null}
             */
            autoSendRuntime : null,
        };
    },
    async created() {
        this.$eventBus.$emit('app-directive-communicator-editor-init', this);
        await this.initVModel();
    },
    /**
     * clean the auto send timer if till running
     */
    beforeDestroy() {
        if ( null != this.autoSendRuntime ) {
            clearTimeout(this.autoSendRuntime.timer);
        }
        this.$log("done");
    },
    methods : {
        /**
         * init v-model
         */
        async initVModel() {
            this.directive = this.value;

            // use last target options to init target for new directive
            // but if the directive data came from sharing, then we don't
            let lastTargetOption = await MdbRuntimeVariable.getVarValue('last_target_option', null);
            if ( this.directive.isNew && undefined === this.directive.target.type && null !== lastTargetOption) {
                lastTargetOption = JSON.parse(lastTargetOption);
                this.directive.target = lastTargetOption;
            }
            
            // if last target options is empty, then we use project defatul target.
            if ( Common.isEmpty(this.directive.target.type) ) {
                let project = await this.getCurProject();
                this.directive.target.type = project.defaultTargetType;
            }

            // or we use serialport as default target type.
            if ( Common.isEmpty(this.directive.target.type) ) {
                this.directive.target.type = this.$dict.value('DIRECTIVE_COMMUNICATION_TYPE','SERIALPORT');
            }

            this.target = Common.objCopy(this.directive.target);
        },

        /**
         * update v-model
         */
        updateVModel() {
            this.directive.target = Common.objCopy(this.target);
            this.$emit('input', this.directive);
            this.$emit('config-changed');
        },

        /**
         * event handler for target config changed.
         */
        actionTargetConfigChanged() {
            this.updateVModel();
            this.$forceUpdate();
        },

        /**
         * event handler for target type changed
         */
        actionTargetTypeChange() {
            this.updateVModel();
            this.$emit('target-type-change', this.targetEditors[this.target.type]);
            this.$forceUpdate();
        },

        /**
         * event handler for button send clicked.
         */
        async actionSendToggle() {
            // stop auto send if auto send started.
            if ( null !== this.autoSendRuntime ) {
                this.autoSendRuntime.downCounter = 0;
                return;
            }
            // execute once
            await MdbRuntimeVariable.setVarValue('last_target_option', JSON.stringify(this.target));
            await this.sendExecutor();
        },

        /**
         * event handler on send menu item clicked.
         * @param {Event} event
         */
        actionSendMenuClick( event ) {
            let handler = `handleSendMenuClick${event.key}`;
            this[handler]();
        },
        
        /**
         * force update the component
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },

        /**
         * send menu handler : auto send
         */
        async handleSendMenuClickAutoSend() {
            let autoSendVariable = await MdbRuntimeVariable.getVarValue('directive_auto_send', '{}');
            this.autoSendOptions = JSON.parse(autoSendVariable);
            MyObject.applyDefaultValues(this.autoSendOptions, {
                enableIntervalTimeFixed : true,
                intervalTime : 1000,
                intervalTimeMin : 1000,
                intervalTimeMax : 5000,
                enableExecuteAlways : true,
                executeCount : 10,
            });

            this.autoSendModalEnable = true;
        },

        /**
         * start auto send
         */
        async actionAutoSendStart() {
            let autoSendVariable = JSON.stringify(this.autoSendOptions);
            await MdbRuntimeVariable.setVarValue('directive_auto_send', autoSendVariable);
            this.autoSendModalEnable = false;

            this.autoSendRuntime = {};
            this.autoSendRuntime.execCount = 0;
            this.autoSendRuntime.downCounter = false;
            if ( !this.autoSendOptions.enableExecuteAlways ) {
                this.autoSendRuntime.downCounter = this.autoSendOptions.executeCount;
            }
            this.autoSendRuntime.delay = {
                fixed : true,
                value : this.autoSendOptions.intervalTime,
            };
            if ( !this.autoSendOptions.enableIntervalTimeFixed ) {
                this.autoSendRuntime.delay = {
                    fixed : false,
                    min : this.autoSendOptions.intervalTimeMin,
                    max : this.autoSendOptions.intervalTimeMax,
                };
            }

            this.executeAutoSend();
        },

        /**
         * execute auto send
         */
        async executeAutoSend() {
            if ( false !== this.autoSendRuntime.downCounter 
            && 0 >= this.autoSendRuntime.downCounter ) {
                this.autoSendRuntime = null;
                this.$emit('auto-send-finished');
                return ;
            }

            this.autoSendRuntime.execCount ++;
            if ( false !== this.autoSendRuntime.downCounter ) {
                this.autoSendRuntime.downCounter --;
            }
            let isSuccess = await this.sendExecutor();
            if ( !isSuccess ) {
                this.autoSendRuntime = null;
                this.$emit('auto-send-finished');
                return;
            }

            this.$forceUpdate();
            let delay = 0;
            if ( this.autoSendRuntime.delay.fixed ) {
                delay = this.autoSendRuntime.delay.value;
            } else {
                delay = MyNumber.random(this.autoSendRuntime.delay.min, this.autoSendRuntime.delay.max);
            }
            
            this.autoSendRuntime.timer = setTimeout(() => this.executeAutoSend(), delay);
        },

        /**
         * emit event `parameter-editor-enable-change`
         */
        actionParameterEditorEnableChange(enable){
            this.$emit('parameter-editor-enable-change', enable);
        }
    }
}
</script>
<style scoped>
.config-bar {background-color: #e9e9e9 !important;}
</style>