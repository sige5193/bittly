import EnvBrowser from "./EnvBrowser";
import EnvElectron from "./EnvElectron";
export default class Environment {
    /**
     * instance of environment
     * @var {Environment}
     */
    static env = null;

    /**
     * setup environment
     */
    static setup() {
        if ( 'Electron' === window.envName ) {
            Environment.switchEnv('Electron');
        } else {
            Environment.switchEnv('Browser');
        }
        return Environment.env;
    }

    /**
     * switch environment by given name
     * @param {String} name 
     */
    static switchEnv( name ) {
        if ( 'Electron' === name ) {
            Environment.env = new EnvElectron();
        } else if ('Browser' === name ) {
            Environment.env = new EnvBrowser();
        } else {
            throw Error(`environment [${name}] is not supported`)
        }
    }

    /**
     * get env instance
     * @returns {Environment}
     */
    static getEnv() {
        return Environment.env;
    }
}