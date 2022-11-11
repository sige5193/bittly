import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Builder from '../../Builder.js';
describe('@/modules/directive/parameter/hex/BuildHandler.js', () => {
    it('normal use', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        window.app.$store.getters.envVariables = {
            envVar001 : {value:'BB'},
        };

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestFormat = 'hex';
        directive.requestContent.hex = 'AA {{env.envVar001}} {{scriptVar001}} {{@echo(DD)}}';
        directive.requestScript = '$this.variableSet("scriptVar001","CC")'
        let builder = new Builder(directive);
        await builder.init();
        let buffer = builder.getRequestBuffer();
        expect(buffer[0]).toBe(0xAA);
        expect(buffer[1]).toBe(0xBB);
        expect(buffer[2]).toBe(0xCC);
        expect(buffer[3]).toBe(0xDD);

        let handler = builder.getBuildHandler();
        expect(handler.getTypeName()).toBe('hex');

        // empty content
        directive.requestContent.hex = '';
        builder = new Builder(directive);
        await builder.init();
        expect(builder.getRequestBuffer().toString()).toBe('');

        // bad chars
        directive.requestContent.hex = 'HOW ARE YOU';
        builder = new Builder(directive);
        await builder.init();
        tester.expectError(()=>builder.getRequestBuffer(), 'Request content contains non-hex characters');
    })
});