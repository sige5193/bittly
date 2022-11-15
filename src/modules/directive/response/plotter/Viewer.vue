<template>
  <div class="border p-1 rounded d-flex flex-dir-column h-100" style="min-height:300px;">
    <a-row>
      <a-col :span="12">
        <!-- parser selector -->
        <a-select size="small" class="ml-1 mr-1" style="width: 150px" ref="selectParser"
          v-model="parserOptions.parser" @change="actionParserHandlerChanged"
        >
          <a-select-option value="num-num-crlf">[num] [num]CRLF</a-select-option>
          <a-select-option value="data-frame">{{$t('directive.response.plotter.parserDataFrame')}}</a-select-option>
          <a-select-option value="data-matrix">{{$t('directive.response.plotter.parserDataMatrix')}}</a-select-option>
          <a-select-option value="form">{{$t('directive.response.plotter.parserForm')}}</a-select-option>
          <a-select-option value="script">{{$t('directive.response.plotter.parseTypeCustom')}}</a-select-option>
        </a-select>
    
        <!-- parser setting -->
        <component ref="parser"
          v-model="parserOptions"
          :is="`parser-${parserOptions.parser}`"
          :directive="directive"
          :responseList="responseList"
          :channelDataPush="channelDataPush"
          @option-update="actionParserOptionUpdate"
        ></component>
      </a-col>

      <a-col :span="12" class="text-right">
        <div class="border rounded d-inline-block mr-1">
          <span class="d-inline-block pl-2 pr-2 border-right" style="background-color:#f5f5f5;line-height: 22px;">
            {{$t('directive.response.plotter.dataPoint')}}
          </span> 
          <a-switch class="ml-1 mr-1" size="small" style="vertical-align: super;" default-checked 
            v-model="parserOptions.dataPointEnable" 
            @change="actionParserOptionUpdate"
          />
        </div>
      </a-col>
    </a-row>

    <!-- chart viewer -->
    <div class="flex-grow h-0 d-flex flex-dir-column">
      <canvas class="flex-grow h-0" ref="canvasPlotter"></canvas>
      <a-slider range :min="0" :max="channelDataItemCount" :step="1" 
        v-model="xAxisRange" class="my-0 mx-2"
        :tip-formatter="actionXAxisRangeTipFormatter"
        @afterChange="actionXAxisRangeChange"
      />
      <a-row class="text-small">
        <a-col :span="8">{{timelineItems[0]}}</a-col>
        <a-col :span="8" class="text-center">
          [{{timelineItems[xAxisRange[0]]}} ~ {{timelineItems[xAxisRange[1]-1]}}] 
          [{{xAxisRange[0]}} ~ {{this.xAxisRange[1]}} / {{this.channelDataItemCount}}]
        </a-col>
        <a-col :span="8" class="text-right">{{this.timelineItems.at(-1)}}</a-col>
      </a-row>
    </div>
  </div>
