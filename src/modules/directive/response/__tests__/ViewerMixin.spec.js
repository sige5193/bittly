import MdbDirective from '../../../../models/MdbDirective.js';
import Tester from '../../../../utils/test/UnitTester.js';
import ViewerMixin from '../ViewerMixin.js'
describe('@/modules/directive/response/Viewer.vue', () => {
    it('generate excel file', async () => {
        let directive = new MdbDirective();
        directive.name = 'TEST-DIR';
          
        let com = {
            name : 'TEST-COM',
            mixins : [ViewerMixin],
            template : '<div>xxx</div>',
            data() {
                return {
                    directive : directive,
                };
            },
        };

        let tester = new Tester();
        await tester.setup();
        await tester.mount(com, true);
        
        let dialogShowSaveDialogSync = jest.fn(opt => `/fake/path/${opt.defaultPath}`);
        let fsWriteFile = jest.fn((filepath, buffer) => {
            expect(filepath).toMatch("/fake/path/TEST-DIR-");
            return Promise.resolve();
        });
        let shellOpenPath = jest.fn(path => expect(path).toBe('/fake/path'));
        window.dialog = {showSaveDialogSync:dialogShowSaveDialogSync};
        window.fs = {promises:{writeFile:fsWriteFile}};
        window.remote = {shell:{openPath:shellOpenPath}};
        window.path = require('path');
        await tester.wrapper.vm.generateResponseExcelFile({
            columns : [{header:'Name01',key:'name01'},{header:'Name02',key:'name02'}],
            data : [[1,2],[3,4]],
        });

        // user cancel path selection
        dialogShowSaveDialogSync.mockImplementationOnce(() => undefined);
        await tester.wrapper.vm.generateResponseExcelFile({
            columns : [{header:'Name01',key:'name01'},{header:'Name02',key:'name02'}],
            data : [[1,2],[3,4]],
        });
    })
});