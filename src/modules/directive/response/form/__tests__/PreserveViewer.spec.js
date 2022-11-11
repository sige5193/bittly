import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import PreserveViewer from '../PreserveViewer.vue'
describe('@/modules/directive/parameter/form/PreserveViewer.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        directive.responseCharset = 'utf-8';
        directive.responseFormatter = {
            fields : [
                {name:'ATTR001',type:'byte',prefix:'hex'},
                {name:'ATTR002',type:'byte',prefix:'hex'},
                {name:'',type:'byte',prefix:'hex'},
            ],
        };

        let tester = new Tester({
            props : {
                directive : directive,
                responseList : [
                    {key:1,time:new Date(), data:Buffer.from('123')}, 
                    {key:2,time:new Date(), data:Buffer.from('456')},
                ],
            }
        });
        await tester.setup();
        await tester.mount(PreserveViewer);
        let entries = tester.wrapper.findAll('.directive-response-form-preserve-entry-content');
        expect(entries.length).toBe(2); 
        expect(entries.at(0).text().replace(/\s/g,'')).toBe('ATTR00149ATTR00250$251');
        expect(entries.at(1).text().replace(/\s/g,'')).toBe('ATTR00152ATTR00253$254');
        
        // refresh 
        tester.wrapper.setProps({responseList:[]});

        // directive without foramter
        directive = new MdbDirective();
        directive.responseCharset = 'utf-8';
        directive.responseFormatter = {};
        tester = new Tester({
            props : {
                directive : directive,
                responseList : [{key:1,time:new Date(), data:Buffer.from('123')}],
            }
        });
        await tester.setup();
        await tester.mount(PreserveViewer);
        entries = tester.wrapper.findAll('.directive-response-form-preserve-entry-content');
        expect(entries.at(0).text().trim()).toBe('');
    })

    it('export as excel', async () => {
        let directive = new MdbDirective();
        directive.responseCharset = 'utf-8';
        directive.responseFormatter = {
            fields : [
                {name:'ATTR001',type:'byte',format:'hex'},
                {name:'ATTR002',type:'byte',format:'hex'},
                {name:'',type:'byte',format:'hex'},
            ],
        };

        let tester = new Tester({
            props : {
                directive : directive,
                responseList : [
                    {key:1,time:new Date(), data:Buffer.from('123')}, 
                    {key:2,time:new Date(), data:Buffer.from('456')},
                ],
            }
        });
        await tester.setup();
        await tester.mount(PreserveViewer);
        let excelOptions = null;
        tester.wrapper.vm.generateResponseExcelFile = jest.fn((opt) => excelOptions = opt);
        tester.wrapper.vm.exportAsExcel();
        await tester.msleep(100);
        expect(excelOptions.data.length).toBe(2);
        expect(excelOptions.data[0].col_0).toBe('0x31');
        expect(excelOptions.data[0].col_1).toBe('0x32');
        expect(excelOptions.data[0].col_2).toBe('0x33');

        // directive without format
        directive = new MdbDirective();
        directive.responseCharset = 'utf-8';
        directive.responseFormatter = {};
        tester = new Tester({
            props : {
                directive : directive,
                responseList : [],
            }
        });
        await tester.setup();
        await tester.mount(PreserveViewer);
        tester.wrapper.vm.generateResponseExcelFile = jest.fn(()=>{});
        tester.wrapper.vm.exportAsExcel();
        await tester.msleep(100);
        expect(tester.wrapper.vm.generateResponseExcelFile).not.toBeCalled();
    })
});