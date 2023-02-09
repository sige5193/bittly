<template>
  <div class="border rounded h-100 d-flex flex-dir-column">
    <!-- formatted viewer -->
    <a-popover trigger="click" 
      v-model="formatPopoverVisible" 
      @visibleChange="actionFormatedPopoverVisibleChange"
    >
      <template slot="title">
        {{$t('directive.response.hex.formParserTitle')}}
        <a-icon type="edit" class="float-right pt-1" @click="actionEditFormatter"/>
      </template>
      <template slot="content">
        <a-empty v-if="false === formatedFields" :description="$t('directive.response.hex.formParserNoRules')"/>
        <template v-else>
          <p v-for="(field,findex) in formatedFields" :key="findex" class="white-space-nowrap">
            <span>{{field.name}} : </span>
            <span class="text-muted">{{field.value}}</span>
          </p>
        </template>
      </template>
      <div ref="byteItemColver" class="byte-item-cover"></div>
    </a-popover>

    <a-row class="p-1 bg-light border-bottom">
      <a-col :span="12">
        <!-- address mode -->
        <a-radio-group ref="radioLineNumRadix" v-model="lineNumberRadix">
          <a-radio-button value="dec" class="radio-mini">DEC</a-radio-button>
          <a-radio-button value="hex" class="radio-mini">HEX</a-radio-button>
        </a-radio-group>

        <!-- line size -->
        <a-input-group compact size="small" style="width:120px;" class="d-inline-block ml-1">
          <a-input style="width: 50px" :value="$t('directive.response.hex.lineSize')" disabled class="text-body"/>
          <a-input-number ref="inputLineSize" v-model="hexOptions.colSize" size="small" :min="1" :max="2000" :step="1" style="width:70px;"
            @change="actionColSizeChange"
          />
        </a-input-group>

        <a-button ref="btnClear" size="small" class="ml-1" @click="actionResponseClear"><a-icon type="delete" /></a-button>
      </a-col>
      <a-col :span="12" class="text-right pr-1">
       {{$t('directive.response.hex.bytes')}} : {{content ? Number(content.length).toLocaleString() : 0}}
      </a-col>
    </a-row>
    
    <!-- content -->
    <div class="flex-grow h-0" 
      @mousemove="actionContentItemContainerMouseMove"
      @click="actionContentItemContainerClick"
    >
      <virtual-list ref="virtualList" class="h-100 overflow-y-auto"
        :keeps="30" 
        :data-key="'no'" 
        :data-sources="lines"
        :data-component="lineEntryItem"
        :extra-props="{lineNumberRadix,highlightRange}"
      />
    </div>
  </div>
