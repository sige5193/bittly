import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/file/Editor.vue', () => {
    it('normal use', async ( ) => {
        window.fs = {
            constants:{R_OK:1},
            accessSync : () => {},
            statSync : () => { return {size:10} },
            readFileSync : () => 'ABC',
        };

        let directive = new MdbDirective();
        directive.requestContent.file = {path:'SAVE-PATH'};
        
        let tester = new Tester({
            props : {value : directive},
            listeners : {
                input : newValue => directive = newValue,
            }
        });
        await tester.setup();
        await tester.mount(Editor);
        
        // Mock codemirror
        let cm = {addLineClass(){},scrollIntoView(){}};
        tester.wrapper.vm.$refs.viewer.$refs.editor.codemirror = cm;

        // select file and verify the directive
        let file = {path:'DEMO-PATH'};
        await tester.emit({ref:'upload'}, "change", [{file : file}]);
        expect(directive.requestContent.file.path).toBe('DEMO-PATH');
    })
});