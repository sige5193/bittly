import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Builder from '../../Builder.js';
describe('@/modules/directive/parameter/none/BuildHandler.js', () => {
    it('basic', async ( ) => {
        let tester = new Tester({});
        await tester.setup();
        let project = await tester.activeNewProject();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestFormat = 'none';
        
        let builder = new Builder(directive);
        await builder.init();
        let handler = builder.getBuildHandler();
        expect(handler.getTypeName()).toBe('none');
        
        // build success
        expect(builder.getRequestBuffer().toString()).toBe('');
        expect(handler.getPreProcessedData()).toBe('');
    })
});