import Dictionary from '@/utils/Dictionary.js'
import Common from "../../../../utils/Common.js";
import { Buffer } from 'buffer';
import RequestParamBuilderBase from '../../parameters/Builder.js'
/**
 * Request param builder for http communicator
 * @author sige
 */
export default class RequestParamBuilder extends RequestParamBuilderBase {
    /**
     * @param {*} directive 
     */
    constructor( directive ) {
        super(directive);
        /**
         * @property {String}
         */
        this.bodyFormDataBoundary = null;
        /**
         * @property {Number}
         */
        this.bodyContentLength = 0;
        /**
         * @property {Buffer}
         */
        this.bodyContent = Buffer.alloc(0);
    }

    /**
     * http communicator use this object as input parameter
     * @returns {RequestParamBuilder}
     */
    getRequestData() {
        return this;
    }

    /**
     * http communicator has no request buffer data to display
     * @returns {null}
     */
    getRequestBuffer() {
        return Buffer.from(this.bodyContent);
    }

    /**
     * get name of request method
     * @returns {String}
     */
    getMethod() {
        if ( Common.isEmpty(this.directive.target.httpMethod) ) {
            throw Error('target method is required');
        }
        return this.directive.target.httpMethod.toUpperCase();
    }

    /**
     * get url of request
     * @returns {String}
     */
    getUrl() {
        if ( Common.isEmpty(this.directive.target.httpUrl) ) {
            throw Error(window.app.$t('directive.communicator.http.requestUrlCannotBeEmpty'))
        }

        let url = this.directive.target.httpUrl;
        url = this.applyStatusVariableToString(url);
        url = this.applyEnvVariablesToString(url);
        return url;
    }

    /**
     * get headers of request
     * @returns {Object}
     */
    getHeaders() {
        if ( undefined === this.directive.target.httpHeaders ) {
            return {};
        }

        let scriptResult = this.executeRequestScript();
        let headerList = this.directive.target.httpHeaders;
        let headers = {};
        for ( let i=0; i<headerList.length; i++ ) {
            let item = headerList[i];
            let name = item.name.trim();
            name = this.applyStatusVariableToString(name);
            name = this.applyEnvVariablesToString(name);
            name = this.applyScriptResultToString(name, scriptResult);
            if ( 0 == name.length ) {
                continue;
            }

            let value = item.value;
            value = this.applyStatusVariableToString(value);
            value = this.applyEnvVariablesToString(value);
            value = this.applyScriptResultToString(value, scriptResult);
            headers[name] = value;
        }
        
        let cookies = this.generateCookieHaderString();
        if ( null !== cookies && undefined === headers['Cookie'] ) {
            headers['Cookie'] = cookies;
        }

        this.generateHeaderContentAttributes(headers);
        return headers;
    }

    /**
     * generate header content attributes
     * @param {Object} headers 
     */
    generateHeaderContentAttributes ( headers ) {
        if ( undefined === headers['Content-Type'] || '' === headers['Content-Type'].trim() ) {
            let format = this.paramFormat;
            if ( 'hex' === format ) {
                headers['Content-Type'] = 'application/octet-stream';
            } else if ( 'text' === format ) {
                headers['Content-Type'] = 'text/plain';
            } else if ( 'file' === format ) {
                headers['Content-Type'] = 'application/octet-stream';
            }else if ( 'form' === format  ) {
                if ( 0 === this.bodyContentLength ) {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                } else {
                    headers['Content-Type'] = 'multipart/form-data';
                }
            }
        }
        if ( 'multipart/form-data' === headers['Content-Type'].trim() ) {
            headers['Content-Type'] += `; boundary=${this.bodyFormDataBoundary}`;
        }
        if ( undefined === headers['Content-Length'] ) {
            headers['Content-Length'] = this.bodyContentLength;
        }
    }

    /**
     * @returns {String|null}
     */
    generateCookieHaderString ( ) {
        if ( undefined === this.directive.target.httpCookies ) {
            return null;
        }

        let scriptResult = this.getScriptResult();
        let cookies = [];
        for ( let i=0; i<this.directive.target.httpCookies.length; i++ ) {
            let cookie = this.directive.target.httpCookies[i];
            let name = cookie.name.trim();
            name = this.applyStatusVariableToString(name);
            name = this.applyEnvVariablesToString(name);
            name = this.applyScriptResultToString(name, scriptResult);
            if ( 0 === name.length ) {
                continue;
            }

            let value = cookie.value;
            value = this.applyStatusVariableToString(value);
            value = this.applyEnvVariablesToString(value);
            value = this.applyScriptResultToString(value, scriptResult);
            cookies.push(`${name}=${value}`);
        }
        if ( 0 == cookies.length ) {
            return null;
        }

        cookies = cookies.join('; ');
        return cookies;
    }

