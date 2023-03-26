<template>
  <a-spin :spinning="'processing' == resultStatus">
    <div class="border mt-1 bg-light p-1">
      <!-- title -->
      <div class="p-2" @click="actionToggleBodyVisiable">
        <a-icon :type="'none'==displayBody ? 'right' : 'down'" /> &nbsp;
        {{testcase.title}} &nbsp;&nbsp;
        <a-badge v-if="null != resultStatus" :status="resultStatus" />
      </div>

      <div :style="{display:displayBody}"> 
        <a-row>
          <!-- request parameters -->
          <a-col :span="8" class="p-3">
            <div>
              <strong>{{ $t('test.requestParams') }}</strong>
              <small class="pl-1">({{$dict.name('DIRECTIVE_PARAM_FORMAT',testcase.paramFormat)}})</small>
            </div>
            <div class="mt-1">
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FORM',testcase.paramFormat)">
                <div v-for="(param, pindex) in testcase.params.value" :key="pindex" class="mb-1">
                  <span v-if="0 < param.name.trim().length">{{param.name}}</span>
                  <span v-else>${{pindex}}</span>
                  <small class="ml-1">[{{$t(`directive.parameter.form.dataType.${param.type}`)}}]</small> : 
                  <a-tag>{{param.prefix}}{{param.value}}</a-tag>
                </div>
              </template>
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','HEX',testcase.paramFormat)">
                <div class="pre word-break-all">{{testcase.params.value}}</div>
              </template>
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT',testcase.paramFormat)">
                <div class="pre word-break-all">{{testcase.params.value}}</div>
              </template>
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FILE',testcase.paramFormat)">
                <div class="pre word-break-all"><a-icon type="file" /> 
                  {{testcase.params.value ? testcase.params.value.path : ''}}
                </div>
              </template>
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','NONE',testcase.paramFormat)">
                <a-empty :description="$t('directive.parameter.none.notRequired')" />
              </template>
            </div>
          </a-col>
        
          <!-- expect response content -->
          <a-col :span="8" class="p-3">
            <div>
              <strong>{{ $t('test.expectResponseContent') }}</strong>
              <small class="pl-1">({{$dict.name('DIRECTIVE_PARAM_FORMAT',testcase.expectFormat)}})</small>
            </div>
            <div class="mt-1">
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FORM',testcase.expectFormat)">
                <div v-for="(param, eindex) in testcase.expect.value" :key="eindex" class="mb-1">
                  <span v-if="0 < param.name.trim().length">{{param.name}}</span>
                  <span v-else>${{eindex}}</span> 
                  <small class="ml-1">[{{$t(`directive.parameter.form.dataType.${param.type}`)}}]</small> : 
                  <a-tag>
                    {{$t(`test.editModal.comparator${param.comparator}`)}}
                    <span v-if="matchDataType(param.value,'string')">{{param.prefix}}</span>{{param.value}}
                  </a-tag>
                </div>
              </template>
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','HEX',testcase.expectFormat)">
                <div class="pre word-break-all">{{testcase.expect.value}}</div>
              </template>
              <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT',testcase.expectFormat)">
                <div class="pre word-break-all">{{testcase.expect.value}}</div>
              </template>
            </div>
          </a-col>
        
          <!-- actual response content -->
          <a-col :span="8" class="p-3">
            <div><strong>{{ $t('test.actualResponseContent') }}</strong></div>
            <div class="mt-1">
              <template v-if="null == result">
                <a-empty class="mt-2" :description="false" />
              </template>
              <template v-else>
                <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT',testcase.expectFormat)">
                  <div class="pre word-break-all">{{result}}</div>
                </template>
                <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','HEX',testcase.expectFormat)">
                  <div class="pre word-break-all">{{result}}</div>
                </template>
                <template v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FORM',testcase.expectFormat)">
                  <div v-for="(param, aindex) in testcase.expect.value" :key="aindex" class="mb-1">
                    <span v-if="0 < param.name.trim().length">{{param.name}}</span>
                    <span v-else>${{aindex}}</span>
                    <small class="ml-1">[{{$t(`directive.parameter.form.dataType.${param.type}`)}}]</small> : 
                    <a-tag :color="resultFormItemMatches[aindex] ? '' : 'red'">
                      {{param.prefix}}{{result.getValueByIndex(aindex)}}
                      {{$t(`test.editModal.comparator${param.comparator}`)}}
                      <span v-if="matchDataType(param.value,'string')">{{param.prefix}}</span>{{param.value}}
                    </a-tag>
                  </div>
                </template>
              </template>
            </div>
          </a-col>
        </a-row>
      
        <!-- toolbar -->
        <div>
          <a-row>
            <a-col :span="12">
              <a-input :addon-before="$t('test.timeout')" disabled
                :value="testcase.timeout" style="width:150px;"
              />
            </a-col>
            <a-col :span="12" class="text-right">
              <a-popconfirm 
                :title="$t('test.testcaseDeleteConfirm')"
                :ok-text="$t('button.yes')"
                :cancel-text="$t('button.no')"
                @confirm="actionDelete"
              ><a-button type="danger" class="mr-1"><a-icon type="delete" /></a-button></a-popconfirm>
              <a-button @click="actionEdit" class="mr-1"><a-icon type="edit" /></a-button>
              <a-button ref="btnExecute" type="primary" class="mr-1" @click="actionExecute"><a-icon type="play-circle" /></a-button>
              <a-button type="primary" @click="actionExecuteRepeatedly"><a-icon type="sync" /></a-button>
            </a-col>
          </a-row>
        </div>
        <modal-testcase-edit ref="modalTestcaseEdit" />
        <modal-execute-repeatedly ref="modalExecuteRepeatedly"/>
      </div>
    </div>
  </a-spin>
