import DirectiveExecutor from '../../directive/Executor.js'
import MdbDirective from '../../../models/MdbDirective.js'
import { Buffer } from 'buffer';
import ResponseFormParser from '../../../modules/directive/response/form/ResponseParser.js';
import Common from '../../../utils/Common.js';
import WidgetActionScriptBittly from './WidgetActionScriptBittly.js'
import Executor from '../../directive/script/Executor.js';
export default {
    props : {
        /**
         * instance of panel model
         * @property {MdbPanel}
         */
        panel : Object,
        /**
         * widget configurations
         * @property {Object}
         */
        widget : {
            type : Object,
            required : true,
        }, 
        /**
         * instance fo runtime
         * @property {Object}
         */
        runtime : {
            type : Object,
            required : true,
        },
        /**
         * id of current project, if this prop is null, the project id 
         * would be get from store.
         * @property {Number}
         */
        projectId : {
            type : Number,
            default : null,
        }
    },
    /**
     * @returns 
     */
    data () {
        return {
            /**
             * indicate if widget is executing binded action.
             * @property {Boolean}
             */
            isExecuting : false,
            /**
             * instance of directive for directive action.
             * it would hold the directive until the widget destoried.
             * @property {MdbDirective|null}
             */
            directive : null,
            /**
             * directive response data
             * @property {Buufer|null}
             */
            directiveResponseContent : null,
            /**
             * the directives that been used inside directives. this
             * value would be update by script lib.
             * @property {Array<String : MdbDirective>}
             */
            scriptDirectives : {},
        };
    },
    created() {
        this.initWidget();
    },
    methods : {
        /**
         * init widget
         * @overide
         */
        initWidget() {
            // implement it in widget
        },

        /**
         * execute the action binded to this widget.
         * this method be user directly as an event handler for components.
         * @returns {Promise<Boolean>}
         */
        async actionExecute() {
            this.isExecuting = true;
            let isSuccess = true;
            switch ( this.widget.action ) {
            case 'directive' :
                try {
                    await this.doExecuteDirective();
                } catch ( e ) {
                    isSuccess = false;
                    this.showException(e);
                }
                break;
            case 'variable' :
                this.runtime.setVariableValue(this.widget.targetVariable,this.valueGet());
                break;
            case 'script' :
                isSuccess = await this.actionExecuteScript();
                break;
            default :
                this.$error({
                    title: this.$t('messages.dialogTitle.error'), 
                    content: this.$t('panel.runMode.widgetHasNoAction')
                });
                isSuccess = false;
                break;
            }
            this.isExecuting = false;
            return isSuccess;
        },

        /**
         * execute the directive binded to this widget
         */
         async doExecuteDirective() {
            let directiveId = this.widget.directiveId;
            if ( undefined === directiveId ) {
                throw Error(this.$t('panel.runMode.widgetHasNoDirective'));
            }
            
            // load directive only once to keep directive status.
            if ( null === this.directive ) {
                this.directive = await MdbDirective.findOne(directiveId);
            }
            
            if ( null === this.directive ) {
                throw Error(this.$t('panel.runMode.widgetHasUnavailableDirective'));
            }
            
            let requestLog = {};
            requestLog.directive = this.directive.getData();
            requestLog.time = new Date();
            requestLog.responseData = null;
            requestLog.status = 'send';
            requestLog.widget = Common.objCopy(this.widget);

            this.directiveResponseContent = null;
            let executor = new DirectiveExecutor(this.directive);
            let requestParams = this.getDirectiveParamsFromThisWidget();
            executor.setCustomParams(this.widget.directiveParamFormat, requestParams);
            let $this = this;
            executor.onData(function( data ) {
                $this.handleDirectiveExecuteResponse(data, requestLog);
            });
            requestLog.executor = executor;
            let expection = null;
            try {
                await executor.execute();
                requestLog.requestData = executor.getRequestBuffer();
            } catch ( e ) {
                expection = e;
                requestLog.status = 'error';
                requestLog.error = e;
            }
            this.runtime.requestLogPush(requestLog);
            if ( null != expection ) {
                throw expection;
            }
        },

        /**
         * get request parameters from this widget
         * 
         * `this.widget.directiveParams` example in `form` mode :
         * ```
         * [
         *   {"name":"F01","type":"byte","value":"22222","format":"hex","prefix":"0x"},
         *   {"name":"F02","type":"byte","value":"2222dddd","format":"hex","prefix":"0x"}
         * ]
         * ```
         * @returns {String|Array}
         */
        getDirectiveParamsFromThisWidget() {
            if ( 'form' == this.widget.directiveParamFormat ) {
                let params = Common.objCopy(this.widget.directiveParams);
                for ( let i=0; i<params.length; i++ ) {
                    params[i].value = this.applyParamValuesToContent(params[i].value);
                }
                return params;
            } else {
                return this.applyParamValuesToContent(this.widget.directiveParams);
            }
        },

        /**
         * apply runtime variable and widget value to content
         * @param {String} content 
         */
        applyParamValuesToContent( content ) {
            let newContent = content;
            let widgetValue = this.valueGet();
            if ( undefined != widgetValue && 'string' == typeof(newContent) ) {
                newContent = newContent.replaceAll('{{value}}', widgetValue)
            }
            
            let regex = /\{\{panel\.(?<variable>.*?)\}\}/gm;
            let match = null;
            while ((match = regex.exec(content)) !== null) {
                let varName = match.groups.variable;
                let runtimeValue = this.runtime.getVariableValue(varName);
                if ( undefined == runtimeValue ) {
                    throw Error(this.$t('panel.runMode.runtimeVariableNotExists',[varName]));
                }
                newContent = newContent.replaceAll(match[0], runtimeValue);
            }
            return newContent;
        },

        /**
         * handle directive response
         * @param {*} data 
         */
        handleDirectiveExecuteResponse( data, requestLog ) {
            if ( null === this.directiveResponseContent ) {
                this.directiveResponseContent = Buffer.from(data);
            } else {
                this.directiveResponseContent = Buffer.concat([this.directiveResponseContent, Buffer.from(data)]);
            }
            requestLog.status = 'success';
            requestLog.responseData = Buffer.from(this.directiveResponseContent);
            
            switch ( this.widget.directiveResponseParser ) {
            case 'form' : this.handleDirectiveResponseVariableBindingByForm(); break;
            case 'json' : this.handleDirectiveResponseVariableBindingByJson(); break;
            case 'raw'  : this.handleDirectiveResponseVariableBindingByRaw(); break;
            }
        },

        /**
         * parse response to form and bind to variables.
         * 
         * `widget.directiveResponseMap` example :
         * ```
         * [
         *     {"name":"F01","variable":null},
         *     {"name":"F02","variable":null},
         *     {"name":"F03","variable":"VariableName"}
         * ]
         * ```
         */
        handleDirectiveResponseVariableBindingByForm () {
            let response = new ResponseFormParser(this.directive, this.directiveResponseContent);
            for ( let i=0; i<this.widget.directiveResponseMap.length; i++ ) {
                let map = this.widget.directiveResponseMap[i];
                if ( undefined == map.variable || null == map.variable ) {
                    continue;
                }
                this.runtime.setVariableValue(map.variable, response.getReadableValueByIndex(i));
            }
        },

        /**
         * set response to variable directly
         */
        handleDirectiveResponseVariableBindingByRaw() {
            this.runtime.setVariableValue(
                this.widget.directiveResponseVariable, this.directiveResponseContent
            );
        },

        /**
         * parse response to json and bing to variable
         */
        handleDirectiveResponseVariableBindingByJson() {
            let content = this.directiveResponseContent.toString();
            try {
                content = JSON.parse(content);
            } catch { return ; }

            for ( let i=0; i<this.widget.directiveResponseJsonMap.length; i++ ) {
                let map = this.widget.directiveResponseJsonMap[i];
                let exprs = map.expression.split('.');
                let contentHolder = content;
                let isMatched = true;
                while ( 0 != exprs.length ) {
                    let expr = exprs.shift();
                    if ( undefined === contentHolder || undefined === contentHolder[expr] ) {
                        isMatched = false;
                        break;
                    }
                    contentHolder = contentHolder[expr];
                }
                if ( isMatched ) {
                    this.runtime.setVariableValue(map.variable, contentHolder);
                }
            }
        },

        /**
         * execute script
         * @returns {Promise<Boolean>}
         */
         async actionExecuteScript() {
            let projectId = this.projectId;
            if ( null == projectId ) {
                projectId = this.$store.getters.projectActivedId;
            }
            let bittly = new WidgetActionScriptBittly({
                runtime : this.runtime,
                projectId : projectId,
                widget : this.widget,
                component : this,
            });
            
            let isSuccess = true;
            let projectScript = Executor.getProjectScriptObjectOfCurrentProject();
            let $this = this;
            try {
                let scriptTemplate = `
                    return new Promise(async function(resolve, reject){
                        try {
                            /** start **/
                            ${this.widget.actionScript}
                            /** end **/
                            resolve()
                        } catch ( e ) {
                            reject( e );
                        }
                    });
                `;

                let func = new Function('bittly', 'project', '$this' , scriptTemplate);
                await func(bittly, projectScript, $this);
            } catch ( e ) {
                isSuccess = false;
                this.showException(e);
            }
            return isSuccess;
        },

        /**
         * get value of this widget
         * @public
         * @override
         * @returns {any}
         */
        valueGet() {
            return undefined;
        },

        /**
         * add runtime variable watcher, once the variable changed,
         * the watcher would be called.
         * @param {*} name 
         * @param {*} watcher 
         */
        addVariableWatcher( name, watcher ) {
            if ( undefined == name ) {
                return;
            }
            this.runtime.addVariableWatcher( name, watcher );
        },

        /**
         * force update the widget by default, widget should overide this
         * method to handle their own refresh event.
         * @public
         * @overide 
         */
        refresh() {
            this.$forceUpdate()
        },

        /**
         * display error message during the panel running.
         * @param {Error|string} exception
         */
        showException( exception ) {
            this.$el.style.border = 'solid 2px red';
            let message = 'string' === typeof(exception) ? exception : exception.message;
            let content = this.$t('panel.runMode.actionExecuteFailed',[message]);
            this.$error({title: this.$t('messages.dialogTitle.error'), content: content});
        },
    },
};