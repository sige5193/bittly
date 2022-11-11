import WidgetButton from './button/Edit.vue'
import WidgetSwitch from './switch/Edit.vue'
import WidgetTextInput from './text-input/Edit.vue'
import WidgetNumberInput from './number-input/Edit.vue'
import WidgetSlider from './slider/Edit.vue'
import WidgetRadio from './radio/Edit.vue'
import WidgetLabel from './label/Edit.vue'
import WidgetProgressViewer from './progress-bar/Edit.vue'
import WidgetTextViewer from './text-viewer/Edit.vue'
import WidgetNumberViewer from './number-viewer/Edit.vue'
import WidgetBattery from './battery/Edit.vue'
import WidgetThermometer from './thermometer/Edit.vue'
import WidgetGauge from './gauge/Edit.vue'
import WidgetLed from './led/Edit.vue'
import WidgetChartLine from './line-chart/Edit.vue'
import WidgetTimer from './timer/Edit.vue'
import WidgetLiquidfill from './liquidfill/Edit.vue'
import WidgetTerminal from './terminal/Edit.vue'
import WidgetOffsetAngleIndicator from './offset-angle-indicator/Edit.vue'
import WidgetGroupBox from './groupbox/Edit.vue'
import WidgetSelect from './select/Edit.vue'
import WidgetMap from './map/Edit.vue'
import WidgetAngleIndicator from './angle-indicator/Edit.vue'
import Widget3dOrientationViewer from './3d-orientation-viewer/Edit.vue'
export default {
    /**
     * componments list
     */
    components : {
        'widget-thermometer' : WidgetThermometer,
        'widget-battery' : WidgetBattery,
        'widget-switch' : WidgetSwitch,
        'widget-button' : WidgetButton,
        'widget-text' : WidgetTextInput,
        'widget-number' : WidgetNumberInput,
        'widget-slider' : WidgetSlider,
        'widget-radio' : WidgetRadio,
        'widget-select' : WidgetSelect,
        'widget-label' : WidgetLabel,
        'widget-progress-bar' : WidgetProgressViewer,
        'widget-text-viewer' : WidgetTextViewer,
        'widget-number-viewer' : WidgetNumberViewer,
        'widget-gauge' : WidgetGauge,
        'widget-led' : WidgetLed,
        'widget-line-chart' : WidgetChartLine,
        'widget-timer' : WidgetTimer,
        'widget-liquidfill' : WidgetLiquidfill,
        'widget-terminal' : WidgetTerminal,
        'widget-offset-angle-indicator' : WidgetOffsetAngleIndicator,
        'widget-groupbox' : WidgetGroupBox,
        'widget-map':WidgetMap,
        'widget-angle-indicator' : WidgetAngleIndicator,
        'widget-3d-orientation-viewer' : Widget3dOrientationViewer,
    },
    data() {
        return {
            widgets : [
                WidgetButton.widgetInfo(),
                WidgetSwitch.widgetInfo(),
                WidgetTextInput.widgetInfo(),
                WidgetNumberInput.widgetInfo(),
                WidgetSlider.widgetInfo(),
                WidgetRadio.widgetInfo(),
                WidgetSelect.widgetInfo(),
                WidgetLabel.widgetInfo(),
                WidgetProgressViewer.widgetInfo(),
                WidgetTextViewer.widgetInfo(),
                WidgetNumberViewer.widgetInfo(),
                WidgetBattery.widgetInfo(),
                WidgetThermometer.widgetInfo(),
                WidgetGauge.widgetInfo(),
                WidgetLed.widgetInfo(),
                WidgetChartLine.widgetInfo(),
                WidgetTimer.widgetInfo(),
                WidgetLiquidfill.widgetInfo(),
                WidgetTerminal.widgetInfo(),
                WidgetAngleIndicator.widgetInfo(),
                WidgetOffsetAngleIndicator.widgetInfo(),
                WidgetGroupBox.widgetInfo(),
                WidgetMap.widgetInfo(),
                Widget3dOrientationViewer.widgetInfo(),
            ],
        }
    },
    methods : {
        /**
         * get if widget is resizable, default to false.
         * @param {String} widgetName 
         * @returns {Boolean}
         */
        isWidgetResizable( widgetName ) {
            for ( let i=0; i<this.widgets.length; i++ ) {
                if ( this.widgets[i].name == widgetName ) {
                    return this.widgets[i].resizable || false;
                }
            }
            return false;
        }
    },
}