export default class Runtime {
    /**
     * constructor of panel runtime
     * @param {MdbPanel} panel 
     * @param {VueComponent} component
     */
    constructor( panel, component ) {
        this.panel = panel;
        this.component = component;

        /**
         * history of requests
         * @property {Object[]}
         */
        this.requests = [];
        /**
         * counter of request key
         * @property {Number}
         */
        this.requestKeyCounter = 0;

        /**
         * variables of runtime
         * @property {Object}
         */
        this.variables = {};
        this.setupVariables();
    }

    /**
     * setup runtime variables
     * @private
     */
    setupVariables() {
        for ( let i=0; i<this.panel.variables.length; i++ ) {
            let defaultValue = this.panel.variables[i].defaultValue;
            if ( undefined === defaultValue ) {
                defaultValue = '';
            }
            this.variables[this.panel.variables[i].name] = {
                type : this.panel.variables[i].type,
                value : defaultValue,
                watchers : [],
            };
        }
    }

    /**
     * add watcher to variable, once the variable changed, the watcher would be
     * called.
     * @param {String} name 
     * @param {CallableFunction} watcher 
     */
    addVariableWatcher( name, watcher ) {
        if ( undefined === this.variables[name] ) {
            return;
        }
        this.variables[name].watchers.push(watcher);
    }

    /**
     * set runtime variable value
     * @param {String} name 
     * @param {any} value 
     */
    setVariableValue( name, value ) {
        if ( undefined === this.variables[name] ) {
            return;
        }
        this.variables[name].value = value;

        for ( let i=0; i<this.variables[name].watchers.length; i++ ) {
            let watcher = this.variables[name].watchers[i];
            watcher(value);
        }
        this.refresh();
    }

    /**
     * get runtime variable
     * @param {String} name 
     * @param {any} defaultValue 
     * @returns {any}
     */
    getVariableValue( name, defaultValue ) {
        if ( undefined == name ) {
            return defaultValue;
        }
        
        let value = defaultValue;
        if ( undefined != this.variables[name] 
        && undefined != this.variables[name].value ) {
            value = this.variables[name].value;
        }
        return value;
    }

    /**
     * refresh runtime and all the widgets
     */
    refresh() {
        this.component.refresh();
        let widgets = this.component.$refs.widgets;
        for ( let i=0; i<widgets.length; i++ ) {
            widgets[i].refresh();
        }
    }

    /**
     * add request log
     * @param {Object} request 
     * @returns {Object}
     */
    requestLogPush( request ) {
        this.requestKeyCounter ++;
        request.key = this.requestKeyCounter;
        this.requests.push(request);
        this.refresh();
        return request;
    }
}