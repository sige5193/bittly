<template>
  <a-row>
    <!-- uri -->
    <a-col :span="15" class="pr-1">
      <a-input 
        ref="txtUri"
        v-model="target.mqttUri"
        :placeholder="$t('directive.communicator.mqtt.uriPlaceholder')"
        :addon-before="$t('directive.communicator.mqtt.uri')" 
        @change="actionUpdateTarget(true)"
      />
    </a-col>
    
    <!-- publish topic -->
    <a-col :span="7">
      <a-input 
        v-model="target.mqttPublishTopic" 
        :addon-before="$t('directive.communicator.mqtt.publishTopic')"
        @change="actionUpdateTarget" 
      />
    </a-col>
    
    <a-col :span="2" class="pl-1">
      <a-button ref="btnShowOptionModal" @click="actionEditRequestOptions"><a-icon type="tool" /></a-button>

      <a-modal 
        ref="modalOptions"
        v-if="modalRequestOptionEnable" 
        v-model="modalRequestOptionEnable" 
        :title="null" 
        :ok-text="$t('button.ok')"
        :cancel-text="$t('button.cancel')"
        :bodyStyle="{padding:0}"
        @ok="actionModalRequestOptionOk"
      >
        <a-tabs v-model="modalRequestOptionTab">
          <!-- connection -->
          <a-tab-pane key="connection" :tab="$t('directive.communicator.mqtt.optionModalTabConnection')" force-render>
            <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-form-item :label="$t('directive.communicator.mqtt.clientId')">
                <a-input ref="txtClientId" v-model="extSetting.mqttClientId" @change="actionForceUpdate"/>
              </a-form-item>
              <a-form-item :label="$t('directive.communicator.mqtt.username')">
                <a-input ref="txtUsername" v-model="extSetting.mqttUsername" @change="actionForceUpdate"/>
              </a-form-item>
              <a-form-item :label="$t('directive.communicator.mqtt.password')">
                <a-input ref="txtPassword" v-model="extSetting.mqttPassword" @change="actionForceUpdate"/>
              </a-form-item>
              <a-form-item :label="$t('directive.communicator.mqtt.version')">
                <a-select ref="sltVersion" v-model="extSetting.mqttProtocolVersion" @change="actionForceUpdate">
                  <a-select-option value="4">3.1.1</a-select-option>
                  <a-select-option value="5">5.0</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- publish -->
          <a-tab-pane key="publish" :tab="$t('directive.communicator.mqtt.optionModalTabPublish')">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
              <a-form-item label="QoS">
                <a-select v-model="extSetting.mqttPublishQoS" @change="actionForceUpdate">
                  <a-select-option value="0">{{$t('directive.communicator.mqtt.publishQos0')}}</a-select-option>
                  <a-select-option value="1">{{$t('directive.communicator.mqtt.publishQos1')}}</a-select-option>
                  <a-select-option value="2">{{$t('directive.communicator.mqtt.publishQos2')}}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Retain">
                <a-checkbox v-model="extSetting.mqttPublishRetain" @change="actionForceUpdate"></a-checkbox>
              </a-form-item>
              
              <!-- version 5 support -->
              <template v-if="'5' == extSetting.mqttProtocolVersion">
                <!-- content type -->
                <a-form-item :label="$t('directive.communicator.mqtt.contentType')">
                  <a-auto-complete 
                    v-model="extSetting.mqttPublishContentType" 
                    :data-source="contentType"
                    @change="actionForceUpdate"
                  />
                </a-form-item>

                <!-- message expiry interval -->
                <a-form-item :label="$t('directive.communicator.mqtt.messageExpiryInterval')">
                  <a-input-group compact class="w-100">
                    <a-input-number
                      class="w-85"
                      v-model="extSetting.mqttPublishMessageExpiryInterval"
                      :min="0"
                      :step="1"
                      :precision="0"
                      @change="actionForceUpdate"
                    />
                    <a-input class="w-15 text-center cursor-default" :value="$t('unit.second')" disabled/>
                  </a-input-group>
                </a-form-item>
                
                <!-- topic alias -->
                <a-form-item :label="$t('directive.communicator.mqtt.topicAlias')">
                  <a-input-number 
                    class="w-100"
                    v-model="extSetting.mqttPublishTopicAlias" 
                    :min="1"
                    :max="65535"
                    :step="1"
                    :precision="0"
                    @change="actionForceUpdate"
                  />
                </a-form-item>

                <!-- response topic & correlation data -->
                <a-form-item :label="$t('directive.communicator.mqtt.responseTopic')">
                  <a-input v-model="extSetting.mqttPublishResponseTopic" @change="actionForceUpdate"/>
                </a-form-item>
                <a-form-item :label="$t('directive.communicator.mqtt.correlationData')">
                  <a-input v-model="extSetting.mqttPublishCorrelationData" @change="actionForceUpdate"/>
                </a-form-item>

                <!-- Subscription Identifier -->
                <a-form-item :label="$t('directive.communicator.mqtt.subscriptionIdentifier')">
                  <a-input-number 
                    class="w-100"
                    v-model="extSetting.mqttPublishSubscriptionIdentifier" 
                    :min="1"
                    :max="65535"
                    :step="1"
                    :precision="0"
                    @change="actionForceUpdate"
                  />
                </a-form-item>
                
                <!-- Payload Format Indicator -->
                <a-form-item :label="$t('directive.communicator.mqtt.payloadFormatIndicator')">
                  <a-checkbox 
                    v-model="extSetting.mqttPublishPayloadFormatIndicator" 
                    @change="actionForceUpdate"
                  ></a-checkbox>
                </a-form-item>

                <!-- User Properties -->
                <a-form-item :label="$t('directive.communicator.mqtt.userProperties')">
                  <a-input-group compact v-for="(item, index) in extSetting.mqttPublishUserProperties" :key="item.key">
                    <a-input 
                      ref="inputUserPropertiesName"
                      style="width: 40%"
                      v-model="extSetting.mqttPublishUserProperties[index].name" 
                      :placeholder="$t('directive.communicator.mqtt.userPropertiesName')"
                      @change="actionForceUpdate"
                    />
                    <a-input 
                      ref="inputUserPropertiesValue"
                      style="width: 40%" 
                      v-model="extSetting.mqttPublishUserProperties[index].value" 
                      :placeholder="$t('directive.communicator.mqtt.userPropertiesValue')"
                      @change="actionForceUpdate" 
                    />
                    <a-button ref="btnUserPropertiesItemDelete" style="width: 10%" class="text-center pl-0 pr-0" 
                      @click="actionMqttPublishUserPropertiesDelete(index)"
                    ><a-icon type="delete" /></a-button>
                    <a-button
                      ref="btnUserPropertiesItemAdd" 
                      style="width: 10%" 
                      class="text-center pl-0 pr-0"
                      @click="actionMqttPublishUserPropertiesAdd"
                    ><a-icon type="plus" /></a-button>
                  </a-input-group>
                  <a-button 
                    ref="btnUserPropertiesAdd"
                    v-if="0 == extSetting.mqttPublishUserProperties" 
                    @click="actionMqttPublishUserPropertiesAdd"
                  ><a-icon type="plus" /></a-button>
                </a-form-item>
              </template>
            </a-form>
          </a-tab-pane>

          <!-- subscribe -->
          <a-tab-pane key="subscribe" :tab="$t('directive.communicator.mqtt.optionModalTabSubscribe')" force-render>
            <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-form-item :label="$t('directive.communicator.mqtt.topic')">
                <a-input v-model="extSetting.mqttSubscribeTopic" @change="actionForceUpdate"/>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-modal>
    </a-col>
  </a-row>
