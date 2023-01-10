<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-table 
      class="mock-response-snippet-table flex-grow" 
      :pagination="false"
      :columns="statusTableColumns" 
      :data-source="statuses"
    >
      <!-- column name -->
      <div slot="name" slot-scope="text,record,index">
        <a-input size="small" v-model="record.name" 
          :placeholder="$t('mock.response.snippet.attrName')"
          @change="actionNameChange(index)"
        />
      </div>
      
      <!-- default value -->
      <div slot="default-value" slot-scope="text,record,index">
        <a-input size="small" v-model="record.defaultValue" 
          @change="actionItemContentChange(index)"
        />
      </div>

      <!-- runtime value -->
      <div slot="runtime-value" slot-scope="text,record">
        <a-input size="small" v-model="record.runtimeValue"
          @change="actionItemRuntimeValueChange(index)"
        />
      </div>
      
      <!-- operations -->
      <div slot="operations" slot-scope="text,record,index">
        <a-button size="small" class="mr-1" @click="actionItemDelete(index)"
        ><a-icon type="delete" /></a-button>
      </div>
    </a-table>
  </div>
</template>
<script>
import MyObject from '../../../utils/datatype/MyObject.js'
export default {
    props : {
        /**
         * options for manual editor
         * @property {Array}
         */
        value : {type:Array},
        /**
         * instance of mocker
         * @property {Object}
         */
        mocker : {},
    },
    data() {
        return {
            /**
             * list of snippets
             * @property {Array<Object>}
             */
            statuses : [],
            /**
             * list of column for snippets table.
             * @property {Array<Object>}
             */
            statusTableColumns : [
                {title:this.$t('mock.status.columnName'),scopedSlots:{customRender:'name'},width:'300px'},
                {title:this.$t('mock.status.columnDefaultValue'),scopedSlots:{customRender:'default-value'}},
                {title:this.$t('mock.status.columnRuntimeValue'),scopedSlots:{customRender:'runtime-value'}},
                {title:'',scopedSlots:{customRender:'operations'},align:'right',width:'100px'},
            ],
            /**
             * callback for mocker status listener
             * @property {Function}
             */
            statusListener : null,
        };
    },
    watch : {
        mocker (value, oldValue) {
            if ( null !== this.mocker ) {
                this.refreshMockerStatus();
                this.mocker.status.addListener(this.statusListener);
            }
        }
    },
    created() {
        this.statusListener = () => this.refreshMockerStatus();

        this.statuses = [];
        if ( undefined !== this.value ) {
            for ( let i=0; i<this.value.length; i++ ) {
                let status = MyObject.copy(this.value[i]);
                this.statuses.push(status);
            }
        }
        this.addNewStatus();
    },
    beforeDestroy() {
        if ( null !== this.mocker ) {
            this.mocker.status.removeListener(this.statusListener);
        }
    },
    methods : {
        /**
         * add new snippet to snippets
         */
        addNewStatus() {
            this.statuses.push({
                key:(new Date()).getTime(),
                name : '',
                defaultValue : '',
                runtimeValue : '',
            });
        },

        /**
         * update v-model
         */
        actionUpdateVMode() {
            let statuses = MyObject.copy(this.statuses);
            statuses.pop();
            for ( let i=0; i<statuses.length; i++ ) {
                delete statuses[i].runtimeValue;
            }
            this.$emit('input', statuses);
            this.$emit('change');
        },

        /**
         * event handler on name changed
         * @param {Number} index
         */
        actionNameChange(index) {
            if ( index == this.statuses.length - 1 ) {
                this.addNewStatus();
            }
            this.actionUpdateVMode();
        },

        /**
         * event handler on item content changed.
         * @param {Number} index
         */
        actionItemContentChange(index) {
            if ( index == this.statuses.length - 1 ) {
                this.addNewStatus();
            }
            this.actionUpdateVMode();
        },

        /**
         * delete item by given index
         */
        actionItemDelete(index) {
            if ( index == this.statuses.length - 1 ) {
                this.addNewStatus();
            }
            this.statuses.splice(index, 1);
            this.actionUpdateVMode();
        },

        /**
         * refresh mocker status
         */
        refreshMockerStatus() {
            for ( let i=0; i<this.statuses.length - 1; i++ ) {
                let name = this.statuses[i].name;
                let item = MyObject.copy(this.statuses[i]);
                item.runtimeValue = this.mocker.status.getValueByName(name);
                this.statuses.splice(i, 1, item);
            }
        },

        /**
         * event handle on item runtime value changed.
         */
        actionItemRuntimeValueChange(index) {
            if ( null !== this.mocker ) {
                return ;
            }
            let name = this.statuses[index].name;
            let value = this.statuses[index].runtimeValue;
            this.mocker.status.getValueByName(name, value);
        }
    },
}
</script>
<style>
.mock-response-snippet-table th, .mock-response-snippet-table td {padding: 5px !important;}
</style>