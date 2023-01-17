import MyObject from "../../../../utils/datatype/MyObject";
import RequestMatcher from "../../response/match/RequestMatcher";
import ResponseDataGenerator from '../../response/DataGenerator'
export default class WsClientConnection {
    /**
     * @constructor
     * @param {*} socket 
     */
    constructor ( mocker, ws ) {
        /**
         * instance of mocker
         * @property {Mocker}
         */
        this.mocker = mocker;
        /**
         * instance of socket to client
         * @property {ws}
         */
        this.ws = ws;
        /**
         * client key
         * @property {String}
         */
        this.key = `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
        /**
         * list of data entries
         * @property {Array<Object>}
         */
        this.dataEntries = [];
        /**
         * size of send data
         * @property {Number}
         */
        this.dataSendSize = 0;
        /**
         * size of receive data
         * @property {Number}
         */
        this.dataReceiveSize = 0;
        
        // setup socket
        this.ws.on('message', data => this.onData(data));
        // this.ws.on('close', () => this.handleClientClose(key) );
    }

    /**
     * get if connection is open
     * @returns {Boolean}
     */
    getIsConnected() {
        return this.ws.readyState == this.ws.OPEN;
    }

    /**
     * event handler on client receive data.
     * @param {*} data 
     */
    onData(data) {
        this.dataReceiveSize += data.length;

        let entry = {};
        entry.handler = 'Hex';
        entry.time = new Date();
        entry.dir = 'receive';
        entry.data = Buffer.from(data);
        if ( this.mocker.mock.options.enableDataMerge ) {
            let nowTime = (new Date()).getTime();
            let mergeTime = parseInt(this.mocker.mock.options.dataMergeTime || 0);
            let lastEntry = this.dataEntries[this.dataEntries.length - 1];
            if ( undefined !== lastEntry 
            && 'receive' == lastEntry.dir 
            && (nowTime - lastEntry.time.getTime()) < mergeTime ) {
                lastEntry.data = Buffer.concat([lastEntry.data, Buffer.from(entry.data)]);
                entry = this.dataEntries.pop();
            }
        }

        let matcher = new RequestMatcher(this.mocker.options.responseMatchRules);
        let rules = matcher.match(entry.data);
        let names = [];
        for ( let i=0; i<rules.length; i++ ) {
            names.push(rules[i].name);
        }
        entry.name = window.app.$t('mock.response.match.entryName',[names.join('; ')]);
        this.dataEntries.push(entry);
        this.mocker.trigger('client-data', this);

        for ( let i=0; i<rules.length; i++ ) {
            let content = MyObject.copy(rules[i].responseContent);
            content.name = window.app.$t('mock.response.match.entryName',[rules[i].name]);
            content.handler = rules[i].responseHandler;
            this.send(content);
        }
    }

    /**
     * send response by given content
     * @param {Object} content 
     */
    send( content ) {
        let entry = MyObject.copy(content);
        
        let generator = new ResponseDataGenerator({
            status : this.mocker.status,
            requestData : {},
        });
        entry.time = new Date();
        entry.dir = 'send';
        entry.data = generator.generate(entry);
        this.dataEntries.push(entry);
        this.dataSendSize += entry.data.length;

        let data = entry.data;
        if ( 'text' === entry.mode ) {
            data = data.toString();
        }

        let $this = this;
        return new Promise(( resovle, reject ) => {
            $this.ws.send(data, err => {
                err ? reject(err) : resovle();
            });
        });
    }

    /**
     * close the connection
     */
    close() {
        this.ws.terminate();
    }
}