<template>
  <div>
    <div class="p-2">
      <div class="res-body">
        <div 
          v-for="(valueRing, vrindex) in valueRingMap" 
          :key="vrindex" 
          class="ring" 
          :style="`background:${value[valueRing]};`"
        ></div>
      </div>
    </div>
    
    <div class="text-center p-2" style="font-size:2em;">
      <a-radio-group v-model="ringCount" button-style="solid" style="vertical-align: text-top;" @change="actionRingCountChange">
        <a-radio-button value="4">4</a-radio-button>
        <a-radio-button value="5">5</a-radio-button>
      </a-radio-group>
      &nbsp;&nbsp;&nbsp;
      <span>{{$t('app.toolCalculator.colorRingResistanceValueValue')}} : {{value.number}}</span>
      &nbsp;&nbsp;&nbsp;
      <span>{{$t('app.toolCalculator.colorRingResistanceValueErrorRange')}} : {{value.errorRangeValue}}</span>
    </div>

    <div class="text-center">
      <div v-for="(ring, rindex) in ringTable" :key="rindex" class="col-ring">
        <template v-if="ring.enable">
          <div v-for="(isColorEnable, cindex) in ring.colors" :key="cindex" class="cell-color">
            <a-button 
              size="small"
              :disabled="0 == isColorEnable" 
              :style="`background:${colorMap[cindex]};color:${colorMap[cindex]};`"
              @click="actionColorClick(rindex, cindex)"
            >*</a-button>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>
<script>
export default {
    data() {
        return {
            ringCount : '5',
            value : {
                num1 : 'black',
                num2 : 'black', 
                num3 : 'black',
                exponent : 'black',
                errorRange : 'brown',
                number : 0,
                errorRangeValue : 0,
            },
            valueRingMap : ['num1','num2', 'num3', 'exponent', 'errorRange'],
            colorMap : ['black','brown','red','orange','yellow','green','blue','purple','gray','white','gold', 'silver'],
            ringTable : [
                {colors:[1,1,1,1,1,1,1,1,1,1,0,0], enable:true, func:'num1'},
                {colors:[1,1,1,1,1,1,1,1,1,1,0,0], enable:true, func:'num2'},
                {colors:[1,1,1,1,1,1,1,1,1,1,0,0], enable:true, func:'num3'},
                {colors:[1,1,1,1,1,1,1,1,1,1,1,1], enable:true, func:'exponent'},
                {colors:[0,1,1,0,0,1,1,1,0,1,1,1], enable:true, func:'errorRange'},
            ],
        };
    },
    mounted() {
        this.recalculate();
    },
    methods : {
        /**
         * 重新计算
         */
        recalculate() {
            let value = [];
            value.push(`${this.colorMap.indexOf(this.value.num1)}`);
            value.push(`${this.colorMap.indexOf(this.value.num2)}`);
            if ( 5 == this.ringCount ) {
                value.push(`${this.colorMap.indexOf(this.value.num3)}`);
            }
            value = value.join('') * 1;

            let exponent = this.colorMap.indexOf(this.value.exponent);
            if ( 'gold' == this.value.exponent ) {
                exponent = -1;
            } else if ( 'silver' == this.value.exponent ) {
                exponent = -2;
            }
            value = value * Math.pow(10,exponent);
            if ( value >= 1000000 ) {
                value = `${value/1000000} MΩ`;
            } else if ( value >= 1000 ) {
                value = `${value/1000} KΩ`;
            } else {
                value = `${value} Ω`;
            }
            this.value.number = value;

            let erMap = [null,'±1%','±2%',null,null,'±0.5%','±0.25%','±0.1%',null,'+5~20%','±5%', '±10%'];
            this.value.errorRangeValue = erMap[this.colorMap.indexOf(this.value.errorRange)];
            this.$forceUpdate();
        },

        /**
         * 颜色点击
         */
        actionColorClick(rindex, cindex) {
            this.value[this.ringTable[rindex].func] = this.colorMap[cindex];
            this.recalculate();
        },

        /**
         * 环数改变
         */
        actionRingCountChange() {
            this.value = {
                num1 : 'black',
                num2 : 'black', 
                num3 : 'black',
                exponent : 'black',
                errorRange : 'brown',
                number : 0,
                errorRangeValue : 0,
            };
            if ( 4 == this.ringCount ) {
                this.ringTable[2].enable = false;
                this.valueRingMap = ['num1','num2', 'exponent', 'errorRange'];
            } else if ( 5 == this.ringCount ) {
                this.ringTable[2].enable = true;
                this.valueRingMap = ['num1','num2', 'num3', 'exponent', 'errorRange'];
            }
            this.recalculate();
        }
    },
    /**
     * 计算器信息
     */
    getInfo () {
        return {
            key : 'ColorRingResistanceValue',
            name : window.app.$t('app.toolCalculator.colorRingResistanceValue'),
        };
    },
}
</script>
<style scoped>
.col-ring {background: rgb(194, 194, 194);display: inline-block;width: 50px;margin: 0 20px;border-radius: 5px;}
.cell-color {padding: 5px;}
.res-body {width: 100%;height: 50px;border-radius: 50px;background: #7499ad;padding: 0 10%;}
.ring {width: 10px;height: 100%;background: #dfdfdf;display: inline-block;margin: 0 7%;}
</style>