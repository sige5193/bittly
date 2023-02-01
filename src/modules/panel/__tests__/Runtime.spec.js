import Runtime from '../Runtime.js'
import MdbPanel from '../../../models/MdbPanel.js'
describe('@/modules/panel/Runtime.js', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        panel.variables = [];
        panel.variables.push({name:'var001', type:'string',defaultValue:'test-content'});
        panel.variables.push({name:'var002', type:'string'});

        let widgetRefresh = jest.fn();
        let valueWatcher = jest.fn();
        let component = {
            $refs : {
                widgets : [{refresh:widgetRefresh}],
            },
            refreshPanel() {}
        };
        let runtime = new Runtime(panel, component);
        runtime.addVariableWatcher('var001', valueWatcher);
        runtime.addVariableWatcher('var-not-exists', ()=>{});

        // check default value
        expect(runtime.getVariableValue('var001')).toBe('test-content');
        
        // update variable
        runtime.setVariableValue('var001', 'new-content');
        expect(widgetRefresh).toBeCalledTimes(1);
        runtime.setVariableValue('var-not-exists','xxx');

        // check variable value
        expect(runtime.getVariableValue('var001')).toBe('new-content');
        expect(valueWatcher).toBeCalled();

        // get value from none exists variable
        expect(runtime.getVariableValue('not-exists','default-value')).toBe('default-value');
        expect(runtime.getVariableValue(undefined,'default-value')).toBe('default-value');

        // push request log
        runtime.requestLogPush({});
        expect(widgetRefresh).toBeCalledTimes(1);
    })
});