    /**
     * @returns 
     */
    getBody() {
        let paramContent = this.getBuildHandler().getPreProcessedData();
        if ( -1 === ['PUT','POST','PATCH'].indexOf(this.directive.target.httpMethod) ) {
            return '';
        }
        
        let format = this.paramFormat;
        if ( 'hex' === format ) {
            let hexBuf = Buffer.from(paramContent, 'hex');
            this.bodyContentLength = hexBuf.length;
            this.bodyContent = hexBuf;
        } else if ( 'text' === format ) {
            this.bodyContentLength = paramContent.length;
            this.bodyContent = paramContent;
        } else if ( 'file' === format ) {
            this.bodyContentLength = paramContent.length;
            this.bodyContent = paramContent;
        }else if ( 'form' === format  ) {
            this.bodyContent = this.generateBodyFromFormData(paramContent);
            this.bodyContentLength = this.bodyContent.length;
        }
        return this.bodyContent;
    }

    /**
     * generate body content from form data
     * @returns {String}
     */
    generateBodyFromFormData ( paramContent ) {
        let contentType = 'multipart/form-data';
        for ( let i=0; i<this.directive.target.httpHeaders.length; i++ ) {
            let header = this.directive.target.httpHeaders[i];
            if ( 'content-type' === header.name.toLowerCase().trim() ) {
                contentType = header.value.toLowerCase().trim();
                break;
            }
        }

        if ( 'application/x-www-form-urlencoded' == contentType ) {
            let formData = new FormData();
            for ( let i=0; i<paramContent.length; i++ ) {
                let item = paramContent[i];
                if ( 'file' == item.type ) {
                    let fileContent = Common.fileGetContent(item.value);
                    formData.append(item.name, fileContent);
                } else {
                    formData.append(item.name, this.convertFormItemToString(item));
                }
            }
            return new URLSearchParams(formData).toString();
        } else if ( 'multipart/form-data' === contentType ) {
            return this.generateBodyFromFormDataWithMultipartFormData(paramContent);
        } else {
            let buffer = this.getBuildHandler().buildBuffer();
            return buffer;
        }
    }

    /**
     * Generate form body data with 'multipart/form-data'
     * @param {*} paramContent 
     * @returns 
     */
    generateBodyFromFormDataWithMultipartFormData(paramContent) {
        this.bodyFormDataBoundary = '----BittlyBoundary' + Math.random().toString(36).substring(2)
            + Math.random().toString(36).substring(2)
            + Math.random().toString(36).substring(2)
            + Math.random().toString(36).substring(2);
        
        let formData = [];
        for ( let i=0; i<paramContent.length; i++ ) {
            let item = paramContent[i];
            let itemName = encodeURI(item.name);
            let itemBuffer = null;
            let itemHead = `Content-Disposition: form-data; name="${itemName}"\r\n\r\n`;
            if ( 'file' == item.type ) {
                itemBuffer = Buffer.from(Common.fileGetContent(item.value));
                let fileName = encodeURI(item.value);
                itemHead = [
                    `Content-Disposition: form-data; name="${itemName}"; filename="${fileName}"`,
                    `Content-Type: application/octet-stream`,
                    `Content-Transfer-Encoding: binary`,
                ].join('\r\n') + '\r\n';
            } else {
                itemBuffer = Buffer.from(this.convertFormItemToString(item));
            }

            formData.push(Buffer.from(`--${this.bodyFormDataBoundary}\r\n`));
            formData.push(Buffer.from(itemHead));

            formData.push(itemBuffer);
            formData.push(Buffer.from('\r\n'));
        }
        formData.push(Buffer.from(`--${this.bodyFormDataBoundary}--`));
        formData = Buffer.concat(formData);
        this.bodyContentLength = formData.length;
        return formData;
    }

    /**
     * convert form item to string
     * @param {Object} item
     * @returns {String}
     */
    convertFormItemToString( item ) {
        if ( Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', item.type, 'unsigned', false) ) {
            let preMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
            let value = item.value.replace(/\s/g,'');
            let num = `${preMap[item.format]}${value}`;
            return BigInt(num).toString();
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE','BYTES', item.type) ) {
            let itemData = Common.convertStringToHex(item.value);
            return Buffer.from(itemData).toString();
        } else {
            return `${item.value}`;
        }
    }
}