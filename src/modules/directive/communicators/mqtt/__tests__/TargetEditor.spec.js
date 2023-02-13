import Tester from '../../../../../utils/test/UnitTester.js'
import TargetEditor from '../TargetEditor.vue'
describe('@/communicators/mqtt/TargetEditor.vue', () => {
    it('normal use', async ( ) => {
        let target = {};
        
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : ( newTarget ) => target = newTarget,
            },
            mockStoreGetters : {
                communicators : {},
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.input({ref:'txtUri'},'mqtt://127.0.0.1:1883');
        expect(target.mqttUri).toBe('mqtt://127.0.0.1:1883');
        expect(tester.wrapper.findComponent({ref:'txtUsername'}).exists()).toBeFalsy();
        await tester.click({ref:'btnShowOptionModal'});
        await tester.input({ref:'txtClientId'},'CLIENT-ID');
        await tester.input({ref:'txtUsername'},'sige');
        await tester.input({ref:'txtPassword'},'PASSWORD');
        await tester.select({ref:'sltVersion'}, '5');
        await tester.emit({ref:'modalOptions'}, 'ok')
        expect(target.mqttClientId).toBe('CLIENT-ID');
        expect(target.mqttUsername).toBe('sige');
        expect(target.mqttPassword).toBe('PASSWORD');
        expect(target.mqttProtocolVersion).toBe('5');

        let editorConfig = TargetEditor.editorConfig();
        expect(editorConfig.name).toBe('Mqtt');
        expect(editorConfig.defaultDataType).toBe('byte');
        expect(editorConfig.defaultResponseViewer).toBe('hex');
    })

    it('debug config v5.0', async ( ) => {
        let target = {};
        let tester = new Tester({
            props : {
                value : target,
            },
            listeners : {
                input : ( newTarget ) => target = newTarget,
            },
            mockStoreGetters : {
                communicators : {},
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.input({ref:'txtUri'},'mqtt://127.0.0.1:1883');
        expect(target.mqttUri).toBe('mqtt://127.0.0.1:1883');

        expect(tester.wrapper.findComponent({ref:'txtUsername'}).exists()).toBeFalsy();
        await tester.click({ref:'btnShowOptionModal'}); 
        
        await tester.input({ref:'txtClientId'},'CLIENT-ID');
        await tester.input({ref:'txtUsername'}, 'sige');
        await tester.input({ref:'txtPassword'}, 'PASSWORD');
        await tester.select({ref:'sltVersion'}, '5');
        await tester.emit({ref:'modalOptions'}, 'ok');
        expect(target.mqttClientId).toBe('CLIENT-ID');
        expect(target.mqttUsername).toBe('sige');
        expect(target.mqttPassword).toBe('PASSWORD');
        expect(target.mqttProtocolVersion).toBe('5');

        // switch to publish tab
        await tester.click({ref:'btnShowOptionModal'});
        tester.wrapper.vm.$data.modalRequestOptionTab = 'publish';
        await tester.wrapper.vm.$nextTick();
        
        // add user properties
        await tester.click({ref:'btnUserPropertiesAdd'});
        await tester.input({ref:'inputUserPropertiesName',index:0},'Name001');
        await tester.input({ref:'inputUserPropertiesValue',index:0},'Value001');
        await tester.click({ref:'btnUserPropertiesItemAdd',index:0});
        await tester.input({ref:'inputUserPropertiesName',index:1},'Name002');
        await tester.input({ref:'inputUserPropertiesValue',index:1},'Value002');
        // delete the first property
        await tester.click({ref:'btnUserPropertiesItemDelete'},null,0);
        await tester.emit({ref:'modalOptions'}, 'ok');
        expect(target.mqttPublishUserProperties.length).toBe(1);
        expect(target.mqttPublishUserProperties[0].name).toBe('Name002');
        expect(target.mqttPublishUserProperties[0].value).toBe('Value002');
    }, 20000)
});