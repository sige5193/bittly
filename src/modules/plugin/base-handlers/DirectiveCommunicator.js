import CommunicatorBase from "../../directive/communicators/CommunicatorBase";
export default class DirectiveCommunicator extends CommunicatorBase {
    /**
     * @param {*} options 
     */
    constructor( options ) {
        super(options);
        this.isCustom = true;
    }
}