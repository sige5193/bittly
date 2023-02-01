import TestCaseSetup from '../../../../../utils/test/UnitTester.js';
import ExportHandlerExcel from '../ExportHandlerExcel.js'
describe('@/src/modules/test/export/ExportHandlerExcel.js', () => {
    it('normal use', async () => {
        let setup = new TestCaseSetup();
        await setup.setup();
        let project = await setup.activeNewProject();
        window.app.$store.getters.projectActivedId = project.id;
        window.fs = {
            promises : {
                writeFile : jest.fn()
            }
        };

        let handler = new ExportHandlerExcel({
            directives : {},
        });
        handler.setTitle("TEST-TITLE");
        await handler.run();
        await handler.save('test');
        
        expect(window.fs.promises.writeFile.mock.calls[0][0]).toBe('test.xlsx');
    })
});