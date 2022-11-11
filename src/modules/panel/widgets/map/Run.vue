<template>
  <div>
    <div 
      ref="mapContainer" 
      class="map-container" 
      :style="{
        width:`${widget.sizeWidth}px`,
        height:`${widget.sizeHeight}px`
      }"
    ></div>
  </div>
</template>
<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetMap',
    mixins : [WidgetViewerMixin],
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
            longitude:null,
            latitude:null,
        };
    },
    async mounted() {
        window._AMapSecurityConfig = {securityJsCode:'a40cc64f4f55fd1a663ff07cf1a0c216'};
        this.AMap = await AMapLoader.load(this.amapLoaderOptions);
        this.map = new this.AMap.Map(this.$refs.mapContainer, {
            zoom:11,
            center: [116.397428, 39.90923],
        });
        this.refresh();
    },
    beforeDestroy() {
        this.map.destroy();
        this.map = null;
    },
    methods : {
        /**
         * get attribute expression map
         * @override
         */
        getAttributeExpressionMap() {
            return [
                {name:'longitude',expr:this.widget.sourceExprLong},
                {name:'latitude',expr:this.widget.sourceExprLat},
            ];
        },

        /**
         * get value map
         * @override
         */
        getVariableMap() {
            let map = {};
            map[this.widget.sourceVariableLong] = 'longitude';
            map[this.widget.sourceVariableLat] = 'latitude';
            return map;
        },

        /**
         * update widget
         * @override
         */
        updateWidget() {
            if ( null === this.map ) {
                return ;
            }
            
            this.map.clearMap();

            let long = this.longitude * 1;
            let lat = this.latitude * 1;
            
            long = isNaN(long) ? 0 : long;
            lat = isNaN(lat) ? 0 : lat;

            let marker = new this.AMap.Marker({
                icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                position: [long, lat],
                anchor:'bottom-center'
            });
            this.map.add(marker);
            this.map.panTo([long, lat]);
        },
    },
}
</script>
<style scoped>
.map-container {border: solid 1px #646464;}
</style>