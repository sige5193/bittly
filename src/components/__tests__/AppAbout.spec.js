import UnitTester from '../../utils/test/UnitTester.js';
import AppAbout from '../AppAbout.vue'
import packInfo from '../../../package.json'
describe('@/components/AppAbout.vue', () => {
    it('basic', async ( ) => {
        window.os = {
            type(){},
            arch(){},
            version(){},
        };
        window.remote = {
            process : {
                versions : {
                    v8 : 'V8-VERSION',
                    node : 'NODE-VERSION',
                    chrome : 'CHROME-VERSION',
                    electron : 'ELECTRON-VERSION',
                },
            },
        };

        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(AppAbout);
        
        tester.wrapper.vm.show();
        expect(tester.dataGet('enabled')).toBe(true);

        // package version should be same as version in package.json
        expect(tester.dataGet('packInfo').version).toBe(packInfo.version);
    })
});