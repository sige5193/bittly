import UnitTester from '../../utils/test/UnitTester.js';
import AppUpdate from '../AppUpdate.vue'
import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
describe('@/components/AppUpdate.vue', () => {
    it('update', async () => {
        let appUpdateQuitAndInstall = jest.fn();

        let ipcRendererCallbacks = {};
        window.ipcRenderer = {
            on ( name, callback ) {
                ipcRendererCallbacks[name] = callback;
            },
            send(name) {
                switch ( name ) {
                case 'app-update-check' : setTimeout(ipcRendererCallbacks['app-update-checking'], 10); break;
                case 'app-update-quit-and-install' : appUpdateQuitAndInstall(); break;
                default : throw Error(`window.ipcRenderer.send("${name}") does not support`);
                }
            }
        };

        let tester = new UnitTester({
            mockBittlyApiClient : {
                systemUpdateCheck() {
                    return {success : true,data : {version : '1.0.0.',}};
                },
            }
        });
        await tester.setup();
        await tester.mount(AppUpdate, true);
        await tester.msleep(200);
        
        // open update dialog
        await tester.click('.app-update-btn');
        // click update button
        await tester.click({ref:'btnUpdate'});
        await tester.msleep(200);
        // make update available
        ipcRendererCallbacks['app-update-available'](null, {});
        await tester.msleep(200);
        // downloading
        ipcRendererCallbacks['app-update-download-progress'](null, {percent:100});
        await tester.msleep(200);
        // downloading completed
        ipcRendererCallbacks['app-update-downloaded']();
        await tester.msleep(200);
        expect(appUpdateQuitAndInstall).toBeCalled();
    });

    it('app update available but download not available', async () => {
        let ipcRendererCallbacks = {};
        window.ipcRenderer = {
            on ( name, callback ) {
                ipcRendererCallbacks[name] = callback;
            },
            send(name) {
                switch ( name ) {
                case 'app-update-check' : setTimeout(ipcRendererCallbacks['app-update-checking'], 10); break;
                default : throw Error(`window.ipcRenderer.send("${name}") does not support`);
                }
            }
        };

        let tester = new UnitTester({
            mockBittlyApiClient : {
                systemUpdateCheck() {
                    return {success : true,data : {version : '1.0.0.'}};
                },
            }
        });
        await tester.setup();

        await MdbRuntimeVariable.setVarValue('update_check_version', '0.0.0');
        await tester.mount(AppUpdate, true);
        await tester.msleep(200);
        await tester.eventBusEmit('menu-help-update-clicked');
        await tester.msleep(200);
        ipcRendererCallbacks['app-update-not-available'](null, {});
    });

    it('app update not available', async () => {
        window.ipcRenderer = {
            on ( name, callback ) {},
            send(name) {}
        };

        let systemUpdateCheckApi = jest.fn(() => { return {success : true, data : null}; });
        let tester = new UnitTester({
            mockBittlyApiClient : {
                systemUpdateCheck:systemUpdateCheckApi,
            }
        });
        await tester.setup();

        await MdbRuntimeVariable.setVarValue('update_check_version', '0.0.0');
        await tester.mount(AppUpdate, true);
        await tester.msleep(200);

        // not available by failed to call api
        systemUpdateCheckApi.mockImplementationOnce(() => { return {success : false, data : null}; });
        await tester.eventBusEmit('menu-help-update-clicked');
        await tester.msleep(200);
        expect(tester.wrapper.vm.release).toBeNull();

        // not available by no update info
        systemUpdateCheckApi.mockImplementationOnce(() => { return {success : true, data : null}; });
        await tester.eventBusEmit('menu-help-update-clicked');
        await tester.msleep(200);
        expect(tester.wrapper.vm.release).toBeNull();
    });

    it('update ignore', async () => {
        let ipcRendererCallbacks = {};
        window.ipcRenderer = {
            on ( name, callback ) {
                ipcRendererCallbacks[name] = callback;
            },
            send(name) {
                switch ( name ) {
                case 'app-update-check' : setTimeout(ipcRendererCallbacks['app-update-checking'], 10); break;
                default : throw Error(`window.ipcRenderer.send("${name}") does not support`);
                }
            }
        };

        let tester = new UnitTester({
            mockBittlyApiClient : {
                systemUpdateCheck() {
                    return {success : true,data : {version : '1.0.0.'}};
                },
            }
        });
        await tester.setup();

        await MdbRuntimeVariable.setVarValue('update_check_version', '0.0.0');
        await tester.mount(AppUpdate, true);
        await tester.msleep(200);
        await tester.eventBusEmit('menu-help-update-clicked');
        await tester.msleep(200);
        await tester.click({ref:'btnIgnore'});
        await tester.msleep(200);
    });

    it('update error', async () => {
        let ipcRendererCallbacks = {};
        window.ipcRenderer = {
            on ( name, callback ) {
                ipcRendererCallbacks[name] = callback;
            },
            send(name) {
                switch ( name ) {
                case 'app-update-check' : setTimeout(ipcRendererCallbacks['app-update-checking'], 10); break;
                default : throw Error(`window.ipcRenderer.send("${name}") does not support`);
                }
            }
        };

        let tester = new UnitTester({
            mockBittlyApiClient : {
                systemUpdateCheck() {
                    return {success : true,data : {version : '1.0.0.'}};
                },
            }
        });
        await tester.setup();

        await MdbRuntimeVariable.setVarValue('update_check_version', '0.0.0');
        await tester.mount(AppUpdate, true);
        await tester.msleep(200);
        await tester.eventBusEmit('menu-help-update-clicked');
        await tester.msleep(200);
        ipcRendererCallbacks['app-update-error'](null, {message:'TEST-MESSAGE'});
        await tester.msleep(200);
    });
});