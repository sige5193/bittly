import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import RequestParamBuilder from '../../../parameters/Builder.js';
import SerialPortMocker from '../SerialPortMocker.js'
describe('@/communicators/serialport/Communicator.js', () => {
    it('basic', async ( done ) => {
        let serialportOpen = jest.fn(($this, callback) => {
            $this.isOpen=true; 
            $this.trigger('open');
            callback();
        });
        let serialportWrite = jest.fn(($this, data, callback) => {
            callback();
            setTimeout(()=> $this.trigger('data', data), 10);
        });
        let serialportClose = jest.fn(($this, callback) => {
            $this.isOpen = false;
            $this.trigger('close',null);
            callback();
        });
        SerialPortMocker.mock({
            open : serialportOpen,
            write : serialportWrite,
            close : serialportClose,
        });

        let communicatorOnline = jest.fn();
        let communicatorOffline = jest.fn();

        let tester = new Tester({
            mockStoreCommits : {
                communicatorOnline : communicatorOnline,
                communicatorOffline : communicatorOffline,
            },
        });
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
        expect(communicatorOnline.mock.calls[0][0].key).toBe(com.comkey);
        
        // if we try to open it again, it would not work
        await com.open();
        expect(communicatorOnline.mock.calls.length).toBe(1);

        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(testContent);
            expect(com.getDataReceiveSize()).toBe(testContent.length);
            await com.close();
            await tester.msleep(500);
            expect(communicatorOffline).toBeCalled();
            done();
        });
        
        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await tester.msleep(1000);
    });

    it('serialport failed test', async () => {
        let serialportOpen = jest.fn(($this, callback) => {
            $this.isOpen=true; 
            $this.trigger('open');
            callback();
        });
        let serialportWrite = jest.fn(($this, data, callback) => {
            callback();
        });
        let serialportClose = jest.fn(($this, callback) => {
            $this.isOpen = false;
            $this.trigger('close',null);
            callback();
        });
        SerialPortMocker.mock({
            open : serialportOpen,
            write : serialportWrite,
            close : serialportClose,
        });

        let tester = new Tester();
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

        // path is required
        let setupFailedHandler = jest.fn(() => {});
        try {
            await Communicator.setup({});
        } catch ( e ) {
            setupFailedHandler(e);
        }
        expect(setupFailedHandler.mock.calls.length).toBe(1);
        expect(setupFailedHandler.mock.calls[0][0].message).toBe('Please input serial port device path');

        try {
            await Communicator.setup({path:'COM1'});
        } catch ( e ) {
            setupFailedHandler(e);
        }
        expect(setupFailedHandler.mock.calls.length).toBe(2);
        expect(setupFailedHandler.mock.calls[1][0].message).toBe('Please input serial port device baudrate')

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        try {
            // failed to open at first time.
            serialportOpen.mockImplementationOnce(($this,callback) => callback({message:'OPEN-FAILED-TEST'}));
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
            serialportWrite.mockImplementationOnce(($this,data,callback) => callback({message:'WRITE-FAILED-TEST'}));
            await com.write(paramBuilder.getRequestData());
            expect(true).toBeFalsy();
        } catch ( errMessage ) {
            expect(errMessage).toBe('Unable to write serial port device COM9 : WRITE-FAILED-TEST');
            await com.write(paramBuilder.getRequestData());
            await tester.msleep(200);
        }

        try {
            // failed to close at first time.
            serialportClose.mockImplementationOnce(($this,callback) => {
                callback({message:'CLOSE-FAILED-TEST'});
                $this.trigger('close', {disconnected:true})
            });
            await com.close();
            expect(true).toBeFalsy();
        } catch ( errMessage ) {
            expect(errMessage).toBe('Unable to close serial port device COM9 : CLOSE-FAILED-TEST');
        }

        let consoleLogOld = window.console.log;
        window.console.log = jest.fn();
        com.serialPort.trigger('error',{});
        com.serialPort.trigger('drain',{});
        expect(window.console.log).toBeCalledTimes(2);
        window.console.log = consoleLogOld;
    });
});