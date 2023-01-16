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
         * widget options
         * @property {Object}
         */
        widget : Object, 
        /**
         * instance of runtime for this panel.
         * @property {Runtime}
         */
        runtime : Object, 
        /**
         * id of project
         * @property {Number}
         */
        projectId : {type : Number,default : null},
    },
    data() {
        return {
            /**
             * the directives that been used inside directives. this
             * value would be update by script lib.
             * @property {Array<String : MdbDirective>}
             */
            scriptDirectives : {},
        }
    },
    methods : {
        /**
         * refresh widget to update view, this method would be called each time the runtime 
         * variables have changed.
         * @public
         */
        async refresh() {
            let dataSource = this.widget.dataSource;
            if ( 'variable' == dataSource ) {
                this.refreshDataSourceFromVariable();
            } else if ( 'script' == dataSource ) {
                await this.refreshDataSourceFromScript();
            } else if ( 'expression' == dataSource ) {
                try {
                    this.refreshDataSourceFromExpression();
                } catch (e) {
                    this.showException(e);
                }
            }
            this.updateWidget();
        },

        /**
         * refresh widget by update values from expressions
         */
        refreshDataSourceFromExpression() {
            let map = this.getAttributeExpressionMap();
            for ( let i=0; i<map.length; i++ ) {
                let item = map[i];

                // replace variable placeholders
                let expr = item.expr;
                let regex = /\{\{(?<variable>.*?)\}\}/gm;
                let match = null;
                while ((match = regex.exec(expr)) !== null) {
                    let varName = match.groups.variable;
                    let varValue = this.runtime.getVariableValue(varName, null);
                    if ( null === varValue ) {
                        throw Error(this.$t('panel.editMode.widgetDataSourceExprUnableToReadVariable',[varName]));
                    }
                    expr = expr.replaceAll(match[0], varValue);
                }

                // execute expression
                let exprValue = null;
                try {
                    let exprFunc = Function(`return ${expr};`);
                    exprValue = exprFunc.call({});
                    console.log(`widget update data source by expression : ${item.expr} => ${expr} => ${exprValue}`);
                } catch ( e ) {
                    throw Error(window.app.$t('panel.editMode.widgetDataSourceExprFailedToExecuteExpr', [item.expr, expr, e.message]));
                }
                this[item.name] = exprValue;
            }
        },

        /**
         * get attribute express map, for example :
         * ```
         * [{attr:'value', expr:'{{variable}}*100/ 10'}]
         * ```
         * @overide
         * @protected
         * @returns {Array<Object>}
         */
        getAttributeExpressionMap() {
            return [];
        },

        /**
         * refresh widget by update values from runtime variables.
         */
        refreshDataSourceFromVariable() {
            let varMap = this.getVariableMap();
            if ( null == varMap ) {
                return;
            }
            for ( let varName in varMap ) {
                this[varMap[varName]] = this.runtime.getVariableValue(varName);
            }
        },

        /**
         * get variable map
         * @override
         */
        getVariableMap() {
            return null;
        },

        /**
         * refresh widget by execute script, user should set data value in
         * script to update view.
         */
        async refreshDataSourceFromScript() {
            let projectId = this.projectId;
            if ( null == projectId ) {
                projectId = this.$store.getters.projectActivedId;
            }
            
            let bittly = new WidgetActionScriptBittly({
                runtime : this.runtime,
                projectId : projectId,
                widget : this.widget,
                component: this,
            });
            let projectScript = await Executor.getProjectScriptObjectOfCurrentProject();
            let $this = this;
            try {
                let scriptTemplate = `
                    return new Promise(async function(resolve, reject){
                        try {
                            /** start **/
                            ${this.widget.dataSourceScript}
                            /** end **/
                            resolve()
                        } catch ( e ) {
                            reject( e );
                        }
                    });
                `;

                let func = new Function('bittly', '$this','project' , scriptTemplate);
                await func(bittly, $this, projectScript);
            } catch ( e ) {
                this.showException(e);
            }
        },

        /**
         * display error message
         */
        showException( exception ) {
            this.$el.style.border = 'solid 2px red';
            let message = 'string' === typeof(exception) ? exception : exception.message;
            let content = this.$t('panel.runMode.dataSourceScriptExecuteFailed',[message]);
            this.$error({title: this.$t('messages.dialogTitle.error'), content: content});
        },

        /**
         * update widget
         * @override
         */
        updateWidget() {
            this.$forceUpdate();
        },

        /**
         * set data value
         * @param {*} name 
         * @param {*} value 
         */
        dataSet( name, value ) {
            this[name] = value;
        }
    },
}