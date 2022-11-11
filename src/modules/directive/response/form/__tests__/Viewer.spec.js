import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Viewer from '../Viewer.vue'
describe('@/modules/directive/parameter/Editor.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        directive.responseFormatter.fields = [{
            key:'K01',name:'F01', type:'byte',desc:'D01',format:'hex'
        }];
        let tester = new Tester({
            props : {
                value : directive,
                content : Buffer.from([0x30, 0x31, 0x32])
            },
            listeners : {
                input : newValue => directive = newValue
            },
        });
        await tester.setup();
        await tester.mount(Viewer);
        
        // parse to last enable / disable
        await tester.click({ref:'btnParseToLast'});
        expect(tester.wrapper.findComponent({ref:'inputValueUnsigned_0'}).find('input').element.value).toBe('32');
        await tester.click({ref:'btnParseToLast'});
        expect(tester.wrapper.findComponent({ref:'inputValueUnsigned_0'}).find('input').element.value).toBe('30');

        // edit item : string
        await tester.input({ref:'inputName_1'},'F02');
        expect(directive.responseFormatter.fields[1].name).toBe('F02');
        await tester.select({ref:'selectDataType_1'}, 'string');
        expect(directive.responseFormatter.fields[1].type).toBe('string');
        await tester.input({ref:'inputDataLength_1'}, '2');
        expect(directive.responseFormatter.fields[1].length).toBe(2);
        await tester.input({ref:'inputDesc_1'}, 'D02');
        expect(directive.responseFormatter.fields[1].desc).toBe('D02');
        expect(tester.wrapper.findComponent({ref:'inputValueString_1'}).find('input').element.value).toBe('12');
        
        // change value format 
        expect(tester.wrapper.findComponent({ref:'inputValueUnsigned_0'}).find('input').element.value).toBe('30');
        await tester.select({ref:'selectValueFormat_0'}, 'bin');
        expect(tester.wrapper.findComponent({ref:'inputValueUnsigned_0'}).find('input').element.value).toBe('110000');

        // insert and delete row
        await tester.trigger({ref:'iconRowInsert_0'},'click');
        expect(directive.responseFormatter.fields.length).toBe(3);
        await tester.trigger({ref:'iconRowDelete_1'},'click');
        expect(directive.responseFormatter.fields.length).toBe(2);

        // move row
        tester.wrapper.vm.handleTableDraggableWrapperChanged({moved:{oldIndex:2}});
        await tester.msleep(100);
        tester.wrapper.vm.handleTableDraggableWrapperChanged({moved:{newIndex:3}});

        // delete all rows
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        expect(directive.responseFormatter.fields.length).toBe(0);

        // test create row on edit
        await tester.input({ref:'inputDesc_0'}, 'DESC'); 
        expect(directive.responseFormatter.fields.length).toBe(1);
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        await tester.select({ref:'selectValueFormat_0'}, 'bin');
        expect(directive.responseFormatter.fields.length).toBe(1);
        await tester.trigger({ref:'iconRowDelete_0'},'click');
        await tester.select({ref:'selectDataType_0'}, 'string');
        expect(directive.responseFormatter.fields.length).toBe(1);
        await tester.trigger({ref:'iconRowDelete_0'},'click');

        // illegal data length 
        await tester.select({ref:'selectDataType_0'}, 'string');
        await tester.input({ref:'inputDataLength_0'}, '2xxx');
        expect(directive.responseFormatter.fields[0].length).toBe(2);
        await tester.input({ref:'inputDataLength_0'}, 'xxx');
        expect(directive.responseFormatter.fields[0].length).toBe(1);
    }, 10000)

    it('view as table', async () => {
        let directive = new MdbDirective();
        directive.responseFormatter.fields = [
            {key:1, name:'F001',type:'byte',format:'hex'},
            {key:2, name:'',type:'byte',format:'hex'},
        ];

        let tester = new Tester({
            props : {
                value : directive,
                content : new Uint8Array([0x30, 0x31, 0x32, 0x33])
            },
        });
        await tester.setup();

        await tester.mount(Viewer);
        await tester.click({ref:'btnParseToLast'});
        await tester.emit({ref:'radioGroupViewMode'}, 'input', ['table']);
        let table = tester.wrapper.findComponent({ref:'viewerTableContainer'});
        expect(table.text().replace(/\s/g,'')).toBe('1F0010x30$10x312F0010x32$10x33')

        tester.wrapper.setProps({content:new Uint8Array([0x30, 0x31, 0x32, 0x33,0x34,0x35])});
        await tester.wrapper.vm.$nextTick();
    })

    it('export excel', async () => {
        let directive = new MdbDirective();
        directive.responseFormatter = {};
        let tester = new Tester({
            props : {
                value : directive,
                content : new Uint8Array([0x30, 0x31, 0x32, 0x33])
            },
        });
        await tester.setup();
        await tester.mount(Viewer);
        tester.wrapper.vm.exportAsExcel();

        directive = new MdbDirective();
        directive.responseFormatter.fields = [{
            key:'K01',name:'',type:'byte',format:'hex',desc:'D01',
        }];
        tester.wrapper.setProps({value:directive});
        await tester.wrapper.vm.$nextTick();
        let generateResponseExcelFile = jest.fn(() => {});
        tester.wrapper.vm.generateResponseExcelFile = generateResponseExcelFile;
        tester.wrapper.vm.exportAsExcel();
        await tester.msleep(100);
        expect(generateResponseExcelFile).toBeCalled();
        expect(generateResponseExcelFile.mock.calls[0][0].data[0].value).toBe('0x30');

        // table mode
        await tester.emit({ref:'radioGroupViewMode'}, 'input', ['table']);
        tester.wrapper.vm.exportAsExcel();
        await tester.msleep(100);
        expect(generateResponseExcelFile).toBeCalled();
        expect(generateResponseExcelFile.mock.calls[1][0].data.length).toBe(3);
        expect(generateResponseExcelFile.mock.calls[1][0].columns[0].header).toBe('$1');
    })

    it('generate testcase expect content from response', async () => {
        let directive = new MdbDirective();
        let content = Viewer.generateTestcaseExpectContentFromResponse(directive, Buffer.from([0x06]));
        expect(content).toBe('');

        directive.responseFormatter.fields = [{
            key:'K01',name:'',type:'byte',format:'hex',desc:'D01',
        }];
        content = Viewer.generateTestcaseExpectContentFromResponse(directive, Buffer.from([0x06]));
        expect(content[0].comparator).toBe('Equal');
        expect(content[0].value).toBe('06');
    })
});