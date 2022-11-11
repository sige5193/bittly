<template>
  <div class="h-100">
    <!-- file selector -->
    <a-upload-dragger v-show="null === fileContent" ref="upload"
      :directory="false" 
      :multiple="false" 
      :showUploadList="false"
      :beforeUpload="() => false" 
      @change="actionFileChanged"
    >
      <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
      <p class="ant-upload-text">{{$t('directive.parameter.file.selectTip')}}</p>
    </a-upload-dragger>
        
    <a-row v-show="null !== fileContent" class="h-100 border rounded">
      <a-col :span="12" class="text-small bg-light h-100 overflow-x-auto">
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <!-- file path -->
          <a-form-item :label="$t('directive.parameter.file.filepath')" class="m-0">
            <a-upload :directory="false" :multiple="false" :showUploadList="false"
              :beforeUpload="() => false" @change="actionFileChanged"
            >
              <a-button size="small">
                <span v-if="!options.path">{{$t('directive.parameter.file.select')}}</span>
                <span class="selected-filepath" v-else>{{options.path}}</span>
              </a-button>
            </a-upload>
          </a-form-item>
          
          <!-- file size -->
          <a-form-item :label="$t('directive.parameter.file.filesize')" class="m-0">
            <span v-if="-1 != filesize">{{formatAsFilesize(filesize)}}</span>
          </a-form-item>
          
          <!-- send mode -->
          <a-form-item :label="$t('directive.parameter.file.sendMode')" class="m-0">
            <a-select size="small" style="min-width:100px;" v-model="options.sendMode" @change="actionSendModeChanged">
              <a-select-option key="All">{{$t('directive.parameter.file.sendModeAll')}}</a-select-option>
              <a-select-option key="Line">{{$t('directive.parameter.file.sendModeLine')}}</a-select-option>
              <a-select-option key="Bytes">{{$t('directive.parameter.file.sendModeBytes')}}</a-select-option>
            </a-select>
          </a-form-item>
          
          <!-- new line type -->
          <a-form-item v-if="'Line' == options.sendMode" :label="$t('directive.parameter.file.sendModeLineNewLineStyle')" class="m-0">
            <a-select size="small" style="min-width:100px;" v-model="options.newLineStyle" @change="actionUpdateVMode">
              <a-select-option key="CRLF">CRLF (\r\n)</a-select-option>
              <a-select-option key="CR">CR (\r)</a-select-option>
              <a-select-option key="LF">LF (\n)</a-select-option>
            </a-select>
          </a-form-item>

          <!-- byte count -->
          <a-form-item v-if="'Bytes' == options.sendMode" :label="$t('directive.parameter.file.sendModeBytesByteCount')" class="m-0">
            <a-input-number class="w-100" size="small" v-model="options.byteCount" @change="actionByteCountChanged" />
          </a-form-item>

          <!-- after all -->
          <a-form-item v-if="'All' != options.sendMode" :label="$t('directive.parameter.file.afterSendAll')" class="m-0">
            <a-select size="small" style="min-width:100px;" v-model="options.afterSendAll" @change="actionUpdateVMode">
              <a-select-option key="BackToHead">{{$t('directive.parameter.file.afterSendAllBackToHead')}}</a-select-option>
              <a-select-option key="NoticeEnd">{{$t('directive.parameter.file.afterSendAllNoticeEnd')}}</a-select-option>
            </a-select>
          </a-form-item>
          
          <!-- viewer mode -->
          <a-form-item :label="$t('directive.parameter.file.viewerMode')" class="m-0" v-if="'All' == options.sendMode">
            <a-radio-group v-model="options.viewerMode" @change="actionViewerModeChange" size="small">
              <a-radio-button value="hex">HEX</a-radio-button>
              <a-radio-button value="text">TEXT</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col :span="12" class="h-100 overflow-hidden">
        <!-- file error -->
        <template v-if="null != errorMessage">
          <a-result status="error" title="" :sub-title="errorMessage"></a-result>
        </template>
        <!-- file viewer -->
        <code-editor v-show="null == errorMessage && null !== fileContent" ref="viewer"
          v-model="viewerContent"
          mode="text"
          :readonly="true"
          :lineNumbers="true"
          @gutter-click="actionGutterClick"
        ></code-editor>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import CodeEditor from '../../../../components/CodeEditor.vue'
