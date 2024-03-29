import TestCaseSetup from '../../../../../utils/test/UnitTester';
import Exportor from '../Exportor.js'
describe('@/src/modules/test/export/Exportor.js', () => {
    it('debug normal use', async () => {
        let setup = new TestCaseSetup();
        await setup.setup();
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
        await setup.activeNewProject();
        
        let handler = new Exportor();
        await handler.export('html');
        
        expect(window.fs.promises.writeFile.mock.calls[0][0]).toBe('xxx.html');
    })
});