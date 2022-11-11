import Common from "@/utils/Common";
/**
 * the bluetooth handler for classic device
 * @author sige
 */
export default class ClassicHandler {
    /**
     * list all availabel devices
     * @return {Promise}
     */
    static list() {
        return new Promise(( resolve ) => {
            let btSerial = new window.bluetoothSerialPort.BluetoothSerialPort();
            let devlist = [];
            btSerial.on('found', function( address, name ) {
                devlist.push({address, name});
            });
            btSerial.on('finished', function() {
                resolve(devlist);
            });
            btSerial.inquire();
        });
    }

    /**
     * constructor of classic bluetooth handler
     * @param {*} options 
     */
    constructor ( communicator ) {
        let $this = this;
        this.com = communicator;
        this.isOpen = false;
        this.isClosing = false;
        if ( Common.isEmpty(this.com.options.btAddress) ) {
            throw Error(this.com.$t('selectDevice'));
        }

        this.btSerial = new window.bluetoothSerialPort.BluetoothSerialPort();
        this.btSerial.on('data', function (data) { $this.handleOnData(data); });
        this.btSerial.on('closed', function() { $this.handleOnClose(); })
        this.btSerial.on('failure', function(err) { $this.handleOnFailure(err); })
    }

    /**
     * get if connection is open
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isOpen;
    }

    /**
     * open bluetooth connection
     * @returns {Promise}
     */
    open() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.btSerial.findSerialPortChannel($this.com.options.btAddress, function (channel) {
                $this.btSerial.connect($this.com.options.btAddress, channel, function () {
                    $this.isOpen = true;
                    $this.com.log('open');
                    resolve();
                },function () {
                    reject($this.com.$t('unableToConnectToDevice', [$this.com.options.btAddress]));
                });
            }, function () {
                reject($this.com.$t('unableToFindSerialPortChannel', [$this.com.options.btAddress]));
            });
        });
    }

    /**
     * close the bluetooth connection
     * @returns {Promise}
     */
    close() {
        let $this = this;
        return new Promise(( resolve ) => {
            $this.btSerial.close();
            resolve();
        });
    }

    /**
     * write data to bluetooth connection
     * @param {Buffer} data 
     * @returns {Promise}
     */
    write( data ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.btSerial.write(data, function ( err, bytesWritten) {
                if ( err ) {
                    reject(err);
                    return;
                }
                $this.com.log('write', data);
                $this.com.dataSendSize += bytesWritten;
                resolve(bytesWritten);
            });
        });
    }

    /**
     * handle event on serial port has data come in
     * @param {Buffer} data 
     */
    handleOnData(data) {
        if ( !this.isOpen ) {
            return;
        }
        this.com.log('receive', data);
        this.com.dataReceived(data);
    }

    /**
     * bluetooth disconnected
     */
    handleOnClose() {
        if ( !this.isOpen ) {
            return;
        }

        this.isOpen = false;
        this.com.handleOnClose();
        this.com.log('close');
    }

    /**
     * event handler for connection error
     * @param {Error} err 
     */
    handleOnFailure( err ) {
        throw err;
    }

    /**
     * get device title
     * @returns {String}
     */
     getDeviceTitle() {
        return this.com.options.btAddress;
    }
}