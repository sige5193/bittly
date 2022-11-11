<template>
  <div>
    <div ref="viewer" :style="{width:`${widget.sizeWidth}px`,height:`${widget.sizeHeight}px`}"></div>
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[
        {name:'sourceX',label:$t('panel.widgets.threeDOriViewer.varSourceX')},
        {name:'sourceY',label:$t('panel.widgets.threeDOriViewer.varSourceY')},
        {name:'sourceZ',label:$t('panel.widgets.threeDOriViewer.varSourceZ')},
      ]"
      :dataSourceExprs="[
        {name:'sourceExprX',label:$t('panel.widgets.threeDOriViewer.varSourceX')},
        {name:'sourceExprY',label:$t('panel.widgets.threeDOriViewer.varSourceY')},
        {name:'sourceExprZ',label:$t('panel.widgets.threeDOriViewer.varSourceZ')},
      ]"
      :resizable="true"
      :tooltip-available="false"
    >
      <a-form-item :label="$t('panel.widgets.threeDOriViewer.dataType')">
        <a-radio-group ref="radioDataType" v-model="widget.dataType" @change="actionForceUpdate">
          <a-radio-button value="degree">{{$t('panel.widgets.threeDOriViewer.dataTypeDegree')}}</a-radio-button>
          <a-radio-button value="radian">{{$t('panel.widgets.threeDOriViewer.dataTypeRadian')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import EditMixin from '../WidgetEditMixin.js'
export default {
    name : 'Widget3DOrientationViewer',
    mixins : [EditMixin],
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
        };
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
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeHeight = 300;
            this.widget.sizeWidth = 300;
            this.widget.dataType = 'degree';
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
            let object = loader.parse(modelContent);
            object.children[0].material.color.set(0xe8b73b);
            this.scene.add(object);

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

        /**
         * update model
         * @overide
         */
        onSettingOK() {
            this.renderer.setSize(this.widget.sizeWidth, this.widget.sizeHeight);
        },

        /**
         * update widget
         */
        actionForceUpdate() {
            this.renderer.setSize(this.widget.sizeWidth, this.widget.sizeHeight);
            this.$forceUpdate();
        },
    },

    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name:'3d-orientation-viewer', 
            type:'3d-orientation-viewer',
            label : window.app.$t('panel.widgets.threeDOriViewer.name'), 
            image:require('./icon.png'),
            resizable : true,
        };
    },
}
</script>