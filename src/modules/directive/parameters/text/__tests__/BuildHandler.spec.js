import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import BuildHandler from '../BuildHandler.js'
import Builder from '../../Builder.js';
describe('@/modules/directive/parameter/text/BuildHandler.js', () => {
    it('normal use', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();
        tester.store.state.envVariables = {
            envVar001 : {value:'ENV_VAR_001'},
        };

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestFormat = 'text';
        directive.requestContent.text = '000-{{env.envVar001}}-{{scriptVar001}}-{{@echo($content)}}';
        directive.requestScript = '$this.variableSet("scriptVar001","SCRIPT-VAR-001")'

        let builder = new Builder(directive);
        await builder.init();
        expect(builder.getRequestBuffer().toString())
            .toBe('000-ENV_VAR_001-SCRIPT-VAR-001-000-ENV_VAR_001-SCRIPT-VAR-001-{{@echo($content)}}');

        let handler = builder.getBuildHandler();
        expect(handler.getTypeName()).toBe('text');

        // empty param content
        directive.requestContent.text = '';
        builder = new Builder(directive);
        await builder.init();
        expect(builder.getRequestBuffer().toString()).toBe('');
    })
});