import UnitTester from '../../utils/test/UnitTester.js';
import TableDraggableWrapper from '../TableDraggableWrapper.vue'
describe('@/components/TableDraggableWrapper.vue', () => {
    it('basic', async () => {
        let handleTableDraggableWrapperChanged = jest.fn();
        let tester = new UnitTester({
            provide : {
                tableDraggableWrapperSource : {
                    handleTableDraggableWrapperChanged
                },
                tableDraggableWrapperAttrName : {},
            }
        });
        await tester.setup();
        await tester.mount(TableDraggableWrapper);
        await tester.msleep(200);
        await tester.emit({ref:'draggable'}, 'change');
        await tester.msleep(200);
        expect(handleTableDraggableWrapperChanged).toBeCalled();
    });
});