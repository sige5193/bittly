export default class DirectiveParameterEditor extends HTMLElement {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.parameter = null;
    }

    /**
     * @returns 
     */
    getContent() {
        return null;
    }

    /**
     * set parameter
     * @param {any} parameter 
     */
    setParameter( parameter ) {
        this.parameter = parameter;
        this.initEditor();
    }

    /**
     * callback handler on 
     */
    initEditor() {
        return ;
    }

    /**
     * event change event
     */
    emitChangeEvent() {
        let customEvent = new CustomEvent('change', {
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(customEvent);
    }
}