import Tester from '../../../utils/test/UnitTester.js'
import Executor from '../Executor.js'
import MdbDirective from '@/models/MdbDirective.js'
import HttpMocker from '../communicators/http/HttpMocker.js'
import HttpRequestParamBuilder from '../communicators/http/RequestParamBuilder.js'
import MockSerialport from '../communicators/serialport/__tests__/mocks/MockSerialport.js'
describe('@/src/modules/directive/Executor.js', () => {
    it('basic', async ( done ) => {
        HttpMocker.mock();

        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {
            type : 'Http',
            httpMethod : 'POST',
            httpUrl : 'https://www.baidu.com',
            httpFollowRedirectEnable : false,
        };
        directive.requestFormat = 'text';
        directive.requestContent = {text:"how are you ?"};

        let executor = new Executor(directive);
        executor.onData((data) => {
            expect(data.toString()).toBe('how are you ?');
            expect(executor.getParamBuilder()).toBeInstanceOf(HttpRequestParamBuilder);
            expect(executor.getResponseAsString()).toBe('how are you ?');
            expect(executor.getRequestBuffer().toString()).toBe('how are you ?');
            expect(executor.getResponseBuffer().toString()).toBe('how are you ?');
            expect(executor.getResponseAsBytes().toString()).toBe('how are you ?');
            done();
        });
        await executor.execute();
    })

    it('custom parameters', async () => {
        let serialport = MockSerialport.setup();
        serialport.enableEcho = false;

        let tester = new Tester();
        await tester.setup();
        await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.target = {type:"SerialPort",parity:"none",stopBits:"1",dataBits:"8",baudRate:"9600",path:"COM4"};
        directive.requestFormat = 'text';
        directive.requestContent = {text:"how are you ?"};
        directive.responseFormatter = {fields:[
            {key:0,name:"head",type:"string",length:5},
            {key:1,name:"tail",type:"string",length:5}
        ]};

        let executor = new Executor(directive);
        expect(executor.getResponseAsBytes().length).toBe(0);
        executor.setCustomParams('text', 'HELLO');
        await executor.execute();
        await tester.msleep(200);

        expect(serialport.write).toBeCalled();
        let data = serialport.write.mock.calls[0][1];
        serialport.response(data);
        await tester.msleep(200);
        serialport.response(data);
        await tester.msleep(200);

        let response = executor.getResponseAsForm();
        expect(response.getValueByName('head')).toBe('HELLO');
        expect(response.getValueByName('tail')).toBe('HELLO');
    })
});