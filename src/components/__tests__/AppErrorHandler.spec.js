import UnitTester from '../../utils/test/UnitTester.js';
import AppErrorHandler from '../AppErrorHandler.vue'
describe('@/components/AppErrorHandler.vue', () => {
    let consoleError = null;
    beforeEach(() => {
        consoleError = window.console.error;
        window.console.error = () => {};
    });
    afterEach(() => {
        window.console.error = consoleError;
    });
    
    it('global unhandled rejection handler', async ( ) => {
        let bittlyApiErrorReport = jest.fn();
        let tester = new UnitTester({
            mockBittlyApiClient : {
                errorReport : bittlyApiErrorReport,
            },
        });

        await tester.setup();
        let winEventHandlers = {};
        window.addEventListener = (name, callback ) => {
            winEventHandlers[name] = callback;
        }

        await tester.mount(AppErrorHandler);
        expect(tester.exists({ref:'iconError'})).toBeFalsy();

        winEventHandlers['unhandledrejection']({
            preventDefault(){},
            reason : 'TEST-REASON',
        });

        await tester.msleep(200);
        expect(tester.exists({ref:'iconError'})).toBeTruthy();
        expect(tester.exists({ref:'modalErrorInfo'})).toBeTruthy();
        expect(tester.text('.error-message')).toBe('TEST-REASON');
        expect(bittlyApiErrorReport.mock.calls[0][0].message).toBe('TEST-REASON');
        await tester.click({ref:'btnErrorIgnore'});

        // undefined reason
        winEventHandlers['unhandledrejection']({preventDefault(){},reason : undefined});
        await tester.msleep(200);
        expect(tester.exists({ref:'iconError'})).toBeTruthy();
        expect(tester.exists({ref:'modalErrorInfo'})).toBeTruthy();
        expect(tester.text('.error-message')).toBe('Empty Rejection Message');
        expect(bittlyApiErrorReport.mock.calls[1][0].message).toBe('Empty Rejection Message');
    })

    it('global error handler', async ( ) => {
        let tester = new UnitTester({
            mockBittlyApiClient : {
                errorReport : (errorInfo) => {
                    expect(errorInfo.message).toBe('TEST-ERROR');
                }
            },
        });
        await tester.setup();
        
        let winEventHandlers = {};
        window.addEventListener = (name, callback ) => {
            winEventHandlers[name] = callback;
        }

        await tester.mount(AppErrorHandler);
        expect(tester.exists({ref:'iconError'})).toBeFalsy();
        winEventHandlers['error']({
            preventDefault(){},
            error : 'TEST-ERROR',
        });

        await tester.msleep(1000);
        expect(tester.exists({ref:'iconError'})).toBeTruthy();
        expect(tester.exists({ref:'modalErrorInfo'})).toBeTruthy();
        expect(tester.text('.error-message')).toBe('TEST-ERROR');
    })

    it('vue error handler', async () => {
        let testCom = {
            name : 'TEST-COM',
            components : {AppErrorHandler},
            template : '<div><AppErrorHandler ref="errorHandler"/> <button class="test" @click="testClick">xxx</button></div>',
            methods : {
                testClick() {
                    throw Error("TEST-ERROR");
                },
            },
        };
        
        let tester = new UnitTester({
            mockBittlyApiClient : {
                errorReport : (error) => {
                    expect(error.message).toBe('TEST-ERROR');
                }
            },
        });
        await tester.setup();
        await tester.mount(testCom);
        await tester.click('.test');
        await tester.msleep(200);
        
        let errorHandler = tester.wrapper.findComponent({ref:'errorHandler'});
        expect(tester.exists({ref:'modalErrorInfo'}, errorHandler)).toBeTruthy();
        
        await tester.click({ref:'btnErrorIgnore'}, errorHandler);
        expect(tester.exists({ref:'modalErrorInfo'}, errorHandler)).toBeFalsy();
    })

    it('vue error handler with string error', async () => {
        let testCom = {
            name : 'TEST-COM',
            components : {AppErrorHandler},
            template : '<div><AppErrorHandler ref="errorHandler"/> <button class="test" @click="testClick">xxx</button></div>',
            methods : {
                testClick() {
                    throw "TEST-ERROR";
                },
            },
        };
        
        let tester = new UnitTester({
            mockBittlyApiClient : {
                errorReport : (error) => {
                    expect(error.message).toBe('TEST-ERROR');
                }
            },
        });
        await tester.setup();
        await tester.mount(testCom);
        await tester.click('.test');
        await tester.msleep(200);
        
        let errorHandler = tester.wrapper.findComponent({ref:'errorHandler'});
        expect(tester.exists({ref:'modalErrorInfo'}, errorHandler)).toBeTruthy();
        
        await tester.click({ref:'btnErrorIgnore'}, errorHandler);
        expect(tester.exists({ref:'modalErrorInfo'}, errorHandler)).toBeFalsy();
    })

    it('contact actions', async () => {
        let tester = new UnitTester({
            mockBittlyApiClient : { errorReport : () => {} },
        });
        await tester.setup();
        let winEventHandlers = {};
        window.addEventListener = (name, callback ) => {
            winEventHandlers[name] = callback;
        }

        await tester.mount(AppErrorHandler);
        expect(tester.exists({ref:'iconError'})).toBeFalsy();

        winEventHandlers['error']({preventDefault(){}, error : 'TEST-ERROR'});
        await tester.msleep(1500);

        expect(tester.exists({ref:'iconError'})).toBeTruthy();

        window.shell = {openExternal : jest.fn()};
        await tester.click({ref:'iconStartQQ'});
        await tester.click({ref:'iconStartQQGroup'});
        expect(window.shell.openExternal).toBeCalledTimes(2);

        await tester.click({ref:'iconError'});
        expect(tester.exists({ref:'modalErrorInfo'}));
    });
});