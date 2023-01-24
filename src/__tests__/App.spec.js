jest.mock('../modules/panel/Main.vue', ()=>{}, {virtual:true});
jest.mock('../modules/test/Main.vue', ()=>{}, {virtual:true});
import UnitTester from '../utils/test/UnitTester.js'
import App from '../App.vue'
describe('@/App.vue', () => {
    it('display project index if no active project', async ( done ) => {
        let tester = new UnitTester();
        tester.on('ready', () => {
            expect(tester.exists({ref:'projectIndex'})).toBeTruthy();
            done();
        });

        await tester.setup();
        await tester.mount(App, true);
        expect(tester.wrapper.vm.isLoading).toBe(true);
        expect(tester.wrapper.vm.moduleName).toBe('directive');
    }, 10000);
});