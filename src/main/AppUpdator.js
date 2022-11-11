import fs from 'fs';
import child_process from 'child_process'
import { autoUpdater } from "electron-updater"
import { app, dialog, ipcMain } from 'electron'
import Application from './Application';
const remote = require('@electron/remote/main');
export default class AppUpdator {
    /**
     * 配置更新
     * @param {*} window 
     */
    static setup( window ) {
        let updator = new AppUpdator(window);
        updator.init();
        return updator;
    }

    /**
     * 构造函数
     */
    constructor( window ) {
        this.window = window;
    }

     /**
     * 初始化
     * @listens ipcMain#event:app-update-check
     */
    init() {
        ipcMain.on('app-update-check',() => this.updateCheck() );
        
        let websiteUrl = Application.app().websiteUrl;
        autoUpdater.setFeedURL(`${websiteUrl}/app-update/`);
        autoUpdater.on('checking-for-update', () => this.sendEventMessage('app-update-checking',null));
        autoUpdater.on('update-not-available', () => this.sendEventMessage('app-update-not-available', null));
        autoUpdater.on('update-available', (info) => this.sendEventMessage('app-update-available', info) );
        autoUpdater.on('error', (err) => this.sendEventMessage('app-update-error',err) );
        autoUpdater.on('download-progress', (progress) => this.sendEventMessage('app-update-download-progress', progress));
        autoUpdater.on('update-downloaded', (event) => this.sendEventMessage('app-update-downloaded', event));
        ipcMain.on('app-update-quit-and-install', (e, arg) => autoUpdater.quitAndInstall());
    }

    /**
     * 检查更新
     */
    updateCheck() {
        autoUpdater.checkForUpdates();
    }

    /**
     * 发送步骤消息
     * @param {*} data 
     */
    sendEventMessage(eventName,data) {
        this.window.webContents.send(eventName, data)
    }
}