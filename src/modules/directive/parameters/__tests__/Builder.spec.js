import MdbDirective from '../../../../models/MdbDirective.js'
import Builder from '../Builder.js'
import Tester from '../../../../utils/test/UnitTester.js'
import TextBuildHandler from '../text/BuildHandler.js'
import HexBuildHandler from '../hex/BuildHandler.js'
import FormBuildHandler from '../form/BuildHandler.js'
import FileBuildHandler from '../file/BuildHandler.js'
import NoneBuilderHandler from '../none/BuilderHandler.js'
describe('@/modules/directive/parameter/Builder.js', () => {
    it('basic', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestFormat = 'text';
        directive.requestContent = {text:'TEXT'};

        let builder = new Builder(directive);
        await builder.init();
        let requestData = builder.getRequestData();
        expect(requestData.toString()).toBe('TEXT');

        // get cached request data
        expect(builder.getRequestData()).toBe(requestData);
    })

    it('custom params', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        
        let builder = new Builder(directive);
        await builder.init();
        // this not work
        builder.setCustomParams(null, '414243');
        // this works
        builder.setCustomParams('hex', '414243');
        let requestData = builder.getRequestData();
        expect(Buffer.from(requestData).toString()).toBe('ABC');
    })

    it('execute quick call', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        
        let builder = new Builder(directive);
        await builder.init();
        
        // basic call
        expect(builder.applyQuickCallToString("He{{@echo(LL)}}o",'')).toBe('HeLLo');

        // key word : $content 
        expect(builder.applyQuickCallToString("{{@echo($content)}}",'HELLO')).toBe('HELLO');

        // index param placeholder : $1, $2, $3
        expect(builder.applyQuickCallToString("{{@echo($1)}}{{@echo($3)}}",'ABC')).toBe('AC');
        tester.expectError(() => builder.applyQuickCallToString("{{@echo($5)}}",'ABC'), 'In "{{@echo($5)}}" the quick call "echo" parameter index "$5" does not exists.');
        
        // empty param list
        expect(builder.applyQuickCallToString("{{@echo()}}",'')).toBe('undefined');
    })

    it('execute script', async () => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestScript = '';

        // empty script
        let builder = new Builder(directive);
        await builder.init();
        tester.expectError(() => builder.getScriptResult(), 'you can only get script result after process parameters.');
        expect(builder.executeRequestScript()).toEqual({});
        expect(builder.executeRequestScript()).toEqual({});
        expect(builder.getScriptResult()).toEqual({});

        // basic script
        directive.requestScript = '$this.variableSet("varName","varValue");';
        builder = new Builder(directive);
        await builder.init();
        expect(builder.executeRequestScript()).toEqual({varName:'varValue'});
        // apply result
        expect(builder.applyScriptResultToString("{{varName}}")).toBe('varValue');
    });

    it('apply env variables', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        window.app.$store.getters.envVariables = {
            envName : {value:'ENV-VALUE'}
        };
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        
        let builder = new Builder(directive);
        await builder.init();
        expect(builder.applyEnvVariablesToString("{{env.envName}}")).toBe('ENV-VALUE');
    })

    it('apply value variables', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        
        let builder = new Builder(directive);
        await builder.init();
        builder.setVariable('VALUE');
        expect(builder.applyVariableValueToString("{{value}}")).toBe('VALUE');
    })

    it('utils', async() => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;

        // convertStringToRealString : nlstyle = DEFAULT
        let builder = new Builder(directive);
        await builder.init();
        tester.expectError(() => builder.convertStringToRealString("xx\\1\\1xx"), 'failed to parse string \"xx\\1\\1xx\" : Octal escape sequences are not allowed in strict mode.');
        
        // convertStringToRealString : nlstyle = CRLF
        directive.nlstyle = 'CRLF';
        builder = new Builder(directive);
        await builder.init();
        expect(builder.convertStringToRealString("x\r\nx")).toBe("x\r\nx");
        expect(builder.convertStringToRealString("x\nx")).toBe("x\r\nx");
        expect(builder.convertStringToRealString("x\rx")).toBe("x\r\nx");

        // convertStringToRealString : nlstyle = CR
        directive.nlstyle = 'CR';
        builder = new Builder(directive);
        await builder.init();
        expect(builder.convertStringToRealString("x\r\nx")).toBe("x\rx");
        expect(builder.convertStringToRealString("x\nx")).toBe("x\rx");
        expect(builder.convertStringToRealString("x\rx")).toBe("x\rx");

        // convertStringToRealString : nlstyle = LF
        directive.nlstyle = 'LF';
        builder = new Builder(directive);
        await builder.init();
        expect(builder.convertStringToRealString("x\r\nx")).toBe("x\nx");
        expect(builder.convertStringToRealString("x\nx")).toBe("x\nx");
        expect(builder.convertStringToRealString("x\rx")).toBe("x\nx");

        // convertStringCharset
        builder = new Builder(directive);
        await builder.init();
        expect(builder.convertStringCharset('四格','GBK').toString("hex")).toBe('cbc4b8f1');

        // get build handlers : text
        builder = new Builder(directive);
        await builder.init();
        builder.setCustomParams('text',null);
        expect(builder.getBuildHandler()).toBeInstanceOf(TextBuildHandler);
        // get build handlers : hex
        builder = new Builder(directive);
        await builder.init();
        builder.setCustomParams('hex',null);
        expect(builder.getBuildHandler()).toBeInstanceOf(HexBuildHandler);
        // get build handlers : form
        builder = new Builder(directive);
        await builder.init();
        builder.setCustomParams('form',null);
        expect(builder.getBuildHandler()).toBeInstanceOf(FormBuildHandler);
        // get build handlers : file
        builder = new Builder(directive);
        await builder.init();
        builder.setCustomParams('file',null);
        expect(builder.getBuildHandler()).toBeInstanceOf(FileBuildHandler);
        // get build handlers : none
        builder = new Builder(directive);
        await builder.init();
        builder.setCustomParams('none',null);
        expect(builder.getBuildHandler()).toBeInstanceOf(NoneBuilderHandler);
        // get build handlers : unknown
        builder = new Builder(directive);
        await builder.init();
        builder.setCustomParams('xxx',null);
        tester.expectError(() => builder.getBuildHandler(), 'invalid parameter build handler : xxx');

        // bad project id
        directive.projectId = 'x';
        builder = new Builder(directive);
        await tester.expectError(async() => await builder.init(), 'unable to find project on request param builder init.');
    })
});