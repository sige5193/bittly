import CommunicatorBase from '../CommunicatorBase.js'
describe('@/communicators/CommunicatorBase.js', () => {
    it('basic', async () => {
        window.app = {
            $message : {warning : jest.fn()},
            $t : ( key ) => key,
            $store : { commit : jest.fn() }
        };

        let ComClass = class extends CommunicatorBase {};
        
        let com = new ComClass();
        com.setDirective(null);
        expect(() => {com.getIsOpen()}).toThrowError();
        expect(() => {com.open()}).toThrowError();
        expect(() => {com.close()}).toThrowError();
        expect(() => {com.write(null)}).toThrowError();
        expect(com.getDeviceType()).toBeNull();

        // param builder default to null
        expect(com.getParamBuilder()).toBeNull();

        com.toast('i18n.key', []);
        expect(window.app.$message.warning).toBeCalled();

        // empty check
        expect(() => com.optionRequireCheck(null,'i18n.key')).toThrowError();

        // online & offline
        com.deviceOnline();
        expect(window.app.$store.commit.mock.calls[0][0]).toBe('communicatorOnline');
        com.deviceOffline();
        expect(window.app.$store.commit.mock.calls[1][0]).toBe('communicatorOffline');

        // log
        let oldConsoleLog = window.console.log;
        window.console.log = jest.fn();
        window.envName = 'test';
        com.log('xxx')
        expect(window.console.log).not.toBeCalled();
        window.envName = 'dev';
        com.log('yyy');
        expect(window.console.log).toBeCalled();
        expect(window.console.log.mock.calls[0][1]).toBe('yyy');
        window.console.log = oldConsoleLog;
        window.envName = 'test';
    })

    it('CommunicatorBase#applyEnvPlaceholderVariables', async () => {
        let ComClass = class extends CommunicatorBase {}
        window.app = {
            $store : {
                getters : {
                    envVariables : {
                        test: {value:'---'}
                    },
                }
            }
        };

        let com = new ComClass();
        expect(com.applyEnvPlaceholderVariables('xxx')).toBe('xxx');
        expect(com.applyEnvPlaceholderVariables('x{{env.test}}|{{env.test}}')).toBe('x---|---');
        expect(com.applyEnvPlaceholderVariables('x{{env.none}}x')).toBe('xx');
    })

    it('data Send / Received', async () => {
        let ComClass = class extends CommunicatorBase {}
        let com = new ComClass();
        let onDataHandler = jest.fn();
        com.onData(onDataHandler);
        com.dataReceived('123');
        com.dataReceived(new ArrayBuffer(8));
        expect(com.getDataReceiveSize()).toBe(11);
        expect(com.getDataSendSize()).toBe(0);
    })
});