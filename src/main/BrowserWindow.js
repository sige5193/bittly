import electron from 'electron'
import Application from './Application.js'
export default class BrowserWindow extends electron.BrowserWindow {
    /**
     * constructor of BrowserWindow
     * @param {Object} options 
     */
    constructor( options ){
        super(options);

        this.webContents.on(
            'select-bluetooth-device', 
            (event, devices, callback) => this.onWebContentsSelectBluetoothDevice(event, devices, callback)
        );
    }

    /**
     * event handler for webcontents 'select-bluetooth-device'
     * @param {Event} event 
     * @param {*} devices 
     * @param {CallableFunction} callback 
     */
    onWebContentsSelectBluetoothDevice(event, devices, callback) {
        event.preventDefault();
        Application.app().log('bluetooth-device-found', JSON.stringify(devices));
        
        electron.ipcMain.removeAllListeners('select-bluetooth-device-selected');
        electron.ipcMain.on('select-bluetooth-device-selected',(event, deviceId) => {
            callback(deviceId);
        });
    
        this.webContents.send('select-bluetooth-device-refresh', devices);
    }
}