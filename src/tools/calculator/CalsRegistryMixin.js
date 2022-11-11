import ColorRingResistanceValue from './cals/ColorRingResistanceValue.vue'
import DataValidation from './cals/DataValidation.vue'
export default {
    components : {
        ColorRingResistanceValue,
        DataValidation,
    },
    /**
     * 计算器数据
     * @returns 
     */
    data() {
        return {
            cals : [],
        };
    },
    methods : {
        /**
         * 初始化计算器列表
         */
        initCalList() {
            this.cals.push(ColorRingResistanceValue.getInfo());
            this.cals.push(DataValidation.getInfo());
        }
    },
};