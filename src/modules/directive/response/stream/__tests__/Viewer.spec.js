import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Viewer from '../Viewer.vue'
describe('@/modules/directive/response/plotter/PreserveViewer.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : directive,
            },
        });
        await tester.setup();
        await tester.mount(Viewer);

        let vm = tester.wrapper.vm;
        
        // send 
        vm.newRequestData(Buffer.from('REQUEST'));
        await vm.$nextTick();
        expect(vm.entries.all[0].data.toString()).toBe('REQUEST');
        expect(vm.entries.all[0].dir).toBe('send');
        
        // receive
        vm.newResponseData(Buffer.from('RESPONSE'));
        await vm.$nextTick();
        expect(vm.entries.all[1].data.toString()).toBe('RESPONSE');
        expect(vm.entries.all[1].dir).toBe('receive');

        // send again
        vm.newRequestData(Buffer.from('REQUEST'));
        await vm.$nextTick();
        expect(vm.entries.all[2].data.toString()).toBe('REQUEST');
        expect(vm.entries.all[2].dir).toBe('send');

        // switch to hex mode
        await tester.emit({ref:'radioMode'},'input',['hex']);
        expect(vm.entries.all[2].data.toString()).toBe('REQUEST');

        // clear
        await tester.click({ref:'btnClear'});
        expect(vm.entries.all.length).toBe(0);

        // en ~~~
        expect(Viewer.generateTestcaseExpectContentFromResponse()).toBe('');
    })
});