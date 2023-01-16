import webdriver from 'selenium-webdriver'
export default class FunctionalSetup {
    /**
     * setup functional test by given options
     * @param {Object} options 
     * @returns {FunctionalSetup}
     */
    static async setup( options={} ) {
        let tester = new FunctionalSetup(options);
        tester.init();
        return tester;
    }

    /**
     * @param {*} options 
     */
    constructor(options) {
        this.options = {
            serverAddress : 'http://localhost:9515',
            binaryPath : 'D:/Flashin/bittly-app/dist_electron/win-unpacked/Bittly.exe',
            ... options,
        }
    }

    /**
     * get webdriver instance for ui testing
     * @private
     */
    async init() {
        this.webdriver = await new webdriver.Builder()
        .usingServer(this.options.serverAddress)
        .withCapabilities({
            'goog:chromeOptions': {
                binary: this.options.binaryPath
            }
        })
        .forBrowser('chrome')
        .build();
    }

    /**
     * click element by webdriver
     * @param {String} selector
     * @returns {Promise} 
     */
    async click( selector ) {
        let locator = webdriver.By.css(selector);
        await this.webdriver.wait(webdriver.until.elementLocated(locator, 60000));
        await this.webdriver.findElement(locator).click();
    }

    /**
     * send keys to element by webdriver
     * @param {String} selector 
     * @param {String} content 
     */
    async input( selector, content ) {
        let locator = webdriver.By.css(selector);
        await this.webdriver.wait(webdriver.until.elementLocated(locator, 60000));
        await this.webdriver.findElement(locator).sendKeys(content);
    }
}