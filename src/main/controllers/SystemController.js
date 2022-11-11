import { app } from 'electron'
import ControllerBase from "./ControllerBase";
export default class SystemController extends ControllerBase {
    /**
     * get system country code
     * @returns {String}
     */
    actionLocaleCountryCodeGet() {
        return app.getLocaleCountryCode();
    }
}