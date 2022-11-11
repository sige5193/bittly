<template>
  <a-modal ref="modalEdit"
    v-if="enable" 
    :visible="enable" 
    :title="$t('panel.editMode.variableEditTitle')" 
    :okText="$t('button.ok')" 
    :cancelText="$t('button.cancel')"
    @ok="actionOk" 
    @cancel="actionCancel" 
  >
    <a-form :label-col="{span:5}" :wrapper-col="{span:15}" layout="horizontal">
      <!-- name -->
      <a-form-item :label="$t('panel.editMode.variableName')"
        :validate-status="attrNameCheckStatus"
        :help="attrNameCheckMessage"
        :wrapperCol="{span:15}"
      >
        <a-input 
          ref="inputVarName" 
          v-model="variable.name" 
          @input="actionVarnameInput"
        />
      </a-form-item>

       <!-- data type -->
      <a-form-item :label="$t('panel.editMode.variableDataType')" :wrapperCol="{span:15}">
        <a-select v-model="variable.type">
          <a-select-option 
            v-for="(item, itemKey) in $dict.items('DIRECTIVE_PARAM_DATATYPE')"
            :key="itemKey"
            :value="item.value"
          >{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>

      <!-- default value -->
      <a-form-item :label="$t('panel.editMode.variableDefault')" :wrapperCol="{span:15}">
        <a-input 
          ref="inputVarDefaultValue" 
          v-model="variable.defaultValue" 
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import Common from '../../../utils/Common.js'
export default {
    name : 'PanelVariableEditor',
    props : {
        /**
         * instance of panel
         * @property {MdbPanel}
         */
        panel : {
            type : Object,
            required : true,
        }
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            enable : false,
            /**
             * index of variable
             * @property {Number|null}
             */
            index : null,
            /**
             * @property {Object|null}
             */
            variable : null,
            /**
             * @property {Function|null}
             */
            resolveCallback : null,
            /**
             * 
             */
            attrNameCheckStatus : null,
            /**
             * 
             */
            attrNameCheckMessage : null,
        };
    },
    methods : {
        /**
         * create a new variable.
         * @returns {Promise<Boolean>}
         */
        create() {
            this.enable = true;
            this.index = null;
            this.variable = {
                key : (new Date()).getTime(),
                name : '',
                defaultValue : '',
            };
            return new Promise(resolve => this.resolveCallback=resolve);
        },

        /**
         * event handler for variable edit icon clicked
         * @event
         */
        update(index) {
            this.enable = true;
            this.index = index;
            this.variable = Common.objCopy(this.panel.variables[index]);
            return new Promise(resolve => this.resolveCallback=resolve);
        },

        /**
         * event handler on variable name changed
         */
        actionVarnameInput() {
            this.attrNameCheckStatus = null;
            this.attrNameCheckMessage = null;
            
            let vars = this.panel.variables;
            for ( let i=0; i<vars.length; i++ ) {
                if ( this.variable.name == vars[i].name ) {
                    this.attrNameCheckStatus = 'error';
                    this.attrNameCheckMessage = this.$t('panel.editMode.variableEditNameExists');
                }
            }
        },

        /**
         * event handler on done editing
         */
        actionOk() {
            if ( null != this.attrNameCheckStatus ) {
                return ;
            }
            if ( '' == this.variable.name.trim() ) {
                return ;
            }

            let variable = Common.objCopy(this.variable);
            let variables = Common.objCopy(this.panel.variables);
            if ( null == this.index ) {
                variables.push(variable);
            } else {
                variables[this.index] = variable;
            }
            this.panel.variables = variables;
            this.enable = false;
            this.resolveCallback(variable);
        },

        /**
         * cancel editing
         */
        actionCancel() {
            this.enable = false;
            this.resolveCallback(null);
        },
    }
}
</script>