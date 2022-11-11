import ParserScriptRuntime from '../ParserScriptRuntime.js'
describe('@/modules/directive/response/plotter/ParserScriptRuntime.js', () => {
    it( 'basic', async () => {
        let runtime = new ParserScriptRuntime();
        runtime.setData(Buffer.from([1,2,3,4,5,6,7,8,9]));
        let ch01 = runtime.channelAdd();
        expect(ch01).toBe(0);

        runtime.channelDataPush(ch01, 1);
        runtime.channelDataPush(ch01, 2);
        expect(runtime.channels).toEqual([[1,2]]);
    });
});