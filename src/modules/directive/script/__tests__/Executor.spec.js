import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Executor from '../Executor.js';
describe('@/src/modules/directive/script/Executor.js', () => {
    it('normal use', async () => {
        let directive = new MdbDirective();
        let tester = new Tester();
        await tester.setup();
        let project = await tester.activeNewProject();

        let executor = new Executor(directive);
        executor.setProp('params', 'HELLO');
        executor.setProject(project);
        let script = `
            let params = $this.parametersGet();
            $this.variableSet('p', params);
        `;
        executor.exec(script);
        let result = executor.getResult();
        expect(result.p).toBe('HELLO');

        // error in script
        tester.expectError(() => executor.exec('throw Error("xxx")'), 'failed to execute script : xxx');

        // error in project script
        project.script = 'throw Error("yyy");'
        tester.expectError(() => executor.exec('console.log("HELLO")'), 'failed to build project script : yyy');
        project.script = '';

        // quick call
        result = executor.execQuickCall('echo', ['hello']);
        expect(result).toBe('hello');
        project.script = `project.hello = ( name ) => 'hello ' + name;`;
        result = executor.execQuickCall('hello', ['sige']);
        expect(result).toBe('hello sige');
        tester.expectError(()=>executor.execQuickCall('not-exists', []), 'invalid quick function name : not-exists');

        // get project object
        window.app.$store.getters.projectActivedId = 'not-exists';
        let projectObj = await Executor.getProjectScriptObjectOfCurrentProject();
        expect(projectObj).toEqual({});

        project.script = `project.hello = ( name ) => 'hello ' + name;`;
        await project.save();
        window.app.$store.getters.projectActivedId = project.id;
        projectObj = await Executor.getProjectScriptObjectOfCurrentProject();
        expect(typeof(projectObj.hello)).toBe('function');
    })
});