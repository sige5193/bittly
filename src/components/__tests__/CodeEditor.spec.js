import UnitTester from '../../utils/test/UnitTester.js';
import CodeEditor from '../CodeEditor.vue'
describe('@/components/CodeEditor.vue', () => {
    it('basic', async ( ) => {
        let content = '';
        let gutterClickHandler = jest.fn();
        let tester = new UnitTester({
            listeners : {
                input : newContent => content = newContent,
                'gutter-click' : gutterClickHandler,
            },
        });
        await tester.setup();
        await tester.mount(CodeEditor);

        let cmDocReplaceRange = jest.fn();
        let cmDocGetCursor = jest.fn(() => {return {line:0}});
        let cmDocGetLine = jest.fn(() => '');
        let cmEventHandlers = {};
        let cm = tester.wrapper.vm.$refs.editor.codemirror;
        cm.on = (name, callback) => cmEventHandlers[name] = callback;
        cm.showHint = jest.fn();
        cm.setValue = jest.fn();
        cm.getTokenAt = () => {return {string:'ABC'}};
        cm.getDoc = () => { return {
            replaceRange : cmDocReplaceRange,
            getCursor : cmDocGetCursor,
            getLine : cmDocGetLine,
            setValue : () => {},
        }};
        await tester.emit({ref:'editor'}, 'ready');

        // input event
        tester.wrapper.setProps({value:'TEST-CONTENT'});
        await tester.emit({ref:'editor'}, 'input', ['TEST-CONTENT']);
        expect(content).toBe('TEST-CONTENT');
        expect(cm.showHint).toBeCalled();

        // insert snippet to empty line
        cmDocGetLine.mockImplementationOnce(() => '');
        tester.wrapper.vm.insertSnippet('HELLO');
        expect(cmDocReplaceRange.mock.calls[0][0]).toBe('HELLO');

        // insert snippet to a not empty line
        cmDocGetLine.mockImplementationOnce(() => 'XXX');
        tester.wrapper.vm.insertSnippet('HELLO');
        expect(cmDocReplaceRange.mock.calls[1][0][0]).toBe("\n");

        // gutter click test
        cmEventHandlers['gutterClick'](cm, 0, null, {});
        expect(gutterClickHandler).toBeCalled();
    })
});