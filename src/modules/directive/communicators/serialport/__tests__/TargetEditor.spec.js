import Tester from '../../../../../utils/test/UnitTester.js'
import TargetEditor from '../TargetEditor.vue'
import MockSerialport from './mocks/MockSerialport.js';
describe('@/communicators/serailport/TargetEditor.vue', () => {
    it('basic', async ( ) => {
        MockSerialport.setup();
        let target = {};
        
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : ( newTarget ) => target = newTarget,
            },
            mockStoreGetters : {
                communicators : {},
            },
        });
        await tester.setup();
        await tester.mount(TargetEditor);

        await tester.input({ref:'path'},'COM1');
        await tester.input({ref:'baudRate'},'115200');
        await tester.select({ref:'dataBits'},'5');
        await tester.select({ref:'stopBits'},'2');
        await tester.select({ref:'parity'},'xxx');
        await tester.click({ref:'btnSerialPortRefresh'});

        expect(target.baudRate).toBe('115200');
        expect(target.dataBits).toBe('5');
        expect(target.stopBits).toBe('2');
        expect(target.parity).toBe('xxx');

        let editorConfig = TargetEditor.editorConfig();
        expect(editorConfig.name).toBe('SerialPort');
        expect(editorConfig.defaultDataType).toBe('byte');
        expect(editorConfig.defaultResponseViewer).toBe('hex');
    }, 10000);

    it('auto select device if only one device in list on refresh button clicked', async ( done ) => {
        let mock = MockSerialport.setup();
        mock.list.mockImplementation(() => Promise.resolve([{path:'COM1',friendlyName:'DEV-01'}]));

        let isRefreshed = false;
        let target = {};
        let tester = new Tester({
            props : { value : target},
            listeners : {
                input : ( newTarget ) => {
                    if ( isRefreshed ) {
                        expect(newTarget.path).toBe('COM1');
                        done();
                    }
                },
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        isRefreshed = true;
        await tester.click({ref:'btnSerialPortRefresh'});
    });

    it('device list should be opened after clicking refresh button', async ( ) => {
        let mock = MockSerialport.setup();
        mock.list.mockImplementation(() => {
            return Promise.resolve([{path:'COM1',friendlyName:'DEV-01'},{path:'COM2',friendlyName:'DEV-01'}])
        });

        let target = {};
        let tester = new Tester({
            props : {
                value : target,
            }
        });
        await tester.setup();

        await tester.mount(TargetEditor);
        await tester.click({ref:'btnSerialPortRefresh'});
        expect(tester.wrapper.vm.$data.showSerialportPathList).toBeTruthy();
    });

    it('should auto select device if only one deivce in the list if target path is empty during initation.', async () => {
        let mock = MockSerialport.setup();
        mock.list.mockImplementation(() => Promise.resolve([{path:'COM1',friendlyName:'DEV-01'}]));

        let target = {};
        let tester = new Tester();
        tester.prop('value', target);
        tester.on('input', newTarget => target = newTarget);
        await tester.setup();
        
        await tester.mount(TargetEditor);
        await tester.msleep(500);
        expect(target.path).toBe('COM1');
    });
});