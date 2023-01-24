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
        let env = null;
        if ( 'Electron' === window.envName ) {
            env = new EnvElectron();
        } else {
            env = new EnvBrowser();
        }
        Environment.env = env;
        return env;
    }

    /**
     * get env instance
     * @returns {Environment}
     */
    static getEnv() {
        return Environment.env;
    }
}