import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/src/modules/directive/script/Editor.vue', () => {
    it('normal use', async () => {
        let directive = new MdbDirective();
        
        let tester = new Tester();
        await tester.setup();
        
        let wrapper = await tester.mount(Editor, true);
        let actionOk = jest.fn();
        wrapper.vm.open(directive).then(actionOk);
        await tester.msleep(200);
        
        let codemirrorDoc = {
            getCursor : jest.fn(() => {return {line:0};}),
            getLine : jest.fn(),
            replaceRange : jest.fn(),
        };
        let codemirror = {
            getCursor : jest.fn(),
            getTokenAt : jest.fn(() => {return {string:'b'}}),
            showHint : jest.fn(),
            getDoc : jest.fn(() => codemirrorDoc),
        };
        tester.wrapper.vm.$refs.editorScript.codemirror = codemirror;
        
        // editor input
        await tester.emit({ref:'editorScript'}, 'input');
        expect(codemirror.showHint).toBeCalled();

        // insert snippet
        codemirrorDoc.getLine.mockImplementationOnce(() => '');
        await tester.click({ref:'btnSnippet'},null, 0);
        expect(codemirrorDoc.replaceRange.mock.calls[0][0][0]).not.toBe('\n');

        codemirrorDoc.getLine.mockImplementationOnce(() => 'HELLO');
        await tester.click({ref:'btnSnippet'},null, 0);
        expect(codemirrorDoc.replaceRange.mock.calls[1][0][0]).toBe('\n');
        
        // ok
        await tester.wrapper.setData({requestScript: 'test script'});
        await tester.wrapper.vm.$nextTick();
        await tester.click({ref:'btnOk'});
        expect(directive.requestScript).toBe('test script');
        expect(actionOk).toBeCalled();

        // click help link
        wrapper.vm.open(directive);
        await tester.wrapper.vm.$nextTick();
        window.shell = {openExternal:jest.fn()};
        await tester.click({ref:'btnHelp'});
        expect(window.shell.openExternal).toBeCalled();
    })
});