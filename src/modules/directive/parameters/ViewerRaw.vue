<template>
  <component
    :is="`viewer-${viewer}`"
    :directive="directive"
    :executor="executor"
    :mode="mode"
  ></component>
</template>
<script>
import FormViewer from './form/Viewer.vue'
import HexViewer from './hex/Viewer.vue'
import TextViewer from './text/Viewer.vue'
export default {
    name : 'DirectiveParameterViewerRaw',
    components : {
        'viewer-form' : FormViewer,
        'viewer-hex' : HexViewer,
        'viewer-text' : TextViewer,
    },
    props : {
        /**
         * name of raw viewer
         * @property {String}
         */
        viewer : {type:String},
        /**
         * name of viewer viewer mode
         * @property {String}
         */
        mode : {type:String},
        /**
         * instance of directive model
         * @property {MdbDirective}
         */
        directive : {},
        /**
         * instance of directive executor
         * @property {Object}
         */
        executor : {},
    },
}
</script>