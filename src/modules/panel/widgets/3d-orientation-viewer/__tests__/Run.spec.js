jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{
    return {
        OBJLoader : class {
            parse () {
                return {
                    rotation : {},
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
import Run from '../Run.vue'
describe('@/modules/panel/widgets/angle-indicator/Run.vue', () => {
    it('basic', async () => {
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

        let widget = {
            dataSource : 'variable',
            sourceX : 'VarX',
            sourceY : 'VarY',
            sourceZ : 'VarZ',
            dataType : 'degree',
        };
        let runtime = {
            variables : {
                VarX : 0,
                VarY : 0,
                VarZ : 0,
            },
            getVariableValue(name) {
                return this.variables[name];
            }
        };

        let tester = new Tester({
            props:{
                widget:widget,
                panel : new MdbPanel(),
                threeLib : three,
                runtime : runtime,
            }
        });

        await tester.setup();
        await tester.mount(Run);

        runtime.variables.VarX = 0;
        await tester.wrapper.vm.refresh();
        expect(tester.wrapper.vm.model.rotation.x).toBe(0);

        runtime.variables.VarX = 360;
        await tester.wrapper.vm.refresh();
        expect(tester.wrapper.vm.model.rotation.x.toFixed(1)).toBe('6.3');

        // data source : expression
        window.console.log = () => {}
        widget.dataSource = 'expression';
        widget.sourceExprX = '{{VarX}}';
        widget.sourceExprY = '{{VarY}}';
        widget.sourceExprZ = '{{VarZ}}';
        runtime.variables.VarX = '360';
        await tester.wrapper.vm.refresh();
        expect(tester.wrapper.vm.model.rotation.x.toFixed(1)).toBe('6.3');

        tester.wrapper.destroy();
    })
});