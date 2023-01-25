import Tester from '../../../utils/test/UnitTester.js';
import Status from '../Status.vue'
import MdbDirective from '../../../models/MdbDirective.js'
describe('@/src/modules/directive/Status.vue', () => {
    it('share without response', async ( ) => {
        let directive = new MdbDirective();
        directive.name = 'TEST-001';
        directive.statusSet('TestStatus','V01');

        let tester = new Tester({
            props : {directive},
        });
        await tester.setup();
        await tester.mount(Status);

        // update status
        directive.statusSet('TestStatus', 'V02');
        await tester.msleep(200);

        // // open status popover
        await tester.trigger({ref:'btnOpenStausPopover'}, 'click');
        expect(tester.wrapper.vm.isEditorVisiable).toBeTruthy();

        // update status value
        await tester.input({ref:'inputStatusValue'}, 'V-NEW', null, 0);
        await tester.trigger({ref:'iconCheck',index:0}, 'click', [], null);
        expect(directive.statusGet('TestStatus')).toBe('V-NEW');

        // clear all status
        await tester.click({ref:'btnClear'});
        expect(Object.keys(directive.statusList()).length).toBe(0);

        // destory
        tester.wrapper.destroy();
    })
});