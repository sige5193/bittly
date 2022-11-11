<template>
  <div><div ref="viewer" :style="viewerStyle"></div></div>
</template>
<script>
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import WidgetRunViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetLabel',
    mixins : [WidgetRunViewerMixin],
    props : {
        threeLib : {default:null}
    },
    data () {
        return {
            /**
             * threejs lib
             * @property {Object}
             */
            three : null,

            renderer: null,
            camera: null,
            scene: null,
            light: null,
            controls: null,
            model : null,

            rotationX : 0,
            rotationY : 0,
            rotationZ : 0,
        };
    },
    computed : {
        viewerStyle () {
            return {
                width:`${this.widget.sizeWidth}px`,
                height:`${this.widget.sizeHeight}px`
            };
        },
    },
    mounted() {
        this.initViewer();
    },
    beforeDestroy () {
        this.renderer.dispose();
        this.renderer = null;
        this.camera = null
        this.scene = null
        this.light = null
    },
    methods : {
        /**
         * get attribute expression map
         * @override
         */
        getAttributeExpressionMap() {
            return [
                {name:'rotationX',expr:this.widget.sourceExprX},
                {name:'rotationY',expr:this.widget.sourceExprY},
                {name:'rotationZ',expr:this.widget.sourceExprZ},
            ];
        },
        
        /**
         * get variable map
         * @override
         */
        getVariableMap() {
            let map = {};
            map[this.widget.sourceX] = 'rotationX';
            map[this.widget.sourceY] = 'rotationY';
            map[this.widget.sourceZ] = 'rotationZ';
            return map;
        },
        
        /**
         * update widget
         * @override
         */
        updateWidget() {
            let x = this.rotationX * 1;
            x = isNaN(x) ? 0 : x;
            let y = this.rotationY * 1;
            y = isNaN(y) ? 0 : y;
            let z = this.rotationZ * 1;
            z = isNaN(z) ? 0 : z;

            if ( 'degree' == this.widget.dataType ) {
                x = x * (Math.PI / 180);
                y = y * (Math.PI / 180);
                z = z * (Math.PI / 180);
            }

            this.model.rotation.x = x;
            this.model.rotation.y = y;
            this.model.rotation.z = z;
        },

        /**
         * init viewer
         */
        initViewer() {
            this.three = THREE;
            if ( null != this.threeLib ) {
                this.three = this.threeLib;
            }

            // renderer
            this.renderer = new this.three.WebGLRenderer({antialias:true});
            this.renderer.setSize(this.widget.sizeWidth, this.widget.sizeHeight)
            this.renderer.setClearColor(0xCCCCCC, 1.0)
            this.$refs.viewer.appendChild(this.renderer.domElement)

            // camera
            this.camera = new this.three.PerspectiveCamera(75, this.widget.sizeWidth / this.widget.sizeHeight, 0.5, 1000);
            this.camera.position.x = 6;
            this.camera.position.y = 6;
            this.camera.position.z = 6;

            // scence
            this.scene = new this.three.Scene()
            let helper = new this.three.AxesHelper(1000);
            this.scene.add(helper)

            // model
            let modelContent = require('./plane.obj.js');
            let loader = new OBJLoader();
            this.model = loader.parse(modelContent);
            this.scene.add(this.model);
            
            // light
            let ambientLight = new this.three.AmbientLight(0xCCCCCC, 0.4);
            this.scene.add(ambientLight)
            this.light = new this.three.PointLight(0xffffff, 1);
            this.light.position.set(50, 200, 100)
            this.scene.add(this.light)

            // control
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            this.controls.enableZoom = true
            this.controls.autoRotate = false
            this.controls.minDistance = 1
            this.controls.maxDistance = 1000
            this.controls.enablePan = true

            this.render();
        },

        /**
         * render viewer
         **/
        render () {
            if ( null != this.renderer ) {
                this.renderer.clear();
                this.renderer.render(this.scene, this.camera);
            }
            window.requestAnimationFrame(this.render);
        },
    }
}
</script>