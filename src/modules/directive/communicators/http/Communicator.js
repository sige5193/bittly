import MdbDirective from '@/models/MdbDirective.js';
import CommunicatorBase from '../CommunicatorBase.js'
import RequestParamBuilder from './RequestParamBuilder.js';
import axios from 'axios'
import Environment from '../../../../environments/Environment.js';
/**
 * Http communicator use to execute http request by given target options
 * and parameters.
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * Get instance by option
     * @param {*} options 
     * @returns {Communicator}
     */
    static async setup( options ) {
        return new Communicator(options);
    }

    /**
     * constructor of exector 
     * @param {Object} options
     */
    constructor(options) {
        super(options);
        this.deviceType = 'http';
        this.options.httpUrl = this.applyEnvPlaceholderVariables(this.options.httpUrl);
    }

    /**
     * http communicator has it's own parameter builder.
     * @param {MdbDirective} directive
     * @returns {RequestParamBuilder}
     */
    getParamBuilder( directive ) {
        if ( ! (directive instanceof MdbDirective) ) {
            throw Error('directive is required.');
        }
        return new RequestParamBuilder(directive);
    }

    /**
     * Get connection status, as http request does not need to keep connections,
     * so it always open.
     * @returns {boolean}
     */
    getIsOpen() {
        return true;
    }

    /**
     * open connection, http request does not need to keep connections, so it
     * resolves directly.
     * @returns {Promise}
     */
    open() {
        return Promise.resolve();
    }

    /**
     * execute a http request, the http request would be builded by target options
     * to get request info and params to generate request body.
     * @param {RequestParamBuilder} paramBuilder 
     * @returns {Promise}
     */
    write( paramBuilder ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            let options = {};
            options.url = paramBuilder.getUrl();
            options.body = paramBuilder.getBody();
            options.method = paramBuilder.getMethod();
            options.headers = paramBuilder.getHeaders();
            
            let handlerName = Environment.getEnv().httpHandler;
            if ( 'node-http' === handlerName ) {
                $this.executeRequest(options, resolve, reject);
            } else {
                $this.executeRequestByAxios(options, resolve, reject);
            }
        });
    }

    /**
     * execute http request by axios
     * @param {*} options 
     * @param {*} resolve 
     * @param {*} reject 
     */
    executeRequestByAxios(options, resolve, reject) {
        delete options.headers['Content-Length'];
        axios({
            method: options.method,
            url: options.url,
            headers : options.headers,
            data: options.body
        })
        .then(response => resolve(response.data))
        .catch(e => {
            debugger
            console.log(e);
            reject(e)
        });
    }

    /**
     * execute http request
     */
    executeRequest( options, resolve, reject ) {
        let url = options.url;
        let urlInfo = new URL(url);

        let requestOptions = {};
        requestOptions.method = options.method;
        requestOptions.host = urlInfo.host;
        requestOptions.port = urlInfo.port;
        if ( '' === urlInfo.port && 'http:' === urlInfo.protocol ) {
            requestOptions.port = 80;
        }
        if ( '' === urlInfo.port && 'https:' === urlInfo.protocol ) {
            requestOptions.port = 443;
        }
        requestOptions.path = urlInfo.pathname + urlInfo.search;
        requestOptions.headers = options.headers;
        
        let requestInfo = {};
        requestInfo.options = options;
        requestInfo.resolve = resolve;
        requestInfo.reject = reject;
        requestInfo.response = null;
        requestInfo.responseData = Buffer.alloc(0);
        
        let requester =  'http:' === urlInfo.protocol ? window.http : window.https;
        let request = requester.request(requestOptions, (response) => {
            requestInfo.response = response;
            response.on('data', function (chunk) {
                requestInfo.responseData = Buffer.concat([requestInfo.responseData, Buffer.from(chunk)]);
            });
            response.on('end', () => this.handleResponse(requestInfo));
        });
        request.on('error', (error) => this.handleResponseError(resolve , reject, error));
        
        let bodyData = undefined === options.body ? '' : options.body;
        request.write(bodyData);
        request.end();
    }

    /**
     * handle response success, this handler would resolve the write operation
     * and execute `onData` callback handler.
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} response 
     */
    handleResponse(requestInfo) {
        if ( this.handleResponseRedirect(requestInfo) ) {
            return;
        }
        
        requestInfo.resolve();
        let responseData = requestInfo.responseData;
        this.log('response', responseData);
        
        if ( true === this.directive.target.httpResponseHeaderEnable ) {
            let headers = [];
            let rawHeaders = requestInfo.response.rawHeaders;
            for ( let i=0; i<rawHeaders.length/2; i+=2 ) {
                headers.push(`${rawHeaders[i]}: ${rawHeaders[i+1]}`);
            }
            headers = headers.join('\r\n') + '\r\n\r\n';
            responseData = Buffer.concat([Buffer.from(headers), responseData])
        }
        
        setTimeout(()=>this.dataReceived(responseData),1);
    }

    /**
     * 
     * @param {*} requestInfo 
     * @returns 
     */
    handleResponseRedirect(requestInfo) {
        if ( !(true === this.directive.target.httpFollowRedirectEnable) 
        || undefined === requestInfo.response.headers.location) {
            return false;
        }

        let redirectUrl = requestInfo.response.headers.location;
        if ( -1 === redirectUrl.indexOf('://') ) {
            let originalUrlInfo = new URL(requestInfo.options.url);
            if ( '/' !== redirectUrl[0] ) {
                let path = originalUrlInfo.pathname.split('/');
                path.shift();
                path.pop();
                path = 0 < path.length ? '/' + path.join('/') : '';
                redirectUrl = `${path}/${redirectUrl}`;
            }
            redirectUrl = `${originalUrlInfo.origin}${redirectUrl}`;
        }

        let options = {};
        options.method = 'GET';
        options.url = redirectUrl;
        options.redirectCount = requestInfo.options.redirectCount || 0;
        options.redirectCount ++;
        if ( options.redirectCount >= this.directive.target.httpFollowRedirectMaxCount ) {
            requestInfo.reject(this.$t('tooManyRedirects'));
            return true;
        }

        this.executeRequest(options, requestInfo.resolve, requestInfo.reject);
        return true;
    }

    /**
     * handle response error, if there is an response data in error info,
     * this handler would treat this error as normal response and give 
     * response data to caller, or it would reject the write operation.
     * @param {CallableFunction} resolve
     * @param {CallableFunction} reject
     * @param {Error} error 
     */
     handleResponseError( resolve , reject, error ) {
        reject(error);
    }

    /**
     * close connection, as http does not keep connections, so we resolve it
     * directly.
     * @returns {Promise}
     */
    close() {
        return Promise.resolve();
    }
}