</template>
<script>
import DataComparator from '../DataComparator.js'
import DirectiveScriptExecutor from '../../directive/script/Executor.js'
import Common from '../../../utils/Common.js'
import DirectiveExecutor from '../../directive/Executor.js'
import TestcaseLibBittly from './TestcaseLibBittly.js'
import ModalTestcaseEdit from './ModalTestcaseEdit.vue'
import ExecuteRepeatedly from './ExecuteRepeatedly.vue'
export default {
    name : 'TestcaseBlock',
    components : {
        'modal-testcase-edit' : ModalTestcaseEdit,
        'modal-execute-repeatedly' : ExecuteRepeatedly,
    },
    props : {
        /**
         * directive instance that testcase belongs to.
         * @property {MdbDirective}
         */
        directive : Object,
        /**
         * the testcase to execute
         * @property {MdbTestcase}
         */
        testcase : Object,
        /**
         * index of testcase in list
         * @property {Number}
         */
        index : Number,
    },
    data() {
        return {
            displayBody : 'none',
            resultStatus : null,
            result : null,
            resultFormItemMatches : [],
        };
    },
    methods : {
        /**
         * @param {any} value
         * @param {String} typeName 
         */
        matchDataType( value, typeName ) {
            return typeName === typeof(value);
        },

        /**
         * expand the body
         */
        expand() {
            this.displayBody = 'block';
        },

        /**
         * toggle the visiable of testcase detail info
         */
        actionToggleBodyVisiable() {
            this.displayBody = ( 'none' == this.displayBody ) ? 'block' : 'none';
        },

        /**
         * delete this testcase
         */
        async actionDelete() {
            await this.testcase.delete();
            this.$emit('testcase-delete', this.index);
        },

        /**
         * edit current testcase
         */
        async actionEdit() {
            try {
                await this.$refs.modalTestcaseEdit.open(this.directive, this.testcase);
            } catch { return; }
            this.resultStatus = null;
            this.$forceUpdate();
        },

        /**
         * event handler of button execut 
         */
        async actionExecute() {
            await this.execute();
        },
        
        /**
         * execute testcase repeatedly
         */
        actionExecuteRepeatedly() {
            this.$refs.modalExecuteRepeatedly.open(this.testcase);
        },

        /**
         * execute this testcase
         */
        async execute( throwError=false ) {
            console.log('[module test] exec testcase ', this.testcase.title);
            this.resultStatus = 'processing';
            this.result = null;

            let isBeforeScriptSuccessed = await this.executeScript(this.testcase.beforeScript,'before');
            if ( !isBeforeScriptSuccessed ) {
                this.resultStatus = 'error';
                return false;
            }
            
            try {
                let executor = new DirectiveExecutor(this.directive);
                executor.setCustomParams(this.testcase.paramFormat, this.testcase.params.value);
                await executor.execute();
                await Common.msleep(this.testcase.timeout);

                let comparator = new DataComparator();
                comparator.type = this.testcase.expectFormat;
                comparator.executor = executor;
                comparator.expectData = this.testcase.expect.value;
                let isSuccess = comparator.compare();
                
                await this.executeScript(this.testcase.afterScript, 'after');
                this.resultFormItemMatches = comparator.matchResult;
                this.resultStatus = isSuccess ? 'success' : 'error';
                
                this.result = comparator.actualData;
                if ( 'hex' == this.testcase.expectFormat ) {
                    this.result = Common.convertBufferToHexString(this.result);
                }

                await this.$store.dispatch('closeAllCommunicators');
                return isSuccess;
            } catch ( e ) {
                console.log('testcase execute directive failed',e);
                this.resultStatus = 'error';
                await this.$store.dispatch('closeAllCommunicators');
                
                if ( throwError ) {
                    throw e;
                } else {
                    this.$message.error(this.$t('test.unit.executeFailed',[e.message]));
                    return false;
                }
            }
        },

        /**
         * execute script string
         * @param {String} scriptContent
         * @param {String} type
         * @returns 
         */
        async executeScript( scriptContent, type ) {
            if ( 0 == scriptContent.length ) {
                return true;
            }

            let $this = this;
            let projectObj = DirectiveScriptExecutor.getProjectScriptObjectOfCurrentProject();
            let bittly = new TestcaseLibBittly({
                projectId : this.$store.getters.projectActivedId,
            });

            try {
                let scriptTemplate = `
                    return new Promise(async function(resolve, reject){
                        try {
                            /** start **/
                            ${scriptContent}
                            /** end **/
                            resolve()
                        } catch ( e ) {
                            reject( e );
                        }
                    });
                `;

                let func = new Function('bittly','project','$this', scriptTemplate);
                await func(bittly, projectObj, $this);
                return true;
            } catch ( e ) {
                this.showException(e, type);
                return false;
            }
        },

        /**
         * display expection message
         */
        showException( exception, type ) {
            console.log(exception);
            let message = 'string' === typeof(exception) ? exception : exception.message;
            let content = this.$t(`test.${type}ScriptExecuteFailed`,[message]);
            this.$error({title: this.$t('messages.dialogTitle.error'), content: content});
        },

        /**
         * get executing status of this testcase
         */
        getResultStatus() {
            return this.resultStatus;
        },

        /**
         * get this testcase
         */
        getTestcase() {
            return this.testcase;
        },

        /**
         * get result of testcase executing
         */
        getResult() {
            return this.result;
        },
    }
}
</script>
<style scoped>
.testcase-body {display: none;}
</style>