</template>
<script>
import Communicator from './Communicator.js';
import TargetEditorMixin from '../TargetEditorMixin.js'
import MyObject from '../../../../utils/datatype/MyObject.js';
export default {
    name : 'Mqtt',
    mixins : [TargetEditorMixin],
    data() {
        return {
            /**
             * @property {Boolean}
             */
            modalRequestOptionEnable : false,
            /**
             * @property {String}
             */
            modalRequestOptionTab : 'connection',
            /**
             * @property {Object}
             */
            extSetting : {},
            /**
             * @property {Array}
             */
            contentType : ['text/plain','application/json','application/octet-stream'],
        };
    },
    mounted() {
        this.initTarget();
    },
    methods: {
        /**
         * init target model
         */
        initTarget() {
            if ( undefined == this.target.mqttPublishUserProperties ) {
                this.target.mqttPublishUserProperties = [];
                this.updateVModel();
            }
            this.$forceUpdate();
            this.isEditorInited = true;
        },

        /**
         * show option modal
         */
        actionEditRequestOptions () {
            this.extSetting = MyObject.copy(this.target);
            this.modalRequestOptionEnable = true;
        },

        /**
         * event handler on user click `ok` button of extension setting modal.
         */
        actionModalRequestOptionOk() {
            if ( !MyObject.isEqual(this.extSetting, this.target) ) {
                this.target = MyObject.copy(this.extSetting);
                this.actionUpdateTarget(true);
            }
            this.modalRequestOptionEnable = false;
        },

        /**
         * get device key by options use to close device after options change.
         * @overide
         * @param {Object} options
         * @returns {String}
         */
        getComKeyByOptions(options) {
            return Communicator.generateKeyFromOptions(options);
        },

        /**
         * add new item to publish user properties
         */
        actionMqttPublishUserPropertiesAdd() {
            this.extSetting.mqttPublishUserProperties.push({
                key : (new Date()).getTime(),
                name : '',
                value : '',
            });
            this.$forceUpdate();
        },

        /**
         * remove publish user properties by given index
         * @param {Number} index
         */
        actionMqttPublishUserPropertiesDelete(index) {
            this.extSetting.mqttPublishUserProperties.splice(index, 1);
            this.$forceUpdate();
        }
    },
    /**
     * editor config
     */
    editorConfig() {
        return {
            name : window.app.$t('directive.communicator.mqtt.name'),
            defaultDataType:'byte',
            defaultResponseViewer : 'hex'
        };
    }
}
</script>