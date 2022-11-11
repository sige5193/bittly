<template>
  <div class="viewer">
    <!-- response status bar -->
    <a-row>
      <a-col :span="12" class="mt-3">
        <a-radio-group button-style="solid" v-model="responseFormat">
          <a-radio-button value="stream">{{$t('directive.response.stream.name')}}</a-radio-button>
          <a-radio-button value="text">{{$t('directive.response.text.name')}}</a-radio-button>
          <a-radio-button value="hex">{{$t('directive.response.hex.name')}}</a-radio-button>
          <a-radio-button value="form">{{$t('directive.response.form.name')}}</a-radio-button>
          <a-radio-button value="plotter">{{$t('directive.response.plotter.name')}}</a-radio-button>
        </a-radio-group>
      </a-col>
 
      <a-col :span="12" class="mt-3 text-right">
        <span class="mr-2">
          {{$t('directive.execute.labelResponseDataLength')}} : 
          {{formatAsFileSize(responseDataLength)}}
        </span>

        <span class="mr-2">
          {{$t('directive.response.preserveResponseData')}} : 
          <a-switch ref="switchPreserveMode" default-checked size="small" 
            style="vertical-align: super;" 
            v-model="isPreserveResponseData" 
            @change="actionIsPreserveResponseDataChange"
          />
        </span>
        
        <a-dropdown :trigger="['click']">
          <span class="cursor-pointer ml-1"><a-icon type="menu" /></span>
          <a-menu slot="overlay" @click="actionResponseMenuItemClick">
            <a-menu-item key="SaveAsFile">{{$t('directive.execute.labelResponseSaveAsFile')}}</a-menu-item>
            <a-menu-item key="SaveAsExcel">{{$t('directive.execute.labelResponseSaveAsExcelFile')}}</a-menu-item>
            <a-menu-item key="SaveAsTestcase">{{$t('directive.execute.labelResponseSaveAsTestcase')}}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-col>
    </a-row>
    
    <!-- Error Message -->
    <div v-if="null != errorMessage">
      <a-result status="error" :title="errorMessage"></a-result>
    </div>

    <!-- stream mode -->
    <viewer-stream v-else-if="'stream' == responseFormat" 
      ref="streamViewer"
      v-model="directive"
    />

    <!-- preserve response data list viewer -->
    <div v-else-if="isPreserveResponseData" class="mt-1 flex-grow h-0">
      <component
        ref="preserveViewer"
        v-model="directive"
        :is="`preserve-viewer-${responseFormat}`"
        :directive="directive"
        :response-list="preservedResponseData"
      ></component>
    </div>

    <!-- sigle response mode : Executing -->
    <div v-else-if="isExecuting" class="mt-1 flex-grow p-5 bg-light text-center">
      <div class="p-5"><a-spin size="large" /></div>
    </div>

    <!-- sigle response mode : NO Response -->
    <div v-else-if="null == responseData" class="mt-5">
      <div class="p-5">
        <a-empty>
          <span slot="description"> {{$t('directive.execute.labelNoResponse')}} </span>
        </a-empty>
      </div>
    </div>

    <!-- sigle response mode : viewer render -->
    <div v-else class="mt-1 flex-grow">
      <component
        ref="viewer"
        :is="`viewer-${responseFormat}`"
        :content="responseData"
        v-model="directive"
      ></component>
    </div>
  </div>
