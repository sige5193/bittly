import TestCaseSetup from '../../../../../utils/test/Setup.js';
import Exportor from '../Exportor.js'
describe('@/src/modules/test/export/Exportor.js', () => {
    it('normal use', async () => {
        window.fs = {
            promises : {
                writeFile : jest.fn()
            }
        };
        window.dialog = {
            showSaveDialogSync() {
                return 'xxx';
            },
        };

        let setup = new TestCaseSetup();
        await setup.setup();
        let project = await setup.setActiveProject('new');
        window.app.$store.getters.projectActivedId = project.id;

        let handler = new Exportor();
        await handler.export('html');
        
        expect(window.fs.promises.writeFile.mock.calls[0][0]).toBe('xxx.html');
    })
});