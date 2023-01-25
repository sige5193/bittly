import UnitTester from '../../utils/test/UnitTester.js';
import AppTitle from '../AppTitle.vue'
describe('@/components/AppTitle.vue', () => {
    it('Menu > Help > HelpAbout', async () => {
        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(AppTitle);

        window.os = {
            type() { return '';},
            arch() { return '';},
            version() { return '';}
        };
        window.remote.process = {
            versions : {
                v8 : 'V8-VERSION',
                node : 'NODE-VERSION',
                chrome : 'CHROME-VERSION',
                electron : 'ELECTRON-VERSION',
            },
        };
        await tester.dropdownMenuClick({ref:'dmenuTriggerHelp'}, {ref:'menuHelp'}, {
            key:'HelpAbout',
            domEvent:{target:{dataset:{}}}
        });
        expect(tester.wrapper.vm.$refs.appAbout.enabled).toBeTruthy();
    });
    
    it('Menu > Tools > Serialport Server', async () => {
        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(AppTitle);

        let windowIpcRendererSend = jest.fn();
        window.ipcRenderer.send = windowIpcRendererSend;
        await tester.dropdownMenuClick(
            {ref:'dmenuTriggerConfigurableMenu',index:0}, 
            {ref:'dmenuConfigurableMenu',index:0}, 
            {
                key:'ToolSerialportServer',
                domEvent:{target:{dataset:{menuKey:'tools',itemIndex : 0}}}
            }
        );
        expect(windowIpcRendererSend.mock.calls[0][1].uri).toBe('/tool-serialport-server.html');
    });

    it('Menu > Help > GetStart', async () => {
        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(AppTitle);

        let windowShellOpenExternal = jest.fn();
        window.shell.openExternal = windowShellOpenExternal;
        await tester.dropdownMenuClick({ref:'dmenuTriggerHelp'}, {ref:'menuHelp'}, {
            key:'HelpGetStart',
            domEvent:{target:{dataset:{}}}
        });
        expect(windowShellOpenExternal.mock.calls[0][0]).toBe('https://bittly.sigechen.com/manual?src=bittly');
    });

    it('basic', async ( ) => {
        window.remote = {};
        window.os = {type(){},arch(){},version(){return 'Windows 7'}};
        
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => true,
            },
        });
        await tester.setup();
        await tester.mount(AppTitle);

        // File > Setting
        await tester.dropdownMenuClick({ref:'dmenuTriggerFile'}, {ref:'menuFile'}, {
            key:'FileSetting',
            domEvent:{target:{dataset:{}}}
        });
        expect(tester.wrapper.vm.$refs.appSetting.enabled).toBeTruthy();

        // File > Enable always on top
        let windowRemoteSetAlwaysOnTop = jest.fn();
        window.remote.getCurrentWindow = () => {
            return {setAlwaysOnTop : windowRemoteSetAlwaysOnTop}
        };
        await tester.dropdownMenuClick({ref:'dmenuTriggerFile'}, {ref:'menuFile'}, {
            key:'FileToggleAlwaysOnTop',
            domEvent:{target:{dataset:{}}}
        });
        expect(windowRemoteSetAlwaysOnTop).toBeCalled();

        // File > Open Dev Tools
        let windowRemoteOpenDevTools = jest.fn();
        window.remote.getCurrentWebContents = () => {
            return {openDevTools : windowRemoteOpenDevTools};
        };
        await tester.dropdownMenuClick({ref:'dmenuTriggerFile'}, {ref:'menuFile'}, {
            key:'FileOpenDevTools',
            domEvent:{target:{dataset:{}}}
        });
        expect(windowRemoteOpenDevTools).toBeCalled();

        // File > Close
        let oldWindowClose = window.close;
        window.close = jest.fn();
        await tester.dropdownMenuClick({ref:'dmenuTriggerFile'}, {ref:'menuFile'}, {
            key:'FileExit',
            domEvent:{target:{dataset:{}}}
        });
        expect(window.close).toBeCalled();
        window.close = oldWindowClose;

        // Help > HelpFeedback
        let menuHelpFeedbackClicked = jest.fn();
        tester.eventBusOn('menu-help-feedback-clicked', menuHelpFeedbackClicked);
        await tester.dropdownMenuClick({ref:'dmenuTriggerHelp'}, {ref:'menuHelp'}, {
            key:'HelpFeedback',
            domEvent:{target:{dataset:{}}}
        });
        expect(menuHelpFeedbackClicked).toBeCalled();

        // Help > HelpUpdate
        let menuHelpHelpUpdateClicked = jest.fn();
        tester.eventBusOn('menu-help-update-clicked', menuHelpHelpUpdateClicked);
        await tester.dropdownMenuClick({ref:'dmenuTriggerHelp'}, {ref:'menuHelp'}, {
            key:'HelpUpdate',
            domEvent:{target:{dataset:{}}}
        });
        expect(menuHelpHelpUpdateClicked).toBeCalled();

        // Window handler
        let windowMinimize = jest.fn();
        let windowIsMaximized = jest.fn();
        let windowRestore = jest.fn();
        let windowMaximize = jest.fn();
        window.remote.getCurrentWindow = () => { return {
            minimize : windowMinimize,
            isMaximized : windowIsMaximized,
            restore : windowRestore,
            maximize : windowMaximize,
        }};
        await tester.trigger({ref:'btnWinMinSize'},'click');
        expect(windowMinimize).toBeCalled();

        windowIsMaximized.mockImplementationOnce(() => true);
        await tester.trigger({ref:'btnWinMaxSize'}, 'click');
        expect(windowRestore).toBeCalled();

        windowIsMaximized.mockImplementationOnce(() => false);
        await tester.trigger({ref:'btnWinMaxSize'}, 'click');
        expect(windowMaximize).toBeCalled();

        window.close = jest.fn();
        tester.wrapper.vm.$confirm = jest.fn(opt => opt.onOk());
        await tester.trigger({ref:'btnWinClose'}, 'click');
        expect(window.close).toBeCalled();
    });
});