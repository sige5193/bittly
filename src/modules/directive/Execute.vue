<template>
  <div class="execute" 
    @mousemove="actionExecutorMouseMove" 
    @mouseup="actionExecutorMouseUp"
    @mouseleave="actionExecutorLeave"
  >
    <a-row>
      <a-col :span="18">
        <h4 v-if="!enableNameQuickEdit">
          <span>{{directive.name}} </span>
          <a-button @click="enableNameQuickEdit = true" icon="edit" size="small" ref="btnNameQuickEdit"></a-button>
          <a-tag class="ml-3" @click="actionConfigShow">
            <span v-if="'big-endian' == directive.endianness">{{$t('directive.endiannessBigEndian')}}</span>
            <span v-else>{{$t('directive.endiannessLittleEndian')}}</span>
          </a-tag>
        </h4>
        <div v-else>
          <a-input class="w-100" ref="inputQuickName"
            v-if="enableNameQuickEdit" 
            v-model="directive.name"  
            @pressEnter="actionNameQuickEditDone"
            @blur="actionNameQuickEditDone"
          />
        </div>
      </a-col>
      
      <a-col :span="6" class="text-right p-2">
        <a-dropdown placement="bottomRight" :trigger="['click']">
          <a-button ref="btnExtAction" icon="ellipsis" size="small"></a-button>
          <a-menu ref="menuBtnExtAction" slot="overlay" @click="actionDirectiveMoreMenuItemClicked">
            <a-menu-item key="directiveExtActionShare"><a-icon type="share-alt" /> {{$t('directive.share.button')}}</a-menu-item>
          </a-menu>
        </a-dropdown>
        
        <status-editor :directive="directive"/>
        <a-button ref="btnOpenConfigModal" size="small" class="ml-1" @click="actionConfigShow">{{$t('directive.execute.btnConfig')}}</a-button>
        <a-button ref="btnOpenScriptModal" size="small" class="ml-1" @click="actionScriptShow">{{$t('directive.execute.btnScript')}}</a-button>
        <a-button ref="btnSave"
          size="small" 
          class="ml-1"
          v-shortkey="['ctrl', 's']"
          @shortkey="actionSave"
          @click="actionSave"
        >{{$t('button.save')}}</a-button>
      </a-col>
      
      <a-col :span="24" class="border-bottom pb-1">
        <!-- target editor  -->
        <target-editor ref="targetEditor"
          v-model="directive"
          :send-executor="actionSend"
          @target-type-change="actionTargetTypeChange"
          @parameter-editor-enable-change="actionTargetSetParameterEditorStatus"
        ></target-editor>
      </a-col>
    </a-row>

    <!-- parameter eidotr -->
    <parameter-editor
      ref="parameterEditor"
      :height="parameterEditorHeight"
      :enable="parameterEditorEnable"
      :directive="directive"
      :formDefaultDataType="paramDefaultDataType"
      :executor="executor"
      @directive-request-format-change="actionParameterFormatChange"
    ></parameter-editor>

    <div @mousedown="actionSeperatorBarMoveStart" class="seperator-bar"></div>

    <!-- response viewer -->
    <response-viewer 
      ref="responseViewer"
      :directive="directive"
      :isExecuting="isExecuting"
      :errorMessage="errorMessage"
      :responseData="responseData"
    ></response-viewer>

    <config-editor ref="modalConfig"></config-editor>
    <script-editor ref="modalScript"></script-editor>
    <folder-select ref="dialogFolderSelect"></folder-select>
    <ext-action-share ref="directiveExtActionShare" :directive="directive" :response="responseData"></ext-action-share>
  </div>
