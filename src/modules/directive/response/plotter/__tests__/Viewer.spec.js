import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Viewer from '../Viewer.vue'
describe('@/modules/directive/response/plotter/Viewer.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        directive.responseFormatter.plotter = {};

        let tester = new Tester({
            props : {
                value : directive,
                content : Buffer.from([]),
            },
            listeners : {
                input : newValue => directive = newValue
            },
        });
        await tester.setup();
        await tester.mount(Viewer);
        await tester.wrapper.setProps({content:Buffer.from([0x01,0x02,0x03,0x04])});
        await tester.wrapper.vm.$nextTick();

        let chart = tester.dataGet('chart');
        expect(chart.data.datasets[0].label).toBe('CH 0');
        expect(chart.data.datasets[0].data[0].y).toBe(1);
        expect(chart.data.datasets[0].data[1].y).toBe(2);
        expect(chart.data.datasets[0].data[2].y).toBe(3);
        expect(chart.data.datasets[0].data[3].y).toBe(4);

        // emit resize event
        await tester.eventBusEmit('directive-executor-resized');

        // change parser
        await tester.select({ref:'selectParser'},'data-frame');
        expect(directive.responseFormatter.plotter.parser).toBe('data-frame');

        // test parse error
        tester.wrapper.vm.$refs.parser.parse = jest.fn(() => {throw Error('xxx');});
        await tester.wrapper.setProps({content:Buffer.from([0x01,0x02,0x03,0x04])});
        expect(tester.wrapper.vm.$refs.parser.parse).toBeCalled();

        // destory the viewer
        await tester.wrapper.destroy();
    })

    it('export as excel', async ( ) => {
        let directive = new MdbDirective();
        directive.responseFormatter.plotter = {
            parser:"data-matrix",
            channelCount : 2,
            dataType : 'byte',
        };

        let tester = new Tester({
            props : {
                value : directive,
                content : Buffer.from([0x01,0x02,0x03,0x04,0x05]),
            },
            listeners : {
                input : newValue => directive = newValue
            },
        });
        await tester.setup();
        await tester.mount(Viewer);

        let excelOpt = null;
        let generateResponseExcelFile = jest.fn(opt => excelOpt = opt);
        tester.wrapper.vm.generateResponseExcelFile = generateResponseExcelFile;
        tester.wrapper.vm.exportAsExcel();
        await tester.msleep(100);
        expect(excelOpt.columns[0].header).toBe('CH 0');
        expect(excelOpt.data.length).toBe(2);
    })
});