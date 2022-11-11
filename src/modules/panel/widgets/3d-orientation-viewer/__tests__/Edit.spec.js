jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{
    return {
        OBJLoader : class {
            parse () {
                return {
                    children : [{
                        material : {
                            color : {
                                set () {}
                            }
                        }
                    }]
                }
            }
        }
    };
}, {virtual:true});
jest.mock('three/examples/jsm/controls/OrbitControls.js', ()=>{
    return {
        OrbitControls : class {}
    }
}, {virtual:true});
import MdbPanel from '../../../../../models/MdbPanel.js';
import Tester from '../../../../../utils/test/UnitTester.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/3d-orientation-viewer/Edit.vue', () => {
    it('basic', async () => {
        let widget = {};
        let three = {
            WebGLRenderer : class {
                constructor() {
                    this.domElement = document.createElement('div');
                }
                setSize(){}
                setClearColor(){}
                clear() {}
                render(){}
                dispose(){}
            },
            PerspectiveCamera : class {
                constructor () {
                    this.position = {x:0,y:0,z:0};
                }
            },
            Scene : class {
                add () {}
            },
            AxesHelper : class {
                
            },
            AmbientLight : class {},
            PointLight : class {
                constructor () {
                    this.position = {set(){}};
                }
            }
        };

        let tester = new Tester({
            props:{
                value:widget,
                panel : new MdbPanel(),
                threeLib : three,
            }
        });

        await tester.setup();
        await tester.mount(Edit);

        tester.wrapper.vm.$refs.setting.open = jest.fn(() => Promise.resolve(true));
        await tester.wrapper.vm.setting();

        tester.wrapper.destroy();

        expect(Edit.widgetInfo().name).toBe('3d-orientation-viewer');
    })
});