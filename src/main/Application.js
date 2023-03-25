import AppUpdator from './AppUpdator';
import { app, BrowserWindow, session, ipcMain } from 'electron'
import WindowManager from './WindowManager.js'
import SystemController from './controllers/SystemController.js'
/**
 * @var {Application}
 */
let applicationInstance = null;
/**
 * 
 */
export default class Application {
    /**
     * 配置应用
     */
    static setup() {
        applicationInstance = new Application();
        return applicationInstance;
    }

    /**
     * @returns {Application}
     */
    static app() {
        return applicationInstance;
    }

    /**
     * constructor of application
     */
    constructor() {
        /**
         * @property {BrowserWindow}
         */
        this.mainWindow = null;
        /**
         * @property {Array<Callback>}
         */
        this.mainWindowAppReadyCallbacks = [];
        /**
         * @property {Object<String:Object>}
         */
        this.controllers = {'system' : SystemController};

        this.isDevelopment = process.env.NODE_ENV !== 'production'
        this.websiteUrl = 'https://bittly.sigechen.com';
        if ( this.isDevelopment ) {
            this.websiteUrl = 'http://server.bittly.local';
        }
        this.windowMan = new WindowManager();
    }

    /**
     * 创建主窗口
     */
    async createMainWindow() {
        this.log('Application:createMainWindow() => start');
        
        let windowList = [
            'index',
            'tool-tcp-server',
            'tool-udp-server',
            'tool-ws-server',
            'tool-serialport-server',
        ];

        let view = 'index';
        if ( process.argv[0].endsWith('Bittly.exe') && 2 == process.argv.length ) {
            view = process.argv[1];
        }
        if ( process.argv[0].endsWith('electron.exe') && 3 == process.argv.length ) {
            view = process.argv[2];
        }
        if ( -1 == windowList.indexOf(view) ) {
            view = 'index';
        }
        
        this.mainWindow = await this.windowMan.createWindow(`/${view}.html`, {show:false});
        this.mainWindow.maximize();
        this.setupAppByView(view);
        AppUpdator.setup(this.mainWindow);
        this.log('Application:createMainWindow() => done');
    }
    
    /**
     * @param {*} view 
     * @returns 
     */
    setupAppByView( view) {
        if ( 'index' !== view ) {
            this.mainWindow.show();
            return;
        }

        const singleLock = app.requestSingleInstanceLock();
        if ( !singleLock ) {
            app.quit();
            return;
        }

        this.mainWindowAppReadyCallbacks.push(
            () => this.checkCommandArgvToFireOpenShareLinkEvent(process.argv)
        );
        this.mainWindow.show();
    }

    /**
     * 应用退出前执行
     * @event
     */
    beforeQuit( event ) {}

    /**
     * 所有窗口关闭
     * @event
     */
    windowAllClosed() {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    }

    activate() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            this.createMainWindow();
        }
    }
    ready() {
        if (this.isDevelopment && !process.env.IS_TEST) {
            let vueDevToolPath = 'C:/Users/Lenovo/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.5.0_1';
            session.defaultSession.loadExtension(vueDevToolPath).then(({ id }) => {})
        }
        this.createMainWindow();
    }
    /**
     * 运行应用
     */
    run() {
        this.bindAppEventHandler();
    }

    /**
     * fire event `open-share-link` if needed.
     * @param {Array<String>} argv 
     */
    checkCommandArgvToFireOpenShareLinkEvent( argv ) {
        for ( let i=0; i<argv.length; i++ ) {
            // match share link
            let shareMatch = argv[i].match(/^bittly:\/\/share\/(?<id>.*?)$/);
            if ( null !== shareMatch ) {
                this.mainWindow.webContents.send('open-share-link', {shareId:shareMatch.groups.id});
                this.log(`Application:checkCommandArgvToFireOpenShareLinkEvent() => send open-share-link(${shareMatch.groups.id})`);
            }
        }
    }

    /**
     * event handler to handle app event `second-instance`.
     * @link https://www.electronjs.org/docs/latest/api/app#event-second-instance
     * @link https://doc.sigechen.com/docs/electron/app
     * @private
     * @param {Event} event
     * @param {Array<String>} commandLine
     * @param {String} workingDirectory
     */
    onSecondInstance( event, commandLine, workingDirectory ) {
        this.log(`Application:onSecondInstance(event, [${commandLine.join(',')}], wd)`);
        this.checkCommandArgvToFireOpenShareLinkEvent(commandLine);
    }

    /**
     * event handler on window app ready, as main window, this event 
     * trigger by directive module after entry inited.
     */
    onWindowAppReady() {
        for ( let i=0; i<this.mainWindowAppReadyCallbacks.length; i++ ) {
            this.mainWindowAppReadyCallbacks[i]();
        }
    }

    /**
     * handle request from render to deal with main process
     * @param {IpcMainInvokeEvent} event
     * @param {Object} request
     */
    async onMainControllRequest( event, request ) {
        this.log('Application::onMainControllRequest('+JSON.stringify(request)+')');
        
        let controllName = null;
        let actionName = request.action;
        actionName = actionName.split('/');
        controllName = actionName[0];
        actionName = actionName[1];
        actionName = 'action' + actionName.split('-').map((item) => item[0].toUpperCase() + item.substr(1)).join('');

        let controllerClass = this.controllers[controllName];
        let controller = new (controllerClass)();
        return await controller[actionName](request.params);
    }

    /**
     * open a new window
     * @param {Object} event 
     * @param {Object} data 
     */
    async windowOpen( event, data ) {
        let uri = data.uri;
        let options = data;
        await this.windowMan.createWindow(uri, options);
    }

    /**
     * 绑定 app 事件
     */
    bindAppEventHandler() {
        let $this = this;
        app.on('before-quit', (event) => { $this.beforeQuit(event); });
        app.on('window-all-closed', () => { $this.windowAllClosed(); });
        app.on('activate', () => { $this.activate(); });
        app.on('ready', async () => { $this.ready(); });
        app.on('second-instance', (event, commandLine, workingDirectory) => this.onSecondInstance(event, commandLine, workingDirectory));
        
        ipcMain.on('window-app-ready', () => this.onWindowAppReady());
        ipcMain.on('app-log', (event, message) => this.log(message));
        ipcMain.on("window-open",(event, data ) => this.windowOpen(event, data));
        ipcMain.handle('main-controll-request', (event, request) => this.onMainControllRequest(event, request));
    }

    /**
     * output log message to console.
     * @param {*} messages 
     */
    log (... messages ) {
        let message = messages.join(' ');
        
        let time = new Date();
        let timeStr = [
            time.getHours().toString().padStart(2, '0'), ':',
            time.getMinutes().toString().padStart(2, '0'), ':',
            time.getSeconds().toString().padStart(2, '0'), '.',
            time.getMilliseconds().toString().padStart(3, '0'),
        ].join('');
        message = `[${timeStr}] ${message}`;
        console.log(message);
    }
}