<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-table class="table-mini table-scroll-body" 
      :pagination="false"
      :columns="matchTableColumns" 
      :data-source="rules"
      :scroll="{y:true}"
    >
      <!-- status -->
      <div slot="status" slot-scope="text,record,index">
        <a-switch size="small" v-model="record.enable" @change="actionRuleItemEditUpdate(index)"/>
      </div>
      
      <!-- name -->
      <div slot="name" slot-scope="text,record,index">
        <a-input size="small" v-model="record.name" @change="actionRuleItemEditUpdate(index)"/>
      </div>
      
      <!-- match -->
      <div slot="match" slot-scope="text,record,index" class="d-flex flex-dir-row">
        <a-select size="small" class="mr-1" style="width:80px;" 
          v-model="record.matchHandler"
          @change="actionRuleItemMatchHandlerUpdate(index)"
        >
          <a-select-option value="All">{{$t('mock.response.match.matcherAll')}}</a-select-option>
          <a-select-option value="Text">{{$t('mock.response.match.matcherText')}}</a-select-option>
          <a-select-option value="Hex">{{$t('mock.response.match.matcherHex')}}</a-select-option>
          <a-select-option value="Script">{{$t('mock.response.match.matcherScript')}}</a-select-option>
          <a-select-option value="Json">{{$t('mock.response.match.matcherJson')}}</a-select-option>
        </a-select>
        <div class="flex-grow">
          <div v-if="'All' === record.matchHandler">{{$t('mock.response.match.matcherAll')}}</div>
          <component v-else :is="`match-value-editor-${record.matchHandler}`" 
            v-model="record.matchContent"
            @change="actionRuleItemEditUpdate(index)"
          />
        </div>
      </div>
      
      <!-- response -->
      <div slot="response" slot-scope="text,record,index" class="d-flex flex-dir-row">
        <a-select size="small" style="width:120px;" class="mr-1" v-model="record.responseHandler"
          @change="actionRuleItemResponseHandlerUpdate(index)"
        >
          <a-select-option value="Text">{{$t('mock.response.inlineEditorText.editorName')}}</a-select-option>
          <a-select-option value="Hex">{{$t('mock.response.inlineEditorHex.editorName')}}</a-select-option>
          <a-select-option value="Form">{{$t('mock.response.inlineEditorForm.editorName')}}</a-select-option>
          <a-select-option value="Script">{{$t('mock.response.inlineEditorScript.editorName')}}</a-select-option>
          <a-select-option value="Random">{{$t('mock.response.inlineEditorRandom.editorName')}}</a-select-option>
        </a-select>
        <div class="d-inline-block w-100">
          <component :is="`response-value-editor-${record.responseHandler}`" 
            v-model="record.responseContent" 
            @change="actionRuleItemEditUpdate(index)"
          />
        </div>
      </div>
      
      <!-- operations -->
      <div slot="operations" slot-scope="text,record,index">
        <a-button size="small" class="mr-1" @click="actionRuleItemMove(index, -1)">
          <a-icon type="arrow-up" />
        </a-button>
        <a-button size="small" class="mr-1" @click="actionRuleItemMove(index, 1)">
          <a-icon type="arrow-down" />
        </a-button>
        <a-button size="small" @click="actionRuleItemDelete(index)">
          <a-icon type="delete" />
        </a-button>
      </div>
    </a-table>
  </div>
</template>
<script>
import MatchValueEditorText from './MatchText.vue'
import MatchValueEditorHex from './MatchHex.vue'
import MatchValueEditorScript from './MatchScript.vue'
import MatchValueEditorJson from './MatchJson.vue'
import InlineEditorRandom from '../inline-editors/Random.vue'
import InlineEditorText from '../inline-editors/Text.vue'
import InlineEditorHex from '../inline-editors/Hex.vue'
import InlineEditorForm from '../inline-editors/Form.vue'
import InlineEditorScript from '../inline-editors/Script.vue'
import MyObject from '../../../../utils/datatype/MyObject.js';
export default {
    components : {
        'response-value-editor-Text' : InlineEditorText,
        'response-value-editor-Hex' : InlineEditorHex,
        'response-value-editor-Form' : InlineEditorForm,
        'response-value-editor-Script' : InlineEditorScript,
        'response-value-editor-Random' : InlineEditorRandom,
        'match-value-editor-Text' : MatchValueEditorText,
        'match-value-editor-Hex' : MatchValueEditorHex,
        'match-value-editor-Script' : MatchValueEditorScript,
        'match-value-editor-Json' : MatchValueEditorJson,
    },
    props : {
        /**
         * options for manual editor
         * @property {Array}
         */
        value : {type:Array}
    },
    data() {
        return {
            /**
             * list of rules
             * @property {Array<Object>}
             */
            rules : [],
            /**
             * list of match table columns
             * @property {Array<Object>}
             */
            matchTableColumns : [
                {title:this.$t('mock.response.match.columnStatus'),scopedSlots:{customRender:'status'},width:'50px'},
                {title:this.$t('mock.response.match.columnName'),scopedSlots:{customRender:'name'}},
                {title:this.$t('mock.response.match.columnMatch'),scopedSlots:{customRender:'match'}},
                {title:this.$t('mock.response.match.columnResponse'),scopedSlots:{customRender:'response'}},
                {title: this.$t('app.tool.responseHandlerMatchColOperations'),scopedSlots: { customRender: 'operations' },align:'right',width:'120px'},
            ],
        };
    },
    created() {
        this.rules = this.value;
        if ( undefined === this.rules ) {
            this.rules = [];
        }
        this.addNewRule();
    },
    methods : {
        /**
         * update v-model
         */
        updateVMode() {
            let rules = MyObject.copy(this.rules);
            rules.pop();
            this.$emit('input', rules);
            this.$emit('change');
        },

        /**
         * add new snippet to snippets
         */
        addNewRule() {
            this.rules.push({
                key:(new Date()).getTime(),
                enable : false,
                name : '',
                matchHandler : 'All',
                responseHandler : 'Text',
            });
        },

        /**
         * event handler on item editor updated
         * @param {Number} index
         */
        actionRuleItemEditUpdate( index ) {
            if ( index === this.rules.length - 1 ) {
                this.addNewRule();
            }
            this.updateVMode();
        },

        /**
         * event handler on item match handler changed
         * @param {Number} index
         */
        actionRuleItemMatchHandlerUpdate(index) {
            this.rules[index].matchContent = undefined;
            this.actionRuleItemEditUpdate(index);
        },

        /**
         * event handler on item response handler changed
         * @param {Number} index
         */
        actionRuleItemResponseHandlerUpdate(index) {
            this.rules[index].responseContent = undefined;
            this.actionRuleItemEditUpdate(index);
        },

        /**
         * event handler on item delete.
         * @param {Number} index
         */
        actionRuleItemDelete(index) {
            if ( index === this.rules.length - 1 ) {
                this.addNewRule();
            }
            this.rules.splice(index, 1);
            this.updateVMode();
        },

        /**
         * move item by given offset
         * @param {Number} index
         * @param {Number} offset
         */
        actionRuleItemMove(index, offset) {
            let target = index + offset;
            if ( 0 > target || target >= this.rules.length ) {
                return ;
            }
            
            let tmp = MyObject.copy(this.rules[target]);
            this.rules.splice(target, 1, this.rules[index]);
            this.rules.splice(index, 1, tmp);
            this.actionRuleItemEditUpdate(index);
        },
    }
}
</script>