</template>
<script>
import Formatter from '../../../utils/Formatter.js'
import ViewerForm from './form/Viewer.vue'
import ViewerText from './text/Viewer.vue'
import ViewerHex from './hex/Viewer.vue'
import ViewerStream from './stream/Viewer.vue'
import PreserveViewerHex from './hex/PreserveViewer.vue'
import PreserveViewerText from './text/PreserveViewer.vue'
import PreserveViewerForm from './form/PreserveViewer.vue'
import PreserveViewerPlotter from './plotter/PreserveViewer.vue'
import ViewerPlotter from './plotter/Viewer.vue'
import MdbTestcase from '../../../models/MdbTestcase'
export default {
    components : {
        'viewer-stream' : ViewerStream,
        'viewer-form' : ViewerForm,
        'viewer-text' : ViewerText,
        'viewer-hex' : ViewerHex,
        'viewer-plotter' : ViewerPlotter,
        'preserve-viewer-hex' : PreserveViewerHex,
        'preserve-viewer-text' : PreserveViewerText,
        'preserve-viewer-form' : PreserveViewerForm,
        'preserve-viewer-plotter' : PreserveViewerPlotter,
    },
    props : {
        /**
         * @property {Boolean}
         */
        isExecuting : {},
        /**
         * directive response buffer
         * @property {Buffer|null}
         */
        responseData : {default:null},
        /**
         * @property {Error}
         */
        errorMessage : {},
        /**
         * @property {MdbDirective}
         */
        directive : {},
    },
    data() {
        return {
            /**
             * indicate preserve response data or data.
             * @property {Boolean}
             */
            isPreserveResponseData : false,
            /**
             * preserved response data list.
             * @property {Array}
             */
            preservedResponseData : [],
            /**
             * indicate if the last response finished
             * @property {Boolean}
             */
            isLastResponseFinished : false,
            /**
             * total size of response data
             * @property {Number}
             */
            responseDataLength : 0,
            /**
             * 
             */
            responseFormat : 'stream',
        };
    },
    watch : {
        responseData() {
            this.onResponseDataChange();
        }
    },
    mounted() {
        this.responseDataLength = 0;
        this.isPreserveResponseData = false;
        this.preservedResponseData = [];
    },
    methods : {
        /**
         * event handler for menu item clicked
         */
        actionResponseMenuItemClick( event ) {
            let handler = `actionResponseMenuItemClick${event.key}`;
            this[handler]();
        },

        /**
         * menu item handler to save response as file, and open folder 
         * after success. it would save all response data if preserve model
         * is enabled, or current response would be save if not.
         */
        async actionResponseMenuItemClickSaveAsFile(){
            let fileData = Buffer.alloc(0);
            if ( this.isPreserveResponseData || 'stream' == this.responseFormat ) {
                let itemList = [];
                for ( let i=0; i<this.preservedResponseData.length; i++ ) {
                    let responseData = this.preservedResponseData[i].data;
                    if ( null !== responseData ) {
                        itemList.push(responseData);
                    }
                }
                fileData = Buffer.concat(itemList);
            } else {
                if ( null != this.responseData ) {
                    fileData = Buffer.concat([fileData, this.responseData]);
                }
            }

            if ( 0 == fileData.length ) {
                this.$message.info(this.$t('directive.response.saveAsFileDataEmpty'));
                return ;
            }
            
            let name = `${this.directive.name}.bin`;
            let filepath = window.dialog.showSaveDialogSync({ defaultPath: name });
            if ( undefined == filepath ) {
                return;
            }

            await window.fs.promises.writeFile(filepath, fileData);
            this.$message.success(this.$t('messages.fileSaveSuccess'));
            
            let folder = window.path.dirname(filepath);
            window.remote.shell.openPath(folder);
        },

        /**
         * menu item handler to save response as excel file. 
         * if response viewer does not support excel exporting, it would 
         * display an notice message and nothing to do.
         */
        async actionResponseMenuItemClickSaveAsExcel() {
            if ( (this.isPreserveResponseData && 0 == this.preservedResponseData.length) 
            || (!this.isPreserveResponseData && null == this.responseData)
            || (!this.isPreserveResponseData && 0 == this.responseData.length) 
            || this.isExecuting 
            || null != this.errorMessage ) {
                this.$message.info(this.$t('directive.response.saveAsExcelDataEmpty'));
                return ;
            }
            
            if ( 'stream' == this.responseFormat ) {
                this.$message.info(this.$t('directive.response.saveAsExcelViewerNotSupport'));
                return ;
            }
            
            let viewer = this.$refs.viewer;
            if ( this.isPreserveResponseData ) {
                viewer = this.$refs.preserveViewer;
            }
            
            if ( undefined === viewer.exportAsExcel ) {
                this.$message.info(this.$t('directive.response.saveAsExcelViewerNotSupport'));
                return;
            }
            await viewer.exportAsExcel();
        },

        /**
         * menu item handler to save response as testcase.
         */
        actionResponseMenuItemClickSaveAsTestcase(){
            if ( this.isPreserveResponseData ) {
                this.$message.error(this.$t('directive.execute.resposneSaveAsTestcaseNotAvailableOnPreserveMode'));
                return ;
            }

            if ( -1 === ['form','hex', 'text'].indexOf(this.responseFormat) ) {
                this.$message.error(this.$t('directive.response.saveAsTestcaseViewerNotSupport'));
                return;
            }

            if ( null === this.responseData || 0 == this.responseData.length ) {
                this.$message.error(this.$t('directive.execute.responseNotExists'));
                return;
            }
            
            let testcase = new MdbTestcase();
            testcase.projectId = this.directive.projectId;
            testcase.directiveId = this.directive.id;
            testcase.title = this.$t('test.editModal.titleDefault',[
                this.directive.name, 
                (new Date()).getTime()
            ]);
            testcase.paramFormat = this.directive.requestFormat;
            testcase.params = {value:this.directive.requestContent[testcase.paramFormat]};
            testcase.expectFormat = this.responseFormat;
            testcase.expect = {};
            if ( 'form' == this.responseFormat ) {
                testcase.expect.value = ViewerForm.generateTestcaseExpectContentFromResponse(this.directive, this.responseData);
            } else if ( 'text' == this.responseFormat ) {
                testcase.expect.value = ViewerText.generateTestcaseExpectContentFromResponse(this.directive, this.responseData);
            } else {
                testcase.expect.value = ViewerHex.generateTestcaseExpectContentFromResponse(this.directive, this.responseData);
            }
            testcase.save();
            this.$message.success(this.$t('directive.execute.resposneSaveAsTestcaseSuccess'));
        },

        /**
         * event handler on is preserve response data indicator changed.
         */
        actionIsPreserveResponseDataChange() {
            this.preservedResponseData = [];
            this.responseDataLength = 0;
        },

        /**
         * start a new response, so that we are able to known if the last 
         * response has finished, and create a new response item to hold
         * response data.
         */
        startNewResponse() {
            if ( !this.isPreserveResponseData ) {
                return ;
            }
            this.isLastResponseFinished = true;
        },

        /**
         * event handler on response data changed
         */
        onResponseDataChange() {
            if ( null === this.responseData ) {
                return ;
            }

            if ( !this.isPreserveResponseData && 'stream' != this.responseFormat ) {
                this.responseDataLength = this.responseData.length;
                return ;
            }

            this.responseDataLength += this.responseData.length;

            if ( !this.isLastResponseFinished && 0 < this.preservedResponseData.length ) {
                let lastResponse = this.preservedResponseData.at(-1);
                lastResponse.data = this.responseData;
                this.$set(this.preservedResponseData, this.preservedResponseData.length-1, lastResponse);
                return ;
            }

            this.isLastResponseFinished = false;
            let newResponse = {
                key : `e_${this.preservedResponseData.length}`,
                time : new Date(),
                data : this.responseData,
            };
            this.preservedResponseData.push(newResponse);
        },

        /**
         * refresh response data to viewer
         * @param {Buffer} data
         */
        newResponseData( data ) {
            if ( 'stream' == this.responseFormat ) {
                this.$refs.streamViewer.newResponseData(data);
            }
        },

        /**
         * refresh response data to viewer
         * @param {Buffer} data
         */
        newRequestData(data) {
            if ( 'stream' == this.responseFormat ) {
                this.$refs.streamViewer.newRequestData(data);
            }
        },

        /**
         * format number as file size
         */
        formatAsFileSize( size ) {
            return Formatter.asFileSize(size);
        }
    },
}
</script>
<style scoped>
.viewer {flex:2;overflow: hidden;display: flex;flex-direction: column;}
</style>