</template>
<script>
import Formatter from '../../../../utils/Formatter.js'
import Chart from 'chart.js'
import zoom from 'chartjs-plugin-zoom'
import Common from '@/utils/Common.js'
import ViewerMixin from '../ViewerMixin.js'
import ParserScript from './parsers/Script.vue'
import ParserNumNumCrlf from './parsers/NumNumCrlf.vue'
import ParserDataFrame from './parsers/DataFrame.vue'
import ParserDataMatrix from './parsers/DataMatrix.vue'
import ParserForm from './parsers/Form.vue'
import MyObject from '../../../../utils/datatype/MyObject.js'
export default {
    name : 'BlockResponseViewerPlotter',
    mixins : [ViewerMixin],
    components : {
        'parser-script' : ParserScript,
        'parser-num-num-crlf' : ParserNumNumCrlf,
        'parser-data-frame' : ParserDataFrame,
        'parser-data-matrix' : ParserDataMatrix,
        'parser-form' : ParserForm,
    },
    props: {
        /**
         * @property {Buffer}
         */
        content:{},
        /**
         * @property {MdbDirective}
         */
        value:{},
        /**
         * @property {Array<Buffer>}
         */
        responseList : {default:()=>[]},
    },
    data() {
        return {
            /**
             * directive model
             * @property {MdbDirective|null}
             */
            directive : null,
            /**
             * options of parser
             * @proprty {Object}
             */
            parserOptions : {},
            /**
             * the position of content where start to parse
             * @property {Number}
             */
            parseStartPos : 0,
            /**
             * data of parsed channels
             * @property {Array<Array<Number>>}
             */
            channelDataList : [],
            /**
             * instance of charjs
             * @property {Object}
             */
            chart : null,
            /**
             * size of x
             * @property {Number}
             */
            channelDataItemCount : 0,
            /**
             * @property {Array<Number>}
             */
            xAxisRange : [0,0],
            /**
             * @property {Array<Number>}
             */
            renderedXAxisRange : [0,0],
            /**
             * timestamp in microseconds of time first data.
             * @property {Number|null} 
             */
            startTime : null,
            /**
             * @property {Array<String>}
             */
            timelineItems : [],
            /**
             * @property {Callback}
             */
            executorResizedCallback : null,
        };
    },
    watch : {
        content() {
            this.refresh();
        },
    },
    created() {
        this.initVModel();
    },
    /**
     * - register event handler for `directive-executor-resized` 
     * - create chartjs instance
     */
    mounted() {
        window.plotter = this;
        this.executorResizedCallback = () => this.onExecutorResized();
        this.$eventBus.$on('directive-executor-resized', this.executorResizedCallback);
        this.setupChart();
        this.$nextTick(() => this.refresh());
    },
    /**
     * - remove event handler for `directive-executor-resized`
     * - destory the chartjs instance
     */
    beforeDestroy() {
        this.$eventBus.$off('directive-executor-resized', this.executorResizedCallback);
        this.chart.chart.destroy();
    },
    methods : {
        /**
         * init v-model
         */
        initVModel() {
            this.directive = this.value;

            this.parserOptions = {};
            if ( undefined != this.directive.responseFormatter.plotter ) {
                this.parserOptions = this.directive.responseFormatter.plotter;
            }
            MyObject.applyDefaultValues(this.parserOptions, {
                parser : 'data-matrix',
                dataPointEnable : true,
            });
        },

        /**
         * update v-model
         */
        updateVModel() {
            let responseFormatter = Common.objCopy(this.directive.responseFormatter);
            responseFormatter.plotter = this.parserOptions;
            this.directive.responseFormatter = Common.objCopy(responseFormatter);
            this.$emit('input', this.directive);
        },

        /**
         * event handlr on executor resized
         */
        async onExecutorResized() {
            this.chart.chart.resize();
        },

        /**
         * setup chart
         */
        setupChart() {
            let ctx = this.$refs.canvasPlotter.getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {labels: [],datasets: []},
                plugins: [zoom],
                options: {
                    maintainAspectRatio: false,
                    responsive: true,  
                    animation : {duration : 0},
                    hover: {animationDuration: 0},
                    responsiveAnimationDuration: 0,
                    elements: {line: {tension: 0}},
                    scales: {
                        xAxes:[{ticks: {display: false}}],
                        yAxes: [{position: 'right'}]
                    },
                    plugins: {
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'y',
                                threshold: 10,
                                onPan: () => this.handleChartZoom(),
                                onPanComplete: () => this.handleChartZoom(),
                            },
                            zoom: {
                                enabled: true,
                                drag: false,
                                mode: 'y',
                                speed: 0.1,
                                threshold: 2,
                                sensitivity: 3,
                                onZoom: () => this.handleChartZoom(),
                                onZoomComplete: () => this.handleChartZoom(),
                            }
                        }
                    }
                },
            });
        },

        /**
         * event handler on chart zoom/zoomComplete pan/panComplete
         */
        handleChartZoom() {
            this.chart.options.scales.xAxes[0].ticks.display = false;
            this.chart.update(0);
        },

        /**
         * push data to channel data list
         */
        channelDataPush(values) {
            if ( null === this.startTime ) {
                this.startTime = Date.now();
            }
            this.timelineItems.push(Formatter.asDurationMS(Date.now()-this.startTime));

            let nowDate = new Date();
            for ( let i=0; i<values.length; i++ ) {
                if ( undefined == this.channelDataList[i] ) {
                    this.channelDataList[i] = [];
                }
                this.channelDataList[i].push({y:values[i], x:nowDate});
            }
            if ( this.xAxisRange[1] == this.channelDataItemCount ) {
                this.xAxisRange[1] ++;
                if ( 0 != this.xAxisRange[0] ) {
                    this.xAxisRange[0] ++;
                }
                this.$forceUpdate();
            }
            this.channelDataItemCount ++;
        },

        /**
         * event handler on parser option updated
         */
        actionParserOptionUpdate() {
            this.updateVModel();
            this.chart.data.datasets = [];
            this.chart.data.labels = [];
            this.parseStartPos = 0;
            this.channelDataList = [];
            this.renderedXAxisRange = [0,0];
            this.xAxisRange = [0,0];
            this.channelDataItemCount = 0;
            this.refresh();
        },

        /**
         * refresh chart on event time the content changed. 
         */
        refresh() {
            if ( null == this.content ) {
                return ;
            }

            let parseContent = this.content.slice(this.parseStartPos);
            try {
                this.parseStartPos += this.$refs.parser.parse(parseContent);
            } catch ( e ) {
                this.$message.error(e.message);
                return;
            }

            for ( let i=0; i<this.channelDataList.length; i++ ) {
                if ( undefined !== this.chart.data.datasets[i] ) {
                    continue;
                }
                this.chart.data.datasets.push({
                    label: this.$refs.parser.getChannelLabel(i),
                    fill:false,
                    borderColor: this.generateRandomColor(),
                    borderWidth : 2,
                    pointRadius : this.parserOptions.dataPointEnable ? 2 : 0,
                    data: [],
                });
            }

            this.refreshChartContent();
        },
        
        /**
         * Generate randome color for channel
         * @return {String}
         */
        generateRandomColor() {
            let r = Math.floor(Math.random() * 255);
            let g = Math.floor(Math.random() * 255);
            let b = Math.floor(Math.random() * 255);
            return `rgb(${r},${g},${b})`;
        },

        /**
         * handle on parser handler changed
         */
        actionParserHandlerChanged() {
            this.actionParserOptionUpdate();
        },

        /**
         * update chart content by given display range
         */
        refreshChartContent() {
            let start = this.xAxisRange[0] || 1;
            if ( this.renderedXAxisRange[0] < start-1 ) {
                this.chart.data.labels.reverse();
                for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                    this.chart.data.datasets[ci].data.reverse();
                }

                for ( let i=this.renderedXAxisRange[0]; i<start-1; i++ ) {
                    this.chart.data.labels.pop();
                    for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                        this.chart.data.datasets[ci].data.pop();
                    }
                    this.renderedXAxisRange[0]++;
                }

                for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                    this.chart.data.datasets[ci].data.reverse();
                }
                this.chart.data.labels.reverse();
            }

            if ( this.renderedXAxisRange[0] > start-1 ) {
                this.chart.data.labels.reverse();
                for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                    this.chart.data.datasets[ci].data.reverse();
                }

                for ( let i=this.renderedXAxisRange[0]; i>start-1; i-- ) {
                    this.chart.data.labels.push(this.timelineItems[i-1]);
                    for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                        this.chart.data.datasets[ci].data.push(this.channelDataList[ci][i-1]);
                    }
                    this.renderedXAxisRange[0]--;
                }

                this.chart.data.labels.reverse();
                for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                    this.chart.data.datasets[ci].data.reverse();
                }
            }

            if ( this.renderedXAxisRange[1] < this.xAxisRange[1] ) {
                for ( let i=this.renderedXAxisRange[1]; i<this.xAxisRange[1]; i++ ) {
                    this.chart.data.labels.push(this.timelineItems[i]);
                    for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                        this.chart.data.datasets[ci].data.push(this.channelDataList[ci][i]);
                    }
                    this.renderedXAxisRange[1]++;
                }
            }

            for ( let i=this.renderedXAxisRange[1]; i>this.xAxisRange[1]; i-- ) {
                this.chart.data.labels.pop();
                for ( let ci=0; ci<this.channelDataList.length; ci++ ) {
                    this.chart.data.datasets[ci].data.pop();
                }
                this.renderedXAxisRange[1]--;
            }

            this.chart.update();
        },

        /**
         * export response as excel file.
         */
        async exportAsExcel() {
            let options = {};
            
            // headers
            options.columns = [];
            for ( let i=0; i<this.channelDataList.length; i++ ) {
                options.columns.push({header:this.$refs.parser.getChannelLabel(i),key:`ch_${i}`});
            }

            // data
            options.data = [];
            for ( let rowIndex=0; rowIndex<this.channelDataList[0].length; rowIndex++ ) {
                let cells = {};
                for ( let colIndex=0; colIndex<this.channelDataList.length; colIndex++ ) {
                    cells[`ch_${colIndex}`] = this.channelDataList[colIndex][rowIndex].y;
                }
                options.data.push(cells);
            }

            await this.generateResponseExcelFile(options);
        },

        /**
         * handle event on x axis range changed.
         */
        actionXAxisRangeChange() {
            this.refreshChartContent();
        },

        /**
         * format x range slide tip content
         * @param {Number} value
         * @returns {String}
         */
        actionXAxisRangeTipFormatter( value ) {
            let time = this.timelineItems[value] || '~';
            return `${value} @ ${time}`;
        }
    },
}
</script>