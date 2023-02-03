import MyObject from "../../../../utils/datatype/MyObject";
import RequestMatcher from "../../response/match/RequestMatcher";
import ResponseDataGenerator from '../../response/DataGenerator'
export default class UdpClientConnection {
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
        this.key = `${socket.address}:${socket.port}`;
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
    }

    /**
     * event handler on client receive data.
     * @param {*} data 
     */
    async receiveData(data) {
        let logData = ('hex'===this.mocker.options.encoding) ? data.toString('hex') : data.toString();
        this.mocker.log(`[client ${this.key}] (receive ${this.mocker.options.encoding}) : `, logData);
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
            this.mocker.log(`[client ${this.key}] matched "${rules[i].name}"`);
            await this.send(content);
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
        let data = entry.data;
        return new Promise((resolve, reject) => {
            this.mocker.server.send(data, 0, data.length, this.socket.port, this.socket.address, err => {
                if ( null !== err ) {
                    return reject(err);
                }
                let logData = ('hex'===$this.mocker.options.encoding) ? data.toString('hex') : data.toString();
                this.mocker.log(`[client ${$this.key}] (send ${$this.mocker.options.encoding}) : `, logData);
                resolve();
            });
        });
    }

    /**
     * close the connection
     */
    close() {}
}