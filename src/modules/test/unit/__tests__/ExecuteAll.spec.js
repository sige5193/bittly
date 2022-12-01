import UnitTester from '../../../../utils/test/UnitTester.js';
import ExecuteAll from '../ExecuteAll.vue'
import MdbDirective from '../../../../models/MdbDirective.js'
import MdbDirectiveEntry from '../../../../models/MdbDirectiveEntry.js'
import { NIL as NIL_UUID } from 'uuid';
describe('@/src/modules/test/unit/ExecuteAll.vue', () => {
    it('basic', async () => {
        let workspaceOpenDirective = jest.fn().mockResolvedValueOnce({});
        let workspaceExecute = jest.fn();
        workspaceExecute.mockResolvedValueOnce({
            message:'',success:true,duration:0,testcases:[],
        }).mockResolvedValueOnce({
            message:'',success:false,duration:0,testcases:[],
        });
        let workspaceExpandTestcaseById = jest.fn();
        let getWorkspace = jest.fn(() => {
            return {
                openDirective : workspaceOpenDirective,
                execute : workspaceExecute,
                expandTestcaseById: workspaceExpandTestcaseById,
            };
        });

        let tester = new UnitTester({
            props : {getWorkspace : getWorkspace},
        });
        await tester.setup();
        let project = await tester.activeNewProject();
        
        // append directive entry to the root
        let d01 = await MdbDirective.create({projectId:project.id,name:'D01-NAME'}, true); 
        await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:d01.id,projectId:project.id}, true);
        let d02 = await MdbDirective.create({projectId:project.id,name:'D01-NAME'}, true); 
        await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:d02.id,projectId:project.id}, true);

        await tester.mount(ExecuteAll);
        await tester.wrapper.vm.open();
        tester.wrapper.vm.enableStopOnError = true;
        await tester.click({ref:'btnStart'});
        
        tester.wrapper.vm.results[0].testcases = [
            {testcase:{id:1}}
        ];
        await tester.wrapper.vm.actionGotoTestcaseByResultIndex(0,0);
        expect(workspaceExpandTestcaseById).toBeCalled();
    });

    it('open & close', async () => {
        let tester = new UnitTester({
            props : {getWorkspace : () => {}},
        });
        await tester.setup();
        await tester.mount(ExecuteAll);

        await tester.wrapper.vm.open();
        await tester.click({ref:'btnClose'});
    });
});