import MyObject from "../../../../utils/datatype/MyObject";
import RequestMatcher from "../../response/match/RequestMatcher";
import ResponseDataGenerator from '../../response/DataGenerator'
export default class TcpClientConnection {
    /**
     * @constructor
     * @param {*} socket 
     */
    constructor ( mocker, socket ) {
        /**
         * instance of mocker
         * @property {Mocker}
         */
        this.mocker = mocker;
        /**
         * instance of socket to client
         * @property {Socket}
         */
        this.socket = socket;
        /**
         * client key
         * @property {String}
         */
        this.key = `${socket.remoteAddress}:${socket.remotePort}`;
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
        this.socket.on('data', data => this.onData(data));
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

        let $this = this;
        return new Promise(( resolve ) => {
            $this.socket.write(entry.data, () => {
                $this.mocker.trigger('client-data-write', $this);
                resolve();
            });
        });
    }

    /**
     * close the connection
     */
    close() {
        this.socket.destroy();
    }
}