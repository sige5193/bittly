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

    it('parameterFormItemsGetByRowNums', async () => {
        let tester = new Tester();
        await tester.setup();
        let runtime = new ScriptRuntime();
        
        runtime.parametersSet([]);
        await tester.expectError(() => runtime.parameterFormItemsGetByRowNums([1]), 'Unable to get parameter by row number : 1');
        await tester.expectError(() => runtime.parameterFormItemsGetByRowNums([{}]), 'Row number range requires start number by \"from\"');
        await tester.expectError(() => runtime.parameterFormItemsGetByRowNums([{from:1}]), 'Row number range requires end number by \"to\"');

        runtime.parametersSet(["ITEM01","ITEM02","ITEM03"]);
        expect(runtime.parameterFormItemsGetByRowNums([1])).toEqual(["ITEM01"]);
        expect(runtime.parameterFormItemsGetByRowNums([1,{from:1,to:2}])).toEqual(["ITEM01","ITEM01","ITEM02"]);
    })
});