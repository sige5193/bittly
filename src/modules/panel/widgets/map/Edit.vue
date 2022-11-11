<template>
  <div class="position-relative">
    <div class="cover"></div>

    <div 
      ref="mapContainer" 
      class="map-container" 
      :style="{
        width:`${widget.sizeWidth}px`,
        height:`${widget.sizeHeight}px`
      }"
    ></div>

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']" 
      :dataSourceVars="[
        {name:'sourceVariableLong',label:$t('panel.widgets.map.longitude')},
        {name:'sourceVariableLat',label:$t('panel.widgets.map.latitude')},
      ]"
      :dataSourceExprs="[
        {name:'sourceExprLong',label:$t('panel.widgets.map.longitude')},
        {name:'sourceExprLat',label:$t('panel.widgets.map.latitude')},
      ]"
      :resizable="true"
      :tooltip-available="false"
    ></modal-viewer-widget-setting>
  </div>
</template>
<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetMap',
    mixins : [WidgetMixin],
    data() {
        return {
            /**
             * class of amap
             * @property {Class}
             */
            AMap : null,
            /**
             * options for amap loader
             * @property {Object}
             */
            amapLoaderOptions : {
                key: "ee5dab7c2701c6a1ef6698ad40945dbf",
                version: "2.0",
                plugins: []
            },
            /**
             * instance of amap
             * @property {Object}
             */
            map : null,
        };
    },
    async mounted() {
        window._AMapSecurityConfig = {securityJsCode:'a40cc64f4f55fd1a663ff07cf1a0c216'};
        this.AMap = await AMapLoader.load(this.amapLoaderOptions);
        this.refreshMap();
    },
    beforeDestroy() {
        this.map.destroy();
    },
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeHeight = 200;
            this.widget.sizeWidth = 200;
        },

        /**
         * refresh map
         */
        refreshMap() {
            this.map = new this.AMap.Map(this.$refs.mapContainer, {
                zoom:11,
                center: [116.397428, 39.90923],
            });
        },

        /**
         * refresh widget
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },
    },

    /**
     * get widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'map', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.map.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.map-container {border: solid 1px #646464;}
.cover {position: absolute;width: 100%;height: 100%;background: transparent;z-index: 99;}
</style>