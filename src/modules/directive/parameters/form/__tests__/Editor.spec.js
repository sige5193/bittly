import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/form/Editor.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'f01',name:'F01',type:'byte',value:'01',format:'hex',desc:'D01'},
        ];

        let tester = new Tester({
            props : {
                value : directive,
                defaultDataType : 'string',
            },
            listeners : {
                input : newValue => directive = newValue,
            },
        });
        await tester.setup();

        // mount
        await tester.mount(Editor);

        // update default data type
        tester.wrapper.setProps({defaultDataType:'byte'});

        // delete first item
        await tester.trigger({ref:'iconRowDelete_0'}, 'click');
        expect(directive.requestContent.form.length).toBe(0);

        // input a new field
        await tester.input({ref:'inputName_0'},'F02');
        expect(directive.requestContent.form[0].name).toBe('F02');
        await tester.select({ref:'selectDataType_0'}, 'char_int');
        expect(directive.requestContent.form[0].type).toBe('char_int');
        await tester.input({ref:'inputValue_0'},'100');
        expect(directive.requestContent.form[0].value).toBe('100');
        await tester.trigger({ref:'inputDescViewer_0'}, 'click');
        await tester.textareaInput({ref:'inputDesc_0'}, 'D02');
        expect(directive.requestContent.form[0].desc).toBe('D02');
        await tester.trigger({ref:'inputDesc_0'}, 'blur');

        // insert new item after first one
        await tester.trigger({ref:'iconRowInsert_0'}, 'click');
        expect(directive.requestContent.form.length).toBe(2);

        // move row
        tester.wrapper.vm.handleTableDraggableWrapperChanged({moved:{oldIndex:2}});
        await tester.msleep(100);
        tester.wrapper.vm.handleTableDraggableWrapperChanged({moved:{newIndex:3}});
    })

    it('bad directive prop', async () => {
        let directive = {};

        let tester = new Tester({
            props : {
                value : directive,
                defaultDataType : 'string',
            },
            listeners : {
                input : newValue => directive = newValue,
            },
        });
        await tester.setup();
        
        // bad directive
        let oldWinConsoleError = window.console.error;
        window.console.error = () => {};
        await tester.expectError(async () => await tester.mount(Editor), 'value of prop v-model must be an instance of MdbDirective.');
        window.console.error = oldWinConsoleError;
    });

    it('data type unsigned', async () => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'f01',name:'F01',type:'byte',value:'FF',format:'hex',desc:'D01'},
        ];

        let tester = new Tester({
            props : {
                value : directive,
                defaultDataType : 'byte',
            },
            listeners : {
                input : newValue => directive = newValue,
            },
        });
        await tester.setup();
        await tester.mount(Editor);

        // auto update format if the value is number
        await tester.select({ref:'selectValueFormat_0'}, 'dec');
        expect(directive.requestContent.form[0].value).toBe('255');

        // key value if value is a placeholder
        await tester.input({ref:'inputValue_0'}, '{{@random(1,2)}}');
        await tester.select({ref:'selectValueFormat_0'}, 'hex');
        expect(directive.requestContent.form[0].value).toBe('{{@random(1,2)}}');

        // update the last item format, it would append a new item
        await tester.select({ref:'selectValueFormat_1'}, 'dec');
        expect(directive.requestContent.form.length).toBe(2);
    });

    it('data type long value : string & bytes', async () => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'f01',name:'F01',type:'string',value:'how are you ?',desc:'D01'},
        ];

        let tester = new Tester({
            props : {
                value : directive,
                defaultDataType : 'byte',
            },
            listeners : {
                input : newValue => directive = newValue,
            },
        });
        await tester.setup();
        await tester.mount(Editor);

        await tester.trigger({ref:'inputLongValue_0'}, 'click');
        await tester.textareaInput({ref:'inputLongValueEditor_0'}, 'hello');
        await tester.trigger({ref:'inputLongValueEditor_0'}, 'blur');
        await tester.emit({ref:'inputLongValueEditor_0'}, 'blur');
        expect(directive.requestContent.form[0].value).toBe('hello');

        // input desc for the last item to append new item
        await tester.trigger({ref:'inputDescViewer_1'}, 'click');
        await tester.textareaInput({ref:'inputDesc_1'}, 'D02');
        expect(directive.requestContent.form[1].desc).toBe('D02');
        await tester.trigger({ref:'inputDesc_1'}, 'blur');
        expect(directive.requestContent.form.length).toBe(2);
    });

    it('data type long value : file', async () => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'f01',name:'F01',type:'file',value:'demo.file',desc:'D01'},
        ];

        let tester = new Tester({
            props : {
                value : directive,
                defaultDataType : 'byte',
            },
            listeners : {
                input : newValue => directive = newValue,
            },
        });
        await tester.setup();
        await tester.mount(Editor);

        await tester.emit({ref:'uploadFile_0'}, 'change',[{file:{path:'new-path.file'}}, 0]);
        expect(directive.requestContent.form[0].value).toBe('new-path.file');

        // input value for the last item to append new item
        await tester.input({ref:'inputValue_1'},'100');
        expect(directive.requestContent.form[1].value).toBe('100');
    });

    it('value auto complete', async () => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'f01',name:'F01',type:'byte',value:'FF',desc:'D01'},
        ];

        let tester = new Tester({
            props : {
                value : directive,
                defaultDataType : 'byte',
            },
            listeners : {
                input : newValue => directive = newValue,
            },
        });
        await tester.setup();
        await tester.mount(Editor);

        await tester.input({ref:'inputValue_0'},'{{@');
        await tester.input({ref:'inputValue_0'},'');
        await tester.emit({ref:'inputValue_0'},'blur');

        // data type change to add a new item
        await tester.select({ref:'selectDataType_1'}, 'char_int');
        expect(directive.requestContent.form[1].type).toBe('char_int');

        // delete all rows
        await tester.trigger({ref:'iconRowDelete_0'}, 'click');
        await tester.trigger({ref:'iconRowDelete_0'}, 'click');
        await tester.trigger({ref:'iconRowDelete_0'}, 'click');
        await tester.trigger({ref:'iconRowDelete_0'}, 'click');
        expect(directive.requestContent.form.length).toBe(0);
    }, 10000);
});