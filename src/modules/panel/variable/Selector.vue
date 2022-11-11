<template>
  <div class="panel-variable-selector" style="width:100%;">
    <a-select ref="selectVariable" class="w-100" v-model="selectValue" @change="actionChange" allowClear>
      <a-select-option v-for="(varItem, varIndex) in panel.variables" 
        :key="varIndex" 
        :value="varItem.name"
      >{{varItem.name}}</a-select-option>

      <div slot="dropdownRender" slot-scope="menu">
        <v-nodes :vnodes="menu" />
        <a-divider style="margin: 4px 0;" />
        <div ref="btnAddNewVariable" style="padding: 4px 8px; cursor: pointer;" @click="addNewVariable">
          <a-icon type="plus" /> {{$t('panel.editMode.variableAdd')}}
        </div>
      </div>
    </a-select>

    <editor ref="editor" :panel="panel"/>
  </div>
</template>
<script>
import Editor from './Editor.vue'
export default {
    name : 'PanelVariableSelector',
    components: {
        'editor' : Editor,
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes,
        },
    },
    props : {
        /**
         * @property {MdbPanel}
         */
        panel : {
            type : Object,
            required : true,
        },
        /**
         * @property {any}
         */
        value : {}
    },
    data() {
        return {
            selectValue : null,
        };
    },
    created () {
        this.selectValue = this.value;
    },
    methods : {
        /**
         * event handler on select changed.
         */
        actionChange() {
            this.$emit('input', this.selectValue);
            this.$emit('change');
        },

        /**
         * create new variable
         */
        async addNewVariable() {
            let variable = await this.$refs.editor.create();
            if ( null !== variable ) {
                this.selectValue = variable.name;
                this.actionChange();
            }
            this.$forceUpdate();
        },
    }
}
</script>
<style>
.ant-input-group-compact .panel-variable-selector .ant-select-selection {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
}
</style>