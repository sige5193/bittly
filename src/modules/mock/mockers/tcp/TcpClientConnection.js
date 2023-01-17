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
        this.socket.on('data', data => this.handleOnData(data));
        this.socket.on('close', () => this.handleOnClose());
        this.socket.on('error', err => this.handleOnError(err));
    }

    /**
     * event handler on connection error
     * @param {*} err 
     */
    handleOnError( err ) {
        if ( 'ECONNRESET' === err.code && this.socket.destroyed ) {
            return ;
        }
        this.mocker.trigger('client-error', this, err);
    }

    /**
     * get if conenction is connected.
     * @returns {Boolean}
     */
    getIsConnected() {
        return !this.socket.destroyed;
    }

    /**
     * event handler on client closed.
     */
    handleOnClose() {
        this.mocker.trigger('client-close', this);
    }

    /**
     * event handler on client receive data.
     * @param {*} data 
     */
    handleOnData(data) {
        this.dataReceiveSize += data.length;

        let entry = {};
        entry.handler = 'Hex';
        entry.time = new Date();
        entry.dir = 'receive';
        entry.data = Buffer.from(data);
        
        // try to merge incomming data
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
        
        // match request
        let matcher = new RequestMatcher(this.mocker.options.responseMatchRules);
        let rules = matcher.match(entry.data);
        
        // update entry name
        let names = [];
        rules.forEach(item => names.push(item.name));
        if ( 0 < names.length ) {
            entry.name = window.app.$t('mock.response.match.entryName',[names.join('; ')]);
        } else {
            entry.name = window.app.$t('mock.response.match.entryNameNotMatch');
        }
        this.dataEntries.push(entry);
        this.mocker.trigger('client-data', this);

        // send matched content
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