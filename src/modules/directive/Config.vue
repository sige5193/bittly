<template>
  <a-modal 
    ref="modalEditor"
    v-if="visible" 
    :visible="visible" 
    :title="$t('directive.configTitle')"  
    :ok-text="$t('button.ok')"
    :cancel-text="$t('button.cancel')"
    :width="600"
    @ok="actionOk" 
    @cancel="actionCancel"
  >
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
      <!-- name -->
      <a-form-item :label="$t('directive.name')">
        <a-input ref="inputName" v-model="model.name"/>
      </a-form-item>
      
      <!-- description -->
      <a-form-item :label="$t('directive.descriotion')">
        <a-textarea 
          ref="inputDesc"
          v-model="model.description" 
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </a-form-item>
      
      <!-- attributes -->
      <a-form-item :label="$t('directive.atributesLabel')">
        <a-input-group compact v-for="(item, index) in model.attributes" :key="index">
          <a-input 
            :ref="`attrName_${index}`" 
            style="width:40%" 
            :placeholder="$t('directive.atributeName')" 
             v-model="model.attributes[index].name"
            @input="actionUpdate"
          />
          <a-input 
            :ref="`attrValue_${index}`" 
            style="width:40%" 
            :placeholder="$t('directive.atributeValue')" 
            v-model="model.attributes[index].value"
            @input="actionUpdate"
          />
          <a-button ref="btnAttrDel" style="width:10%" icon="delete" 
            @click="actionAttributeDelete(index)"
          ></a-button>
          <a-button ref="btnAttrAdd" style="width:10%" icon="plus" 
            @click="actionAttributeAdd"
          ></a-button>
        </a-input-group>
      </a-form-item>
        
      <!-- endianness -->
      <a-form-item :label="$t('directive.endiannessLabel')">
        <a-radio-group button-style="solid" v-model="model.endianness">
          <a-radio-button value="big-endian">
            {{$t('directive.endiannessBigEndian')}}
          </a-radio-button>
          <a-radio-button value="little-endian" ref="radioEndiannessLittle">
            {{$t('directive.endiannessLittleEndian')}}
          </a-radio-button>
        </a-radio-group>
        
        <a-popover>
          <template slot="content">
            {{$t('messages.example')}} : 4096(0x1000) <br/>
            {{$t('directive.endiannessBigEndian')}} [10 00] <br/> 
            {{$t('directive.endiannessLittleEndian')}} [00 10]
          </template>
          <a-icon type="question-circle" class="ml-3" />
        </a-popover>
      </a-form-item>

      <!-- request charset -->
      <a-form-item :label="$t('directive.charset')">
        <div>
          <a-input-group compact class="d-inline-block w-45 mr-1">
            <a-input class="w-50 text-body" :value="$t('directive.requestCharset')" disabled/>
            <a-select class="w-50" v-model="model.requestCharset" default-value="utf8" ref="selectRequestCharset">
              <a-select-option v-for="(item, key) in $dict.items('CHARSET')" :key="key" :value="item.value"
              >{{item.name}}</a-select-option>
            </a-select>
          </a-input-group>

          <a-input-group compact class="d-inline-block w-45">
            <a-input class="w-50 text-body" :value="$t('directive.responseCharset')" disabled />
            <a-select class="w-50" v-model="model.responseCharset" default-value="utf8" ref="selectRequestCharset">
              <a-select-option v-for="(item, key) in $dict.items('CHARSET')" :key="key" :value="item.value"
              >{{item.name}}</a-select-option>
            </a-select>
          </a-input-group>
        </div>
      </a-form-item>
      
      <!-- new line style -->
      <a-form-item :label="$t('directive.nlstyleLabel')">
        <a-select v-model="model.nlstyle" default-value="DEFAULT" ref="selectNlStyle">
          <a-select-option value="DEFAULT">{{$t('directive.nlstyleDefaultName')}}</a-select-option>
          <a-select-option value="CRLF">CRLF ( \r\n )</a-select-option>
          <a-select-option value="LF">LF ( \n )</a-select-option>
          <a-select-option value="CR">CR ( \r )</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
export default {
    data() {
        return {
            visible : false,
            actResolve : null,
            actReject : null,
            directive : null,
            model : null,
        };
    },
    methods : {
        /**
         * open directive config editor
         * @param {MdbDirective} directive
         * @returns {Promise}
         */
        open ( directive ) {
            let $this = this;
            return new Promise(( resolve, reject ) => {
                $this.directive = directive;
                $this.actResolve = resolve;
                $this.actReject = reject;
                $this.model = directive.getData();
                if ( 0 == $this.model.attributes.length ) {
                    $this.actionAttributeAdd();
                }

                $this.visible = true;
            });
        },

        /**
         * delete attribute by given index
         * @param {Number} index
         */
        actionAttributeDelete(index) {
            this.model.attributes.splice(index, 1);
            if ( 0 == this.model.attributes.length ) {
                this.actionAttributeAdd();
            }
        },

        /**
         * add new attribute edit bar
         */
        actionAttributeAdd() {
            this.model.attributes.push({name:'',value:''});
        },

        /**
         * done edit, update directive config and resolve the callback.
         */
        actionOk() {
            let attrs = [];
            for ( let i=0; i<this.model.attributes.length; i++ ) {
                let item = this.model.attributes[i];
                if ( 0 == item.name.trim().length && 0 == item.value.trim().length ) {
                    continue;
                }
                attrs.push(item);
            }
            this.model.attributes = attrs;

            this.directive.setAttributes(this.model);
            this.visible = false;
            this.actResolve();
        },

        /**
         * cancel editting, and reject the callback
         */
        actionCancel() {
            this.visible = false;
            this.actReject();
        },

        /**
         * update the component
         */
        actionUpdate() {
            this.$forceUpdate();
        },
    },
}
</script>