import Tester from '../../../../utils/test/UnitTester.js';
import ScriptRuntime from '../ScriptRuntime.js';
describe('@/src/modules/directive/script/ScriptLib.js', () => {
    it('normal use', async () => {
        let tester = new Tester();
        await tester.setup();
        let runtime = new ScriptRuntime();
        
        runtime.parametersSet('HELLO');
        expect(runtime.parametersGet()).toBe('HELLO');

        runtime.variableSet('N001','V001');
        expect(runtime.scriptResult['N001']).toBe('V001');

        expect(runtime.parameterFormItemGetByIndex(1)).toBeNull;
        expect(runtime.parameterFormItemValueGetByIndex(1)).toEqual('');
        expect(runtime.parameterFormItemGetByName('F001')).toBeNull;
        expect(runtime.parameterFormValueGetByName('F001')).toEqual('');

        runtime.parametersSet([{name:'F001',value:'V001'}]);
        expect(runtime.parameterFormItemGetByIndex(1)).toEqual({name:'F001',value:'V001'});
        expect(runtime.parameterFormItemValueGetByIndex(1)).toEqual('V001');
        expect(runtime.parameterFormItemGetByName('F001')).toEqual({name:'F001',value:'V001'});
        expect(runtime.parameterFormValueGetByName('F001')).toEqual('V001');
        expect(runtime.parameterFormValueGetByName('NOT-EXISTS')).toEqual('');
    })
});