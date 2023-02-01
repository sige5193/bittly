import Tester from '../../../utils/test/UnitTester.js'
import Config from '../Config.vue'
import MdbDirective from '../../../models/MdbDirective.js'
describe('@/src/modules/directive/Config.vue', () => {
    it('ok', async ( done ) => {
        let tester = new Tester();
        await tester.setup();
        await tester.mount(Config);

        let directive = new MdbDirective();
        tester.wrapper.vm.open(directive).then(() => {
            expect(directive.name).toBe('TEST-NAME');
            expect(directive.description).toBe('TEST-DESC');
            expect(directive.attributes[0].name).toBe('ATTR01');
            expect(directive.attributes[0].value).toBe('VAL01');
            done();
        });
        await tester.msleep(200);

        await tester.input({ref:'inputName'},'TEST-NAME');
        await tester.textareaInput({ref:'inputDesc'}, 'TEST-DESC');
        
        // delete all attributes, it would create a new one
        await tester.click({ref:'btnAttrDel'},null,0);

        // input attribute
        await tester.input({ref:'attrName_0',index:0},'ATTR01');
        await tester.input({ref:'attrValue_0',index:0},'VAL01');
        
        // add attribute and delete it
        await tester.click({ref:'btnAttrAdd',index:0});
        await tester.click({ref:'btnAttrDel',index:1});

        // add an empty attribute
        await tester.click({ref:'btnAttrAdd',index:0});
        
        // update directive
        await tester.emit({ref:'modalEditor'},'ok');
    })

    it('cancel', async ( done ) => {
        let tester = new Tester();
        await tester.setup();
        await tester.mount(Config);

        let directive = new MdbDirective();
        directive.name = 'NAME';
        directive.attributes = [{name:'a',value:'v'}];
        tester.wrapper.vm.open(directive).then(() => {}).catch(() => {
            expect(directive.name).toBe('NAME');
            done();
        });
        await tester.msleep(200);
        
        await tester.input({ref:'inputName'},'TEST-NAME');
        await tester.emit({ref:'modalEditor'},'cancel');
    })
});