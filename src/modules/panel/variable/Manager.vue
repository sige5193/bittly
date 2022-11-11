<template>
  <div class="h-100 d-flex flex-dir-column">
    <!-- variables -->
    <a-table 
      id="panel-editmode-variable-table"
      class="flex-grow h-0 overflow-auto"
      ref="tableVariables"
      size="small" 
      :pagination="false" 
      :columns="tableColumns" 
      :data-source="panel.variables"
      :bordered="false"
    >
      <span slot="name" slot-scope="text">{{ text }}</span>
      <span slot="actions" slot-scope="text, record, index">
        <a-icon :ref="`iconEdit_${index}`" type="edit" class="mr-1" @click="actionVariableEdit(index)"/>

        <a-popconfirm
          :title="$t('panel.editMode.variableDeleteConfirm')"
          :ok-text="$t('button.ok')"
          :cancel-text="$t('button.cancel')"
          @confirm="actionVariableDelete(index)"
        ><a-icon type="delete"/></a-popconfirm>

        <a-popover placement="rightTop">
          <template slot="content">
            <p>{{$t('panel.editMode.variableDataType')}} : {{ $dict.name('DIRECTIVE_PARAM_DATATYPE',record.type) }}</p>
            <p>{{$t('panel.editMode.variableDefault')}} : {{ record.defaultValue }}</p>
          </template>
          <a-icon type="right-circle" class="ml-1"/>
        </a-popover>
      </span>
    </a-table>
    <editor :panel="panel" ref="editor" />
  </div>
</template>
<script>
import Editor from './Editor.vue'
import Common from '@/utils/Common.js'
export default {
    name : 'VariableEditor',
    components : {
        'editor' : Editor,
    },
    props : {
        panel : {
            type : Object
        },
    },
    data() {
        return {
            tableColumns : [
                {title: this.$t('panel.editMode.variableName'), dataIndex: 'name',key: 'name', ellipsis: true,},
                {title: this.$t('panel.editMode.variableDataType'), scopedSlots: { customRender: 'actions'}, className:'text-right'},
            ],
        }
    },
    methods : {
        /**
         * create new variable
         */
        async actionVariableAdd() {
            await this.$refs.editor.create();
            this.$forceUpdate();
        },

        /**
         * event handler for variable edit icon clicked
         * @event
         */
        async actionVariableEdit(index) {
            await this.$refs.editor.update(index);
            this.$forceUpdate();
        },

        /**
         * delete variable
         */
        actionVariableDelete(index) {
            let variables = Common.objCopy(this.panel.variables);
            variables.splice(index, 1);
            this.panel.variables = variables;
            this.$forceUpdate();
        },
    },
}
</script>
<style>
#panel-editmode-variable-table .ant-table-small {border:none !important;}
</style>