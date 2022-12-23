export default class DirectiveTargetEditor extends HTMLElement {
    /**
     * 
     */
    constructor() {
        super();
        this.target = null;
    }

    /**
     * @param {*} target 
     */
    setTarget( target ) {
        this.target = target;
        this.initTarget();
    }

    /**
     * 
     */
    initTarget() {

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

    /**
     * @returns 
     */
    getConfiguration() {
        return null;
    }
}