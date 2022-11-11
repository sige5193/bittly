import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Builder from '../../Builder.js';
describe('@/modules/directive/parameter/text/BuildHandler.js', () => {
    it('normal use', async ( ) => {
        let tester = new Tester({});
        await tester.setup();
        let project = await tester.activeNewProject();

        window.fs = {};
        window.fs.constants = {R_OK:1};
        window.fs.accessSync = jest.fn(() => true);
        window.fs.readFileSync = jest.fn(() => 'ABCD');

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestFormat = 'file';
        directive.requestContent.file = {path:''};
        
        let builder = new Builder(directive);
        await builder.init();
        let handler = builder.getBuildHandler();
        expect(handler.getTypeName()).toBe('file');

        // file is required
        tester.expectError(() => builder.getRequestBuffer(), 'Please select a file.');
        
        // failed to access file
        window.fs.accessSync.mockImplementationOnce(() => {throw "TEST FAILED ACCESS FILE"});
        directive.requestContent.file = {path:'demo.file',sendMode:'All'};
        builder = new Builder(directive);
        await builder.init();
        tester.expectError(() => builder.getRequestBuffer(), 'Unable to read file demo.file');

        // failed to read file
        window.fs.readFileSync.mockImplementationOnce(() => {throw Error('TEST FAILED READ FILE');});
        builder = new Builder(directive);
        await builder.init();
        tester.expectError(() => builder.getRequestBuffer(), 'File \"demo.file\" failed to read : TEST FAILED READ FILE');
        
        // build success
        expect(builder.getRequestBuffer().toString()).toBe('ABCD');
    })
});