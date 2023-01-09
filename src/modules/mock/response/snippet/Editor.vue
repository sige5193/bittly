<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-table 
      class="mock-response-snippet-table flex-grow" 
      :pagination="false"
      :columns="snippetTableColumns" 
      :data-source="snippets"
    >
      <!-- column name -->
      <div slot="name" slot-scope="text,record,index">
        <a-input size="small" v-model="record.name" 
          :placeholder="$t('mock.response.snippet.attrName')"
          @change="actionNameChange(index)"
        />
      </div>
      
      <!-- content -->
      <div slot="content" slot-scope="text,record,index" class="d-flex flex-dir-row">
        <a-select size="small" style="width:120px;" class="mr-1" v-model="record.handler"
          @change="actionItemHandlerChange(index)"
        >
          <a-select-option value="Text">{{$t('mock.response.inlineEditorText.editorName')}}</a-select-option>
          <a-select-option value="Hex">{{$t('mock.response.inlineEditorHex.editorName')}}</a-select-option>
          <a-select-option value="Form">{{$t('mock.response.inlineEditorForm.editorName')}}</a-select-option>
          <a-select-option value="Script">{{$t('mock.response.inlineEditorScript.editorName')}}</a-select-option>
          <a-select-option value="Random">{{$t('mock.response.inlineEditorRandom.editorName')}}</a-select-option>
        </a-select>
        <div class="d-inline-block w-100">
          <component :is="`inline-editor-${record.handler}`" 
            v-model="snippets[index]" 
            @change="actionItemContentChange(index)"
          />
        </div>
      </div>
      
      <!-- operations -->
      <div slot="operations" slot-scope="text,record,index">
        <a-button size="small" class="mr-1" @click="actionItemDelete(index)"
        ><a-icon type="delete" /></a-button>
        <a-button size="small" class="mr-1" @click="actionSendSnippet(index)"
        >{{$t('button.send')}}</a-button>
      </div>
    </a-table>
  </div>
</template>
<script>
import InlineEditorRandom from '../inline-editors/Random.vue'
import InlineEditorText from '../inline-editors/Text.vue'
import InlineEditorHex from '../inline-editors/Hex.vue'
import InlineEditorForm from '../inline-editors/Form.vue'
import InlineEditorScript from '../inline-editors/Script.vue'
import MyObject from '../../../../utils/datatype/MyObject'
export default {
    components : {
        'inline-editor-Text' : InlineEditorText,
        'inline-editor-Hex' : InlineEditorHex,
        'inline-editor-Form' : InlineEditorForm,
        'inline-editor-Script' : InlineEditorScript,
        'inline-editor-Random' : InlineEditorRandom,
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
             * list of snippets
             * @property {Array<Object>}
             */
            snippets : [],
            /**
             * list of column for snippets table.
             * @property {Array<Object>}
             */
            snippetTableColumns : [
                {title:this.$t('mock.response.snippet.attrName'),scopedSlots:{customRender:'name'},width:'300px'},
                {title:this.$t('mock.response.snippet.attrContent'),scopedSlots:{customRender:'content'}},
                {title:'',scopedSlots:{customRender:'operations'},align:'right',width:'100px'},
            ],
        };
    },
    created() {
        this.snippets = this.value;
        if ( undefined === this.snippets ) {
            this.snippets = [];
        }
        this.addNewSnippet();
    },
    methods : {
        /**
         * event handler on name changed
         * @param {Number} index
         */
        actionNameChange(index) {
            if ( index == this.snippets.length - 1 ) {
                this.addNewSnippet();
            }
            this.actionUpdateVMode();
        },

        /**
         * update v-model
         */
        actionUpdateVMode() {
            let snippets = MyObject.copy(this.snippets);
            snippets.pop();
            this.$emit('input', snippets);
            this.$emit('change');
        },

        /**
         * add new snippet to snippets
         */
        addNewSnippet() {
            this.snippets.push({
                key:(new Date()).getTime(),
                handler : 'Text',
            });
        },

        /**
         * send snippet content by given index
         * @param {Number} index
         */
        actionSendSnippet(index) {
            this.$emit('send', this.snippets[index]);
        },

        /**
         * event handler on item content changed.
         * @param {Number} index
         */
        actionItemContentChange(index) {
            if ( index == this.snippets.length - 1 ) {
                this.addNewSnippet();
            }
            this.actionUpdateVMode();
        },

        /**
         * event handler on item handler changed.
         * @param {Number} index
         */
        actionItemHandlerChange(index) {
            this.snippets[index].content = undefined;
            if ( index == this.snippets.length - 1 ) {
                this.addNewSnippet();
            }
            this.actionUpdateVMode();
        },

        /**
         * delete item by given index
         */
        actionItemDelete(index) {
            if ( index == this.snippets.length - 1 ) {
                this.addNewSnippet();
            }
            this.snippets.splice(index, 1);
            this.actionUpdateVMode();
        }
    },
}
</script>
<style>
.mock-response-snippet-table th, .mock-response-snippet-table td {padding: 5px !important;}
</style>