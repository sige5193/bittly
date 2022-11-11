export default class HttpMocker {
    /**
     * @property {Object}
     */
    static mockOptions = {};

    /**
     * mock http
     * @param {*} options 
     */
    static mock( options ) {
        HttpMocker.mockOptions = options;
        window.http = HttpMocker;
        window.https = HttpMocker;
    }

    /**
     * @returns 
     */
    static createResponse() {
        return new (class {
            /**
             * constructor of request
             */
             constructor() {
                this.eventHandlers = {};
                this.eventHandlers.end = () => {};
                this.eventHandlers.data = null;
            }

            /**
             * set event handler
             * @param {*} name 
             * @param {*} eventCallback 
             */
            on(name, eventCallback) {
                this.eventHandlers[name] = eventCallback;
            }
            
            /**
             * send response data
             * @param {*} data 
             */
            data(data) {
                this.eventHandlers.data(data);
            }

            /**
             * end the response
             */
            end() {
                this.eventHandlers.end();
            }
        });
    }

    /**
     * generate a new request
     * @param {*} options 
     * @param {*} callback 
     * @returns 
     */
    static request(options, callback) {
        let response = HttpMocker.createResponse();
        callback(response);

        let request = new (class {
            /**
             * constructor of request
             */
            constructor( response ) {
                this.eventHandlers = {};
                this.response = response;
            }

            /**
             * set event handler
             * @param {*} name 
             * @param {*} eventCallback 
             */
            on(name, eventCallback) {
                this.eventHandlers[name] = eventCallback;
            }

            /**
             * write data to request
             * @param {*} data 
             */
            write(data) {
                this.response.data(data);
            }

            /**
             * end this request
             */
            end() {
                setTimeout(() => this.response.end(), 100);
            }
        })(response);
        return request;
    }
}