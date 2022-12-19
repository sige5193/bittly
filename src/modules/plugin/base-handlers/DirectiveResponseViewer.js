/**
 * base class for custom response viewer
 */
export default class DirectiveResponseViewer extends HTMLElement {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.response = null;
    }

    /**
     * update response
     * @param {Buffer|null} response 
     */
    updateResponse( response ) {
        this.response = response;
        this.onResponseUpdate();
    }

    /**
     * callback handler on response updated
     */
    onResponseUpdate() {
        return ;
    }
}