import Formatter from '../../../../utils/Formatter.js'
import MyObject from '../../../../utils/datatype/MyObject'
import Common from '../../../../utils/Common.js'
export default {
    name : 'DirectiveParameterFileEditor',
    components : {
        'code-editor' : CodeEditor,
    },
    props : {
        /**
         * @property {MdbDirective}
         */
        value:{}
    },
    data() {
        return {
            /**
             * @property {MdbDirective}
             */
            directive : null,
            /**
             * file options for parameter builder
             * @property {Object}
             */
            options : {},
            /**
             * @property {Number}
             */
            filesize : -1,
            /**
             * content of file
             * @property {Buffer|null}
             */
            fileContent : null,
            /**
             * content of file in readable mode
             * @property {String}
             */
            viewerContent : '',
            /**
             * callback handler on directive status updated
             * @property {Function}
             */
            directiveStatusUpdateHandler : null,
            /**
             * viewer status 
             * @property {Object}
             */
            viewerStatus : {},
            errorMessage : null,
            isInited : false,
        };
    },
    mounted() {
        this.initVModel();
    },
    beforeDestroy() {
        this.directive.off('status-update', this.directiveStatusUpdateHandler);
    },
    methods: {
        /**
         * init v-model
         */
        async initVModel() {
            this.isInited = false;
            this.directive = this.value;
            this.directiveStatusUpdateHandler = () => this.directiveStatusUpdated();
            this.directive.on('status-update', this.directiveStatusUpdateHandler);

            MyObject.applyDefaultValues(this.options, {
                path : '',
                sendMode : 'All',
                byteCount : 1,
                viewerMode : 'hex',
                newLineStyle : "CRLF",
                afterSendAll : 'NoticeEnd',
            });
            if ( undefined != this.directive.requestContent.file ) {
                this.options = MyObject.copy(this.directive.requestContent.file);
                await this.loadFileContent();
            }

            this.viewerStatus = {};
            this.isInited = true;
        },

        /**
         * update v-mode
         */
        updateVMode() {
            this.directive.statusSet('ParamFileCurLine', 1);
            this.$forceUpdate();
            if ( !this.isInited ) {
                return ;
            }

            this.directive.requestContent.file = MyObject.copy(this.options);
            this.directive.requestContent = MyObject.copy(this.directive.requestContent);
            this.$emit('input', this.directive);
        },

        /**
         * load file content by configured file path
         */
        async loadFileContent() {
            this.fileContent = Buffer.from('');
            this.filesize = 0;
            this.errorMessage = null;
            if ( '' == this.options.path ) {
                return;
            }
                
            try {
                window.fs.accessSync(this.options.path, window.fs.constants.R_OK);
            } catch ( e ) {
                this.errorMessage = this.$t('directive.parameter.file.filepathUnableToRead',[this.options.path]);
                return ;
            }

            let fileStats = fs.statSync(this.options.path);
            // we ignore big file for now, temporarily ~~~
            let fileSizeLimitaion = 1024 * 1024 * 2;
            if ( fileStats.size > fileSizeLimitaion ) {
                this.errorMessage = this.$t('directive.parameter.file.unableToLoadBigFile',[Formatter.asFileSize(fileSizeLimitaion)]);
                return ;
            }

            try {
                this.fileContent = window.fs.readFileSync(this.options.path);
                this.filesize = this.fileContent.length;
                await this.actionSendModeChanged();
            } catch (e) {
                console.error(e);
                this.errorMessage = this.$t('directive.parameter.file.readFailed',[this.options.path, e.message]);
            }
        },

        /**
         * update v-mode
         */
        actionUpdateVMode() {
            this.updateVMode();
        },

        /**
         * event handler on directive status updated.
         */
        directiveStatusUpdated() {
            if ( !this.isInited ) {
                return ;
            }
            this.viewerUpdateActiveLine();
        },

        /**
         * update viewer active line by directive status
         */
        viewerUpdateActiveLine() {
            let lineNo = this.directive.statusGet('ParamFileCurLine', 1);
            if ( this.viewerStatus.lineNo == lineNo ) {
                return ;
            }

            let lineIndex = lineNo - 1;
            let cm = this.$refs.viewer.$refs.editor.codemirror;
            if ( undefined != this.viewerStatus.lineNo ) {
                cm.removeLineClass(this.viewerStatus.lineNo - 1, 'background', 'directive-parameter-file-viewer-active-line');
            }
            cm.addLineClass(lineIndex, 'background', 'directive-parameter-file-viewer-active-line');
            if ( !(true == this.viewerStatus.isManualActiveLine) ) {
                cm.scrollIntoView(lineIndex, 100);
            }
            this.viewerStatus.lineNo = lineNo;
        },

        /**
         * event handler on file changed.
         * @param {Object} info
         */
        actionFileChanged( info ) {
            this.options.path = info.file.path;
            this.loadFileContent();
        },

        /**
         * format number as filesize
         * @param {Number} size
         */
        formatAsFilesize( size ) {
            return Formatter.asFileSize(size);
        },

        /**
         * event handler on viewer mode changed
         */
        actionViewerModeChange() {
            this.viewerContent = '';
            if ( 'hex' == this.options.viewerMode ) {
                this.viewerContent = Common.convertBufferToHexString(this.fileContent);
            } else if ( 'text' == this.options.viewerMode ) {
                this.viewerContent = this.fileContent.toString();
            }
            this.updateVMode();
        },

        /**
         * event handler on send mode changed
         */
        async actionSendModeChanged() {
            if ( 'Line' === this.options.sendMode ) {
                this.options.viewerMode = 'text';
                this.viewerContent = this.fileContent.toString();
            }
            if ( 'Bytes' === this.options.sendMode ) {
                this.options.viewerMode = 'hex';
                await this.actionByteCountChanged();
            }
            if ( 'All' === this.options.sendMode ) {
                this.actionViewerModeChange();
            }
            this.updateVMode();
        },

        /**
         * event handler on viewer gutter clicked
         */
        actionGutterClick(cm,line,gutter,clickEvent) {
            this.viewerStatus.isManualActiveLine = true;
            this.directive.statusSet('ParamFileCurLine', line+1);
            this.viewerStatus.isManualActiveLine = false;
        },

        /**
         * event handler on byte count changed
         */
        async actionByteCountChanged() {
            debugger
            let startTime = Date.now();
            let lastWaitTime = Date.now();
            let fileLoadingDone = null;
            
            let content = [];
            let curIndex = 0;
            while ( curIndex < this.fileContent.length ) {
                let line = [];
                for ( let i=0; i<this.options.byteCount; i++ ) {
                    if ( curIndex >= this.fileContent.length ) {
                        break;
                    }

                    let byte = this.fileContent[curIndex].toString(16);
                    byte = byte.padStart(2,0).toUpperCase();
                    line.push(byte);
                    curIndex ++;
                }
                line = line.join(' ');
                content.push(line);

                // if it takes too long, we need to display a notice.
                let now = Date.now();
                if ( null === fileLoadingDone && now - startTime >= 100 ) {
                    fileLoadingDone = this.$message.loading(this.$t('directive.parameter.file.fileIsParsing'), 0);
                }
                if ( now - lastWaitTime >= 100 ) {
                    await Common.msleep(10);
                    lastWaitTime = Date.now();
                }
            }

            this.viewerContent = content.join("\n");
            this.updateVMode();
            if ( null != fileLoadingDone ) {
                fileLoadingDone();
            }
        },
    },
}
</script>
<style> 
.directive-parameter-file-viewer-active-line { background: #78622e;}
</style>
<style scoped>
.selected-filepath {display: block;max-width: 300px;overflow: hidden;text-overflow: ellipsis;}
</style>