</template>
<script>
import { Buffer } from 'buffer';
import ParameterEditor from './parameters/Editor.vue'
import ResponseViewer from './response/Viewer.vue'
import EntryFolderSelect from './entry/FolderSelect.vue'
import ScriptEditor from './script/Editor.vue'
import ConfigEditor from './Config.vue'
import TargetEditor from './communicators/TargetEditor.vue'
import Executor from './Executor.js'
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry.js';
import MdbDirective from '../../models/MdbDirective.js'
import MdbProject from '../../models/MdbProject.js';
import ExtActionShare from './Share.vue'
import StatusEditor from './Status.vue'
export default {
    name : 'PanelDirective',
    components : {
        'parameter-editor' : ParameterEditor,
        'response-viewer' : ResponseViewer,
        'script-editor' : ScriptEditor,
        'config-editor' : ConfigEditor,
        'target-editor' : TargetEditor,
        'folder-select' : EntryFolderSelect,
        'ext-action-share' : ExtActionShare,
        'status-editor' : StatusEditor,
    },
    props : {
        /**
         * instance of directive model and change mark
         * @property {Object}
         * - `model` : {MdbDirective}
         * - `hasChanged` : {Boolean}
         */
        value : {},
    },
    data() {
        return {
            /**
             * enable parameter editor or not
             * @property {Boolean}
             */
            parameterEditorEnable : true,
            /**
             * enable name quick edit.
             * @property {Boolean}
             */
            enableNameQuickEdit : false,
            /**
             * indicate if directive is executing
             * @property {Boolean}
             */
            isExecuting : false,
            /**
             * response data after directive executed.
             * @property {Buffer|null}
             */
            responseData : null,
            /**
             * error message if directive execute failed.
             * @property {Error}
             */
            errorMessage : null,
            /**
             * executor of directive, each time user execute directive, a new
             * executor will be generated.
             * @property {Executor}
             */
            executor : null,
            /**
             * response view type name
             * @property {String}
             */
            responseFormat : 'hex',
            /**
             * param default data type of form editor
             * @property {string}
             */
            paramDefaultDataType : 'byte',
            /**
             * indicate if directive has been changed
             * @property {Boolean}
             */
            hasChanged : false,
            /**
             * instance of directive model.
             * @property {MdbDirective}
             */
            directive : null,
            /**
             * indicate if seperator bar moving
             * @property {Boolean}
             */
            isSeperatorBarMoving : false,
            /**
             * height of parameter in `px`
             * @property {Number}
             */
            parameterEditorHeight : null,
        };
    },
    watch : {
        /**
         * hasChanged watcher to update mode
         */
        hasChanged() {
            this.updateVModel();
        },
    },
    /**
     * init v-model after mounted
     */
    async created() {
        await this.initVModel();
    },
    /**
     * @link https://github.com/sige5193/bittly/issues/9
     */
    beforeDestroy() {
        if ( null !== this.executor ) {
            this.executor.onData(null);
        }
    },
    methods : {
        /**
         * init v-model
         */
        async initVModel() {
            this.hasChanged = this.value.hasChanged;
            if ( null == this.value.model ) {
                this.directive = new MdbDirective();
                this.directive.name = this.$t('directive.nameDefault');
                let projectId = this.$store.getters.projectActivedId;
                let project = await MdbProject.findOne(projectId);
                this.directive.endianness = project.endianness;
                this.directive.projectId = project.id;
            } else {
                this.directive = this.value.model;
                this.directive.statusClear();
            }

            this.directive.on('change', () => this.hasChanged = true );
        },

        /**
         * update v-model
         */
        updateVModel() {
            let value = this.value;
            value.hasChanged = this.hasChanged;
            value.model = this.directive;
            this.$emit('input', value);
        },

        /**
         * event handler for target type changed.
         * @param {Object} targetConfig
         */
        actionTargetTypeChange ( targetConfig ) {
            this.paramDefaultDataType = targetConfig.defaultDataType;
            this.responseFormat = targetConfig.defaultResponseViewer;
            this.parameterEditorEnable = true;
            if ( 'none' === this.directive.requestFormat ) {
                this.directive.requestFormat =  'form';
            }
        },

        /**
         * event handler on parameter foramt changed
         */
        actionParameterFormatChange() {
            this.executor = null;
            this.errorMessage = null;
            this.responseData = null;
        },

        /**
         * event handler on parameter editor status change
         */
        actionTargetSetParameterEditorStatus( enable ) {
            this.parameterEditorEnable = enable;
            let formatName =  enable ? 'form' : 'none';
            if ( formatName != this.directive.requestFormat ) {
                this.directive.requestFormat = formatName;
                this.updateVModel();
            }
        },

        /**
         * close name quick edit
         */
        actionNameQuickEditDone() {
            this.enableNameQuickEdit = false;
        },

        /**
         * save directive
         */
        async actionSave() {
            await this.save();
        },

        /**
         * save directive model
         * @public
         */
        async save() {
            let isNew = this.directive.isNew;
            let folderEntryId = null;
            if ( isNew ) {
                try {
                    folderEntryId = await this.$refs.dialogFolderSelect.select();
                } catch {
                    folderEntryId = null; 
                }
                if ( null === folderEntryId ) {
                    return false;
                }
            }

            await this.directive.save();
            let newEntry = null;
            if ( isNew ) {
                newEntry = new MdbDirectiveEntry();
                newEntry.type = 'directive';
                newEntry.target = this.directive.id;
                newEntry.parentId = folderEntryId;
                newEntry.projectId = this.directive.projectId;
                await newEntry.save();
            }

            this.hasChanged = false;
            this.updateVModel();
            this.$emit('directive-saved', isNew, this.directive, newEntry);
            return true;
        },

        /**
         * execute current directive
         * @returns {Promise<Boolean>}
         */
        async actionSend() {
            this.responseData = null;
            this.errorMessage = null;
            this.isExecuting = true;
            this.$refs.responseViewer.startNewResponse()

            let executor = new Executor(this.directive);
            executor.onData(( data ) => this.handleExecutorEventOnData(data));
            
            let isSuccess = true;
            try {
                await executor.execute();
                this.executor = executor;
                this.$refs.responseViewer.newRequestData(executor.getRequestBuffer());
            } catch ( e ) {
                this.responseData = null;
                this.errorMessage = ('string' == typeof(e)) ? e : e.message;
                isSuccess = false;
            }
            this.isExecuting = false;
            return isSuccess;
        },

        /**
         * event handler for executor get response data.
         * @param {Buffer} data
         */
        handleExecutorEventOnData( data ) {
            this.$refs.responseViewer.newResponseData(data);
            if ( null == this.responseData ) {
                this.responseData = Buffer.from(data);
            } else {
                this.responseData = Buffer.concat([this.responseData, Buffer.from(data)]);
            }
        },

        /**
         * handle directive extension action
         * @param {Event} event
         */
        actionDirectiveMoreMenuItemClicked( event ) {
            this.$refs[event.key].execute();
        },

        /**
         * open config editor for more configurations.
         */
        actionConfigShow() {
            this.$refs.modalConfig.open(this.directive)
            .then(() => this.$forceUpdate())
            .catch(() => {});
        },

        /**
         * open script editor to edit request script
         */
        actionScriptShow() {
            this.$refs.modalScript.open(this.directive)
            .then(() => this.$forceUpdate())
            .catch(() => {});
        },

        /**
         * event handler on mouse move inside this executor.
         */
        actionExecutorMouseMove( event ) {
            if ( this.isSeperatorBarMoving ) {
                let clientY = event.clientY;
                let editorRect = this.$refs.parameterEditor.$el.getBoundingClientRect();
                this.parameterEditorHeight = Math.round(clientY - editorRect.top);
                if ( 0 > this.parameterEditorHeight ) {
                    this.parameterEditorHeight = 0;
                }
            }
        },

        /**
         * event handelr on mouse up inside this executor
         */
        actionExecutorMouseUp() {
            if ( this.isSeperatorBarMoving ) {
                this.isSeperatorBarMoving = false;
                this.$eventBus.$emit('directive-executor-resized');
            }
        },

        /**
         * event handler on mouse leave inside this executor
         */
        actionExecutorLeave() {
            if ( this.isSeperatorBarMoving ) {
                this.isSeperatorBarMoving = false;
                this.$eventBus.$emit('directive-executor-resized');
            }
        },

        /**
         * start to move parameter and response seperator bar.
         */
        actionSeperatorBarMoveStart() {
            this.isSeperatorBarMoving = true;
        },
    },
}
</script>
<style scoped>
.execute {display: flex;flex-direction: column;height: 100%;}
.seperator-bar {border-bottom: dashed 3px #e7e7e7;cursor: s-resize;height: 3px;}
</style>