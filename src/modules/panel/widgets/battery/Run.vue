<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <div ref="container"></div>
  </a-tooltip>
</template>
<script>
import { SVG } from '@svgdotjs/svg.js'
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetBattery',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : null,
            valueRender : null,
        };
    },
    mounted() {
        this.drawBattery();
    },
    methods : {
        /**
         * get attribute expression map
         * @override
         */
        getAttributeExpressionMap() {
            return [{name:'value',expr:this.widget.sourceExpression}];
        },
        
        /**
         * drar battery
         */
        drawBattery() {
            let draw = SVG().addTo(this.$refs.container).size(100, 40);
            let rect = draw.rect(80, 30);
            rect.attr({ x: 5, y: 8 })
            rect.radius(5);
            rect.attr({fill: 'none'});
            rect.stroke({ color: '#000',width: 5 })
            
            let head = draw.rect(10,10);
            head.attr({ x: 83, y: 17 });
            head.radius(10);

            this.valueRender = draw.rect(0,20);
            this.valueRender.move(10, 13);
        },

        /**
         * get value map
         * @override
         */
        getVariableMap() {
            let map = {};
            map[this.widget.sourceVariable] = 'value';
            return map;
        },

        /**
         * update render
         * @override
         */
        updateWidget() {
            let min = this.widget.minValue * 1;
            let max = this.widget.maxValue * 1;
            let range = max - min;
            let rangeValue = this.value * 1 - min;
            if ( rangeValue < 0 ) {
                rangeValue = 0;
            }
            if ( rangeValue > range ) {
                rangeValue = range;
            }
            let valueRenderWidth = 69;

            let widthRatio = rangeValue / range;
            let valueWidth = valueRenderWidth * widthRatio;
            this.valueRender.width(valueWidth);
        }
    },
}
</script>