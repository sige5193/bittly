import { NIL as NIL_UUID } from 'uuid';
import MdbDirective from '../../../../models/MdbDirective.js';
import MdbDirectiveEntry from '../../../../models/MdbDirectiveEntry.js';
import Tester from '../../../../utils/test/UnitTester.js'
import WidgetActionScriptBittly from '../WidgetActionScriptBittly.js'
import SerialPortMocker from '../../../directive/communicators/serialport/SerialPortMocker.js'
describe('@/modules/panel/widget/WidgetActionScriptBittly.js', () => {
    let runtime = {};
    let bittly = null;
    let widget = {};
    let tester = null;

    beforeEach(async () => {
        runtime = {
            variables : {},
            setVariableValue(name, value) {
                this.variables[name] = value;
            },
            getVariableValue(name, value) {
                return this.variables[name];
            },
            requestLogPush() {},
            refresh(){}
        };

        tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();
        bittly = new WidgetActionScriptBittly({
            runtime : runtime,
            projectId : project.id,
            widget : widget,
            component : {scriptDirectives:{}},
        });
    });

    it('get/set variable', async () => {
        bittly.variableSet("var001", "var001");
        expect(bittly.variableGet('var001')).toBe('var001');
    })

    it('execute directive', async () => {
        let directive = new MdbDirective();
        directive.projectId = tester.project.id;
        directive.name = 'TEST';
        directive.target = {type:"SerialPort",path:"COM4",baudRate:"115200",dataBits:"8",stopBits:"1",parity:"none"};
        directive.requestFormat = 'text';
        directive.requestContent = {
            text:'HOW ARE YOU',
            form : [
                {type:'char'},
                {type:'string'}
            ]
        };
        directive.responseFormatter = {
            fields:[{
                key:1657341271981,
                name:"FirstChar",
                type:"char",
                length:1,
                desc:""
            },{
                key:1657341275882,
                name:"OtherChars",
                type:"string",
                length:5,
                desc:""
            }]
        };
        await directive.save();

        let directiveEntry = new MdbDirectiveEntry();
        directiveEntry.type = 'directive';
        directiveEntry.target = directive.id;
        directiveEntry.parentId = NIL_UUID;
        directiveEntry.projectId = tester.project.id;
        await directiveEntry.save();

        // directive faile to execute
        let serialportNotAvailable = jest.fn();
        try {
            await bittly.directiveExecText('TEST','HAHAHA');
            await tester.msleep(200);
        } catch {
            serialportNotAvailable();
        }
        expect(serialportNotAvailable).toBeCalled();
        
        // setup serialport
        let serialportWrite = jest.fn(($this, data, callback) => {
            callback();
            setTimeout(()=> $this.trigger('data', data), 10);
        });
        SerialPortMocker.mock({
            write : serialportWrite,
        });

        // text mode
        let response = await bittly.directiveExecText('TEST', 'hello');
        await bittly.msleep(200);
        expect(bittly.responseReadAsText(response)).toBe('hello');

        // hex mode
        let hexResponse = null;
        await bittly.directiveExecHex("TEST", "AABBCCDD", ( response ) => {
            hexResponse = response;
        });
        await bittly.msleep(200);
        expect(bittly.responseReadAsBytes(hexResponse).toString('hex')).toBe('aabbccdd');

        // form mode
        let formResponse = await bittly.directiveExecForm('TEST',['A','BCDEF']);
        await bittly.msleep(200);
        expect(bittly.responseReadAsForm(formResponse).getValues()).toEqual(["A", "BCDEF"]);

        // default format and params
        let cusResponse = await bittly.directiveExec('TEST');
        await bittly.msleep(200);
        expect(bittly.responseReadAsText(cusResponse)).toBe('HOW ARE YOU');

        // directive not exists
        tester.expectError(
            async () => await bittly.directiveExecText('NOT-EXISTS', 'hello'),
            'Unable to find directive : NOT-EXISTS'
        );
        await tester.msleep(200);

        // bad form param
        tester.expectError(
            async () => await bittly.directiveExecForm('TEST','HAHAHA'),
            'Parameters to directive parameter form is not supportted.'
        );
        await tester.msleep(200);
        
        // parameter length not match
        tester.expectError(
            async () => await bittly.directiveExecForm('TEST',['A','BCDEF','CCC','DDDD']),
            'Parameter length to directive not match, directive parameter length : 2, Actual parameter length : 4'
        );
        await tester.msleep(200);
        
        // directive does not support form
        directive.requestContent.form = undefined;
        directive.save();
        tester.expectError(
            async () => await bittly.directiveExecForm('TEST',['A','BCDEF']),
            '[TEST] does not support form as parameter format.'
        );
        await tester.msleep(200);
    }, 20000)
});