</template>
<script>
import ResponseViewerBase from '../ViewerMixin.js'
import VirtualList from 'vue-virtual-scroll-list'
import MyObject from '../../../../utils/datatype/MyObject.js';
import ResponseParser from '../form/ResponseParser.js';
import ViewerLineItem from './ViewerLineItem.vue'
export default {
    name : 'ModuleDirectiveResponseHexViewer',
    mixins : [ResponseViewerBase],
    components: { 
        'virtual-list' : VirtualList,
    },
    props: {
        /**
         * @property {Object}
         */
        content : {},
        /**
         * the directive model to edit
         * @property {MdbDirective}
         */
        value:{},
        /**
         * function to switch viewer
         * @property {Function}
         */
        viewerSwitch : {},
    },
    data() {
        return {
            /**
             * options of directive for hex viewer
             */
            hexOptions : {},
            /**
             * @property {Number}
             */
            refreshPos : 0,
            /**
             * @property {Boolean}
             */
            isLastLineCompleted : true,
            /**
             * @property {Array<Object>}
             */
            lines : [],
            /**
             * data entry item
             * @property {EntryItem}
             */
            lineEntryItem : ViewerLineItem,
            /**
             * @property {Number}
             */
            lineNoCounter : 0,
            /**
             * @property {String}
             */
            lineNumberRadix : 'hex',
            /**
             * @property {Object|null}
             */
            activeCharPos : null,
            /**
             * @property {Object}
             */
            highlightRange : null,
            /**
             * @property {Boolean}
             */
            formatPopoverVisible : false,
            /**
             * @property {Object|null}
             */
            formatedFields : null,
            /**
             * @property {Number}
             */
            formatOffset : 0,
        };
    },
    watch : {
        /**
         * update content viewer on content changed
         */
        content() { this.updateContentViewer() },
    },
    mounted() {
        this.initVModel();
    },
    methods : {
        /**
         * clear response data
         */
        actionResponseClear() {
            this.lines = [];
            this.refreshPos = 0;
            this.responseClearHandler();
        },

        /**
         * init v-model
         */
        initVModel() {
            this.hexOptions = {
                colSize : 20,
            };

            this.directive = this.value;
            if ( undefined != this.directive.responseFormatter.hex ) {
                this.hexOptions = MyObject.copy(this.directive.responseFormatter.hex);
            }

            this.refresh();
        },

        /**
         * update v-model
         */
        updateVModel() {
            let options = this.directive.responseFormatter;
            options.hex = this.hexOptions;

            this.directive.responseFormatter = MyObject.copy(options);
            this.$emit('input', this.directive);
            this.$forceUpdate();
            this.refresh();
        },

        /**
         * refresh content viewer on line size changed
         */
        actionColSizeChange() {
            this.updateVModel();
        },

        /**
         * refresh display
         */
        refresh() {
            this.highlightRange = null;
            this.formatPopoverVisible = false;
            this.formatedFields = null;
            this.formatOffset = 0;
            
            this.lines = [];
            this.refreshPos = 0;
            this.updateContentViewer();
        },

        /**
         * update content view by content prop
         */
        updateContentViewer() {
            if ( !this.isLastLineCompleted ) {
                this.lines.pop();
            }
            
            let cursor = this.refreshPos;
            while ( cursor < this.content.length ) {
                let lineData = this.content.slice(cursor, cursor + this.hexOptions.colSize);
                this.pushContentLineData(cursor, lineData);
                cursor += lineData.length;
                this.isLastLineCompleted = false;
                if ( lineData.length == this.hexOptions.colSize ) {
                    this.refreshPos += lineData.length;
                    this.isLastLineCompleted = true;
                }
            }

            this.$nextTick(() => this.$refs.virtualList.scrollToBottom());
        },

        /**
         * push new line data to content viewer
         * @param {Number} refreshCursor
         * @param {UInt8Array} data
         */
        pushContentLineData( address, data ) {
            this.lineNoCounter ++;
            let line = {};
            line.no = this.lineNoCounter;
            line.data = data;
            line.address = address;
            line.colSize = this.hexOptions.colSize * 1;
            this.lines.push(line);
        },

        /**
         * event handler on clicked content area
         * @param {Event} event
         */
        actionContentItemContainerClick(event) {
            let target = event.target;
            if ( 'yes' === target.dataset.isByteItem ) {
                let pos = target.getBoundingClientRect();
                let covStyle = this.$refs.byteItemColver.style;
                covStyle.display = 'block';
                covStyle.height = pos.height + 'px';
                covStyle.width = pos.width + 'px';
                covStyle.top = pos.top + 'px';
                covStyle.left = pos.left + 'px';
                this.formatPopoverVisible = true;
                
                let offset = target.dataset.offset * 1;
                this.formatedFields = this.formatDataToFrom(offset);
                this.formatOffset = offset;
            }
        },

        /**
         * format buffer to form fields
         * @param {Number} offset
         * @public
         */
        formatDataToFrom( offset ) {
            let directive = this.value;
            if ( undefined == directive.responseFormatter.fields ) {
                return false;
            }
            
            let parser = new ResponseParser(directive, this.content, false);
            parser.setCursor(offset);
            let endpos = parser.parse();

            let fields = [];
            for ( let i=0; i<directive.responseFormatter.fields.length; i++ ) {
                let field = directive.responseFormatter.fields[i];
                let name = '' === field.name.trim() ? `$${i+1}` : field.name.trim();
                let prefix = field.prefix || '';
                let value = parser.getValueByIndex(i);
                fields.push({name:name,value:`${prefix}${value}`});
            }
            this.highlightRange = {from:offset,to:endpos};
            return fields;
        },

        /**
         * event handler for popover visible changed
         * @param {Boolean} visible
         */
        actionFormatedPopoverVisibleChange(visible) {
            if ( false === visible ) {
                this.formatedFields = null;
                this.highlightRange = null;
                this.$refs.byteItemColver.style.display = 'none';
            }
        },

        /**
         * open form editor by given offset
         */
        actionEditFormatter() {
            this.formatPopoverVisible = false;
            this.viewerSwitch('form', {startOffset:this.formatOffset});
        },

        /**
         * event handler on mouse move on hex content area.
         */
        actionContentItemContainerMouseMove(event) { 
            if ( null != this.activeCharPos ) {
                let selector = `[data-line='${this.activeCharPos.line}'][data-col='${this.activeCharPos.col}']`;
                this.updateClassBySelector(selector, 'remove', 'active');
            }

            if ( 'directive-response-hex-byte' === event.target.className 
            || 'directive-response-hex-char' === event.target.className ) {
                let item = {line:event.target.dataset.line,col:event.target.dataset.col};
                this.activeCharPos = item;
                let selector = `[data-line='${item.line}'][data-col='${item.col}']`;
                this.updateClassBySelector(selector, 'add', 'active');
            }
        },
        
        /**
         * add class name to elements which matched given selector
         * @param {String} selector
         * @param {String} operation `add` or `remove`
         * @param {String} className
         */
        updateClassBySelector( selector, operation ,className ) {
            let elems = document.querySelectorAll(selector);
            for ( let i=0; i<elems.length; i++ ) {
                elems[i].classList[operation](className);
            }
        },
    },

    /**
     * generate testcase expect content from response.
     * @param {MdbDirective} directive
     * @param {Buffer} response
     * @returns {String}
     */
    generateTestcaseExpectContentFromResponse( directive, response ) {
        return response.toString('hex').toUpperCase();
    },
}
</script>
<style>
.directive-response-hex-byte {color: #787878;display: inline-block;width: 20px;text-align: center;cursor: default;}
.directive-response-hex-byte.active {background: #e9e9e9;color: black;border-radius: 5px;}
.directive-response-hex-byte:hover {background: #e9e9e9;color: black;border-radius: 5px;}
.directive-response-hex-char {color: #787878;display: inline-block;width: 20px;text-align: center;cursor: default;}
.directive-response-hex-char.active {background: #e9e9e9;color: black;border-radius: 5px;}
.directive-response-hex-char:hover {background: #e9e9e9;color: black;border-radius: 5px;}
</style>
<style scoped>
.byte-item-cover {background: transparent;position: fixed;z-index: 1;}
.content-separator {width: 7px;background-image: linear-gradient(90deg, #d9d9d9 0px, #d9d9d9 1px, transparent 1px);background-size: 2px;cursor: col-resize;}
.byte {display: inline-block;text-align: center;padding: 5px 0;cursor: default;width: 20px;}
.byte.active {background: #e9e9e9;color: black;border-radius: 5px;}
.byte:hover {background: #e9e9e9;color: black;border-radius: 5px;}
.char {display: inline-block;text-align: center;padding: 5px 0;cursor: default;width: 20px;}
.char:hover {background: #e9e9e9;color: black;border-radius: 5px;}
.char.active {background: #e9e9e9;color: black;border-radius: 5px;}
.pager-act {font-size: 1.5em;border: solid #afafaf 1px;color: #939393;border-radius: 5px;margin: 0 1px;cursor: pointer;}
.pager-act:hover {background: #9b9b9b;color: #f9f9f9;}
.radio-mini {line-height: 21px;height: 24px;padding: 0 5px;}
.pager-act-input {width: 100px;height: 24px;line-height: 20px;vertical-align: text-bottom;}
.content {flex-grow: 1;height: 0;}
</style>