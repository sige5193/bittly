import { Buffer } from 'buffer';
import Common from '@/utils/Common.js'
import RequestParamBuilder from './parameters/Builder.js'
import CommunicatorFactory from './communicators/CommunicatorFactory.js'
import ResponseFormParser from './response/form/ResponseParser.js'
export default class Executor {
    /**
     * constructor of executor
     * @param {MdbDirective} directive 
     */
    constructor ( directive ) {
        /**
         * instance of directive model
         * @property {MdbDirective}
         */
        this.directive = directive;
        /**
         * instance of parameter builder
         * @property {Builder}
         */
        this.paramBuilder = null;
        /**
         * name of custom format
         * @property {String}
         */
        this.customParamFormat = null;
        /**
         * content of custom parameters
         * @property {String|Object[]}
         */
        this.customParams = null;
        /**
         * onData handler function
         * @property {CallableFunction}
         */
        this.onDataHandler = null;
        /**
         * response buffer data
         * @property {Buffer}
         */
        this.responseBuffer = null;
        /**
         * the cursor where to start reading
         * @property {Number}
         */
        this.responseReadCursor = 0;
        /**
         * @property {Object}
         */
        this.communicator = null;
    }

    /**
     * execute directive
     * @returns {Promise}
     */
    async execute() {
        let communicator = await CommunicatorFactory.getCommunicator(this.directive.target);
        communicator.setDirective(this.directive);
        communicator.onData(( data ) => this.handleCommunicatorOnData(data));
        if ( !communicator.getIsOpen() ) {
            await communicator.open();
            await Common.msleep(communicator.timeDelayBeforeFirstWrite);
        }
        
        this.paramBuilder = communicator.getParamBuilder(this.directive);
        if ( null == this.paramBuilder ) {
            this.paramBuilder = new RequestParamBuilder(this.directive);
        }
        await this.paramBuilder.init();
        this.paramBuilder.setCustomParams(this.customParamFormat, this.customParams);
        await communicator.write(this.paramBuilder.getRequestData());
        this.communicator = communicator;
    }

    /**
     * Get executor parameter builder.
     * @returns {Builder}
     */
    getParamBuilder() {
        return this.paramBuilder;
    }

    /**
     * set custom params
     * @param {String} foramt
     * @param {String|Object[]} params 
     */
    setCustomParams( format, params ) {
        this.customParamFormat = format;
        this.customParams = params;
    }

    /**
     * event handler for communicator onData event
     * @param {Buffer} data
     */
    handleCommunicatorOnData( data ) {
        if ( null == this.responseBuffer ) {
            this.responseBuffer = Buffer.from(data);
        } else {
            this.responseBuffer = Buffer.concat([this.responseBuffer, Buffer.from(data)]);
        }

        if ( null != this.onDataHandler ) {
            this.onDataHandler(data);
        }
    }

    /**
     * set callback handler for communicator onData event
     * @param {CallableFunction} callback 
     */
    onData( callback ) {
        this.onDataHandler = callback;
    }

    /**
     * get request params buffer data
     * @returns {Buffer}
     */
    getRequestBuffer() {
        return this.paramBuilder.getRequestBuffer();
    }

    /**
     * get response data buffer
     * @returns {Buffer}
     */
    getResponseBuffer() {
        return this.responseBuffer;
    }

    /**
     * get response as bytes
     * @returns {Buffer}
     */
    getResponseAsBytes() {
        if ( null == this.responseBuffer ) {
            return [];
        }
        return Buffer.from(this.responseBuffer);
    }

    /**
     * get response data as string
     * @returns {String}
     */
    getResponseAsString() {
        return Common.charsetConvert(
            this.responseBuffer, 
            'utf-8', 
            this.directive.responseCharset
        ).toString();
    }

    /**
     * get response as form object
     * @returns {ResponseFormParser}
     */
    getResponseAsForm() {
        return new ResponseFormParser(this.directive, this.responseBuffer);
    }

    setCursor( pos ) {
        this.responseReadCursor = pos;
    }
    moveCursor( offset ) {
        this.responseReadCursor += offset * 1;
    }
    read(length) {
        if ( this.responseReadCursor >= this.responseBuffer.length ) {
            return Buffer.alloc(0);
        }

        let endpos = this.responseReadCursor+length;
        if ( null === length ) {
            endpos = undefined;
        }

        return this.responseBuffer.slice(
            this.responseReadCursor,
            endpos
        );
    }

    /**
     * write data to communicator
     * @param {*} data 
     */
    async write(data) {
        await this.communicator.write(data);
    }
}