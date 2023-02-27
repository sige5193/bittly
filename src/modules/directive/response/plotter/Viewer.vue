<template>
  <div class="border p-1 rounded d-flex flex-dir-column h-100" style="min-height:300px;">
    <a-row>
      <a-col :span="6">
        <!-- parser selector -->
        <a-select size="small" class="ml-1 mr-1" style="width: 150px" ref="selectParser"
          v-model="parserOptions.parser" @change="actionParserHandlerChanged"
        >
          <a-select-option value="num-num-crlf">[num] [num]CRLF</a-select-option>
          <a-select-option value="data-frame">{{$t('directive.response.plotter.parserDataFrame')}}</a-select-option>
          <a-select-option value="data-matrix">{{$t('directive.response.plotter.parserDataMatrix')}}</a-select-option>
          <a-select-option value="form">{{$t('directive.response.plotter.parserForm')}}</a-select-option>
          <a-select-option value="regex">{{$t('directive.response.plotter.parserRegex')}}</a-select-option>
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
      
      <a-col :span="18" class="text-right">
        <!-- labels -->
        <div class="data-line-label" v-for="(line,index) in dataLines" :key="index">
          <div class="color" :style="{background:`rgb(${line.color[0]} ${line.color[1]} ${line.color[2]})`}"></div>
          <div :class="{label:true, invisible:!line.visible}" @click="actionDataLineLableClick(index)">{{line.label}}</div>
        </div>
      </a-col>
    </a-row>

    <plotter-webgl ref="plotter"></plotter-webgl>
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
import ComponentBase from '../../../../utils/component/Base.js'
import MyObject from '../../../../utils/datatype/MyObject.js'
import PlotterWebGL from './PlotterWebGL.vue'
import ViewerMixin from '../ViewerMixin.js'
import ParserScript from './parsers/Script.vue'
import ParserNumNumCrlf from './parsers/NumNumCrlf.vue'
import ParserDataFrame from './parsers/DataFrame.vue'
import ParserDataMatrix from './parsers/DataMatrix.vue'
import ParserForm from './parsers/Form.vue'
import ParserRegex from './parsers/Regex.vue'
export default {
    name : 'BlockResponseViewerPlotter',
    mixins : [ComponentBase, ViewerMixin],
    components : {
        'plotter-webgl' : PlotterWebGL,
        'parser-script' : ParserScript,
        'parser-num-num-crlf' : ParserNumNumCrlf,
        'parser-data-frame' : ParserDataFrame,
        'parser-data-matrix' : ParserDataMatrix,
        'parser-form' : ParserForm,
        'parser-regex' : ParserRegex,
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
             * data of parsed channels
             * @property {Array<Array<Number>>}
             */
            channelDataList : [],
            /**
             * the position of content where start to parse
             * @property {Number}
             */
            parseStartPos : 0,
            /**
             * list of data lines to config
             * @property {Array<Object>}
             */
            dataLines : [],
            
            /**
             * values of parsed response data
             * @property {Array<Array<Number>>}
             */
            batchValues : [],
        };
    },
    watch : {
        content() {
            debugger
            this.parseResponseData();
        },
    },
    created() {
        this.directive = this.value;
        this.parserOptions = {};
        if ( undefined != this.directive.responseFormatter.plotter ) {
            this.parserOptions = this.directive.responseFormatter.plotter;
        }
        MyObject.applyDefaultValues(this.parserOptions,{parser:'data-matrix'});
    },
    /**
     * setup componment on mounted
     */
    async mounted() {
        this.registerEventHandler('resize',() => this.handleViewerResized(), 'window');
        this.registerEventHandler('directive-executor-resized', () => this.handleViewerResized());
        await this.$nextTick();
        this.parseResponseData();
    },
    /**
     * clean up the componment
     */
    beforeDestroy() {
        this.unregisterAllEventHandlers();
    },
    methods : {
        /**
         * event handlr on executor resized
         */
        async handleViewerResized() {
            await this.$nextTick();
            this.$refs.plotter.resize();
        },

        /**
         * handle on parser handler changed
         */
        actionParserHandlerChanged() {
            this.actionParserOptionUpdate();
        },

        /**
         * event handler on parser option updated
         */
        actionParserOptionUpdate() {
            let responseHandler = MyObject.copy(this.directive.responseFormatter);
            responseHandler.plotter = this.parserOptions;
            this.directive.responseFormatter = MyObject.copy(responseHandler);
            this.$emit('input', this.directive);

            this.parseStartPos = 0;
            this.channelDataList = [];
            this.$refs.plotter.dataClear();
            this.parseResponseData();
        },

        /**
         * event handle on data line lable clicked
         * @param {Number} index
         */
        actionDataLineLableClick(index) {
            let visible = !this.dataLines[index].visible;
            let plotter = this.$refs.plotter;

            plotter.dataLineVisibleSet(index, visible);
            this.dataLines = plotter.dataLineGetAll();
        },

        /**
         * push data to channel data list
         * @public
         * @param {Array<Number>} values
         */
        channelDataPush(values) {
            this.batchValues.push(values);
            for ( let i=0; i<values.length; i++ ) {
                if ( undefined === this.channelDataList[i] ) {
                    this.channelDataList[i] = [];
                }
                this.channelDataList[i].push({value:values[i]});
            }
        },

        /**
         * each time we receive new response data, this response viewer
         * would start to parse new data.
         * @private
         */
        parseResponseData() {
            if ( null == this.content ) {
                return ;
            }

            let isFirstTime = 0 === this.parseStartPos;
            this.batchValues = [];
            let cursor = this.parseStartPos;
            let parseContent = this.content.slice(cursor);
            let parsedLength = 0;
            try {
                parsedLength = this.$refs.parser.parse(parseContent);
            } catch ( e ) {
                console.error(e);
                this.$message.error(e.message);
                return ;
            }

            let plotter = this.$refs.plotter;
            this.parseStartPos = cursor + parsedLength;
            plotter.dataBatchAppend(this.batchValues);

            // for the first time, we need to setup the labels
            if ( isFirstTime && 0 < this.batchValues.length ) {
                let labels = [];
                for ( let i=0; i<this.batchValues[0].length; i++ ) {
                    labels.push(this.$refs.parser.getChannelLabel(i));
                }
                plotter.dataLineLabelsSet(labels);
                this.dataLines = plotter.dataLineGetAll();
            }
        },

        /**
         * export response as excel file.
         * @override
         */
        async exportAsExcel() {
            debugger

            if ( 0 >= this.channelDataList.length ) {
                this.$message.info(this.$t('directive.response.saveAsExcelDataEmpty'));
                return ;
            }
            
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
                    cells[`ch_${colIndex}`] = this.channelDataList[colIndex][rowIndex].value;
                }
                options.data.push(cells);
            }

            await this.generateResponseExcelFile(options);
        },
    },
}
</script>
<style scoped>
.data-line-label {
    display: inline-block;
    margin-right: 5px;
}
.data-line-label .label {
    display: inline-block;
    font-size: 0.8em;
    cursor: pointer;
}
.data-line-label .label.invisible {
    text-decoration: line-through 2px #616161;
}
.data-line-label .color {
    display: inline-block;
    width:20px;
    height: 10px;
    vertical-align: middle;
    border-radius: 5px;
    margin-right: 5px;
}
</style>