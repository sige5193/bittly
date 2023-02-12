import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import RequestParamBuilder from '../../../parameters/Builder.js';
import MockSerialport from './mocks/MockSerialport.js';
describe('@/communicators/serialport/Communicator.js', () => {
    it('basic', async ( done ) => {
        MockSerialport.setup();

        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();
        
        let list = await Communicator.list();
        expect(list.length).toBe(0);

        let testContent = 'TEST-CONTENT';
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {
            path : 'COM8',
            baudRate : '9600'
        };
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = testContent;

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBe(com);
        
        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(testContent);
            expect(com.getDataReceiveSize()).toBe(testContent.length);
            await com.close();
            await tester.msleep(500);
            expect(tester.wrapper.vm.$store.getters.communicators[com.comkey]).toBeUndefined();
            done();
        });
        
        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
    });

    it('debug serialport failed test', async () => {
        let tester = new Tester();
        let mock = MockSerialport.setup();
        await tester.setup();
        await tester.activeNewProject();
        
        let testContent = 'TEST-CONTENT';
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {
            path : 'COM9',
            baudRate : '9600'
        };
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = testContent;

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        try {
            // failed to open at first time.
            mock.open.mockImplementationOnce(($this,callback) => callback({message:'OPEN-FAILED-TEST'}));
            await com.open();
            expect(true).toBeFalsy();
        } catch ( errMessage ) {
            expect(errMessage).toBe('Unable to open serial port device COM9 : OPEN-FAILED-TEST');
            await com.open();
            expect(com.getIsOpen()).toBeTruthy();
        }

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        try {
            // trigger an error on write data
            mock.write.mockImplementationOnce(($this,data,callback) => callback({message:'WRITE-FAILED-TEST'}));
            await com.write(paramBuilder.getRequestData());
            expect(true).toBeFalsy();
        } catch ( errMessage ) {
            expect(errMessage).toBe('Unable to write serial port device COM9 : WRITE-FAILED-TEST');
            await com.write(paramBuilder.getRequestData());
            await tester.msleep(200);
        }

        try {
            // failed to close at first time.
            mock.close.mockImplementationOnce(($this,callback) => {
                callback({message:'CLOSE-FAILED-TEST'});
                mock.eventHandlers.close({disconnected:true});
            });
            await com.close();
            expect(true).toBeFalsy();
        } catch ( errMessage ) {
            expect(errMessage).toBe('Unable to close serial port device COM9 : CLOSE-FAILED-TEST');
        }
    });
});