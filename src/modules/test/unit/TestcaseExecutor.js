import DirectiveScriptExecutor from '../../directive/script/Executor.js'
import TestcaseLibBittly from './TestcaseLibBittly.js'
import DirectiveExecutor from '../../directive/Executor.js'
import MdbDirective from '../../../models/MdbDirective.js';
import Common from '../../../utils/Common.js';
import DataComparator from '../DataComparator.js'
export default class TestcaseExecutor {
    /**
     * @param {*} testcase 
     */
    constructor( testcase ) {
        /**
         * @property {MdbTestcase}
         */
        this.testcase = testcase;
        /**
         * @property {MdbDirective}
         */
        this.directive = null;
        /**
         * @property {DirectiveExecutor}
         */
        this.directiveExecutor = null;
        /**
         * @property {Error|null}
         */
        this.error = null;
        /**
         * @property {DataComparator|null}
         */
        this.comparator = null;
    }

    /**
     * execute testcase
     * @returns {Promise<Boolean>}
     */
    async execute() {
        try {
            // execute before-script
            await this.executeScript(this.testcase.beforeScript, 'before');

            // execute directive
            this.directive = await MdbDirective.findOne(this.testcase.directiveId);
            let executor = new DirectiveExecutor(this.directive);
            executor.setCustomParams(this.testcase.paramFormat, this.testcase.params.value);
            await executor.execute();
            this.directiveExecutor = executor;
            await Common.msleep(this.testcase.timeout);
            
            // check response
            let comparator = new DataComparator();
            comparator.type = this.testcase.expectFormat;
            comparator.executor = executor;
            comparator.expectData = this.testcase.expect.value;
            comparator.compare();
            this.comparator = comparator;

            // execute after-script.
            await this.executeScript(this.testcase.afterScript, 'after');
        } catch ( e ) {
            this.error = e;
        }
    }

    /**
     * execute script string
     * @param {String} scriptContent
     * @param {String} type
     * @returns {Promise<void>}
     */
    async executeScript( scriptContent, type ) {
        let $this = this;
        let projectScript = DirectiveScriptExecutor.getProjectScriptObjectOfCurrentProject();
        let bittly = new TestcaseLibBittly({projectId : this.testcase.projectId});

        let scriptTemplate = `
            return new Promise(async function(resolve, reject){
                try {
                    /** start **/
                    ${scriptContent}
                    /** end **/
                    resolve()
                } catch ( e ) {
                    reject( e );
                }
            });
        `;

        let func = new Function('bittly','project','$this', scriptTemplate);
        await func(bittly, projectScript, $this);
    }

    /**
     * @returns {Boolean}
     */
    isSuccess() {
        if ( null !== this.error ) {
            return false;
        }
        return this.comparator.getIsMatched();
    }
}