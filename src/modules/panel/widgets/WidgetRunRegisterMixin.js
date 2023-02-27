import WidgetAngleIndicator from './angle-indicator/Run.vue'
import WidgetMap from './map/Run.vue'
import WidgetSelect from './select/Run.vue'
import WidgetLed from './led/Run.vue'
import WidgetGroupBox from './groupbox/Run.vue'
import WidgetOffsetAngleIndicator from './offset-angle-indicator/Run.vue'
import WidgetTerminal from './terminal/Run.vue'
import WidgetLiquidfill from './liquidfill/Run.vue'
import WidgetTimer from './timer/Run.vue'
import WidgetChartLine from './line-chart/Run.vue'
import WidgetGauge from './gauge/Run.vue'
import WidgetThermometer from './thermometer/Run.vue'
import WidgetBattery from './battery/Run.vue'
import WidgetButton from './button/Run.vue'
import WidgetSwitch from './switch/Run.vue'
import WidgetText from './text-input/Run.vue'
import WidgetNumber from './number-input/Run.vue'
import WidgetSlider from './slider/Run.vue'
import WidgetRadio from './radio/Run.vue'
import WidgetLabel from './label/Run.vue'
import WidgetProgress from './progress-bar/Run.vue'
import WidgetTextViewer from './text-viewer/Run.vue'
import WidgetNumberViewer from './number-viewer/Run.vue'
import Widget3dOrientationViewer from './3d-orientation-viewer/Run.vue'
import WidgetStateViewer from './state-viewer/Run.vue'
export default {
    /**
     * widget list
     */
    components : {
        'widget-button' : WidgetButton,
        'widget-switch' : WidgetSwitch,
        'widget-thermometer' : WidgetThermometer,
        'widget-battery' : WidgetBattery,
        'widget-text' : WidgetText,
        'widget-number' : WidgetNumber,
        'widget-slider' : WidgetSlider,
        'widget-radio' : WidgetRadio,
        'widget-label' : WidgetLabel,
        'widget-progress-bar' : WidgetProgress,
        'widget-text-viewer' : WidgetTextViewer,
        'widget-number-viewer' : WidgetNumberViewer,
        'widget-gauge' : WidgetGauge,
        'widget-line-chart' : WidgetChartLine,
        'widget-timer' : WidgetTimer,
        'widget-liquidfill' : WidgetLiquidfill,
        'widget-terminal' : WidgetTerminal,
        'widget-offset-angle-indicator' : WidgetOffsetAngleIndicator,
        'widget-groupbox' : WidgetGroupBox,
        'widget-led' : WidgetLed,
        'widget-select' : WidgetSelect,
        'widget-map' : WidgetMap,
        'widget-angle-indicator' : WidgetAngleIndicator,
        'widget-3d-orientation-viewer' : Widget3dOrientationViewer,
        'widget-state-viewer' : WidgetStateViewer,
    },
};