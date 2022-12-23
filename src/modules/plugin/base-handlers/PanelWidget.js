export default class PanelWidget extends HTMLElement {
    /**
     * 
     */
    constructor() {
        super();
        this.isCustom = true;
        this.options = null;
        this.wrapper = null;
    }

    /**
     * refresh the wdiget
     * @returns 
     */
    refresh() {
        return ;
    }

    /**
     * @param {*} wrapper 
     */
    setWrapper(wrapper) {
        this.wrapper = wrapper;
        this.options = wrapper.widget;
    }

    /**
     * @param {*} name 
     * @param {*} defaultVal 
     */
    variableGet( name, defaultVal=undefined ) {
        return this.wrapper.runtime.getVariableValue(name,defaultVal);
    }

    /**
     * @param {*} name 
     * @param {*} value 
     */
    variableSet( name, value ) {
        return this.wrapper.runtime.setVariableValue(name, value);
    }

    /**
     * 
     */
    execute() {
        this.wrapper.actionExecute();
    }

    /**
     * @returns 
     */
    valueGet() {
        return null;
    }
}