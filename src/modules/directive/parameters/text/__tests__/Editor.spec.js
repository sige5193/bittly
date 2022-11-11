import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/text/Editor.vue', () => {
    it('normal use', async ( ) => {
        let directive = new MdbDirective();
        directive.requestContent.text = 'how are you';

        let tester = new Tester({
            props : {
                value : directive,
            },
            listeners : {
                input : newValue => directive = newValue
            },
        });
        await tester.setup();
        await tester.mount(Editor, true);
        await tester.emit({ref:'editor'}, "input", ['hello']);
        await tester.emit({ref:'editor'}, "input", ['hello']);
        expect(directive.requestContent.text).toBe('hello');

        // context menu
        tester.wrapper.vm.actionEditorContextMenuClicked({key:'ModeText'});
        tester.wrapper.vm.actionEditorContextMenuClicked({key:'ModeXml'});

        // context menu : json mode
        await tester.emit({ref:'editor'}, "input", ['{"name":"sige"}']);
        tester.wrapper.vm.actionEditorContextMenuClicked({key:'ModeJson'});
        expect(directive.requestContent.text).toBe('{\n    "name": "sige"\n}');
    })
});