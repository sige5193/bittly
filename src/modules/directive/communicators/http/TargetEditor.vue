<!--
 - Target editor for HTTP
 - @author sige
-->
<template>
  <a-row>
    <a-col :span="20" class="pr-1">
      <a-input-group compact>
        <a-select 
          style="width:15%;"
          ref="sltMethod"
          v-model="target.httpMethod" 
          :dropdownMatchSelectWidth="false"
          @change="actionUpdateTarget" 
        >
          <a-select-option 
            v-for="method in methods"
            :key="method" 
            :value="method"
          >{{method}}</a-select-option>
        </a-select>
        <a-input 
          style="width: 85%"
          ref="txtUrl"
          v-model="target.httpUrl" 
          @change="actionUrlChange" 
        />
      </a-input-group>
    </a-col>
    
    <a-col :span="4">
      <a-button ref="btnOptionsEdit" @click="actionEditRequestOptions"><a-icon type="tool" /></a-button>
      
      <!-- Options Edit Modal -->
      <a-modal 
        width="800px"
        ref="modalOptionEdit"
        v-if="modalRequestOptionEnable" 
        v-model="modalRequestOptionEnable" 
        :title="null" 
        :bodyStyle="{padding:0}"
        :ok-text="$t('button.ok')"
        :cancel-text="$t('button.cancel')"
        @ok="actionModalRequestOptionOk"
      >
        <a-tabs default-active-key="query" :tabBarStyle="{margin:0}" v-model="modalRequestOptionPanel">
          <!-- query -->
          <a-tab-pane key="query" tab="Query">
            <a-table :columns="tableQueryEditColumns" :data-source="target.httpQuery" 
              :pagination="false" :scroll="{ y: 300 }" size="small"
            >
              <div slot="name" slot-scope="text, record, index">
                <a-input size="small" class="border-none"
                  v-model="target.httpQuery[index].name" 
                  :ref="`txtQueryItemName_${index}`"
                  :placeholder="$t('directive.communicator.http.headerTableColumnName')" 
                  @change="actionKeyValueAttributeItemInputChange('httpQuery',index)"
                />
              </div>
              <div slot="value" slot-scope="text, record, index">
                <a-input size="small" class="border-none"
                  v-model="target.httpQuery[index].value" 
                  :ref="`txtQueryItemValue_${index}`"
                  :placeholder="$t('directive.communicator.http.headerTableColumnValue')" 
                  @change="actionKeyValueAttributeItemInputChange('httpQuery',index)"
                />
              </div>
              <div slot="actions" slot-scope="text, record, index">
                <a-button :ref="`btnQueryItemDelete_${index}`" @click="actionKeyValueAttributeItemDelete('httpQuery',index)" size="small">
                  <a-icon type="delete" />
                </a-button>
              </div>
            </a-table>
          </a-tab-pane>

          <!-- header -->
          <a-tab-pane key="header" tab="Header">
            <a-table :columns="tableHeaderEditColumns" :data-source="target.httpHeaders" 
              :pagination="false" :scroll="{ y: 300 }" size="small"
            >
              <div slot="name" slot-scope="text, record, index">
                <a-auto-complete size="small" class="w-100 com-http-header-item-editor" v-model="target.httpHeaders[index].name"
                  :placeholder="$t('directive.communicator.http.headerTableColumnName')" 
                  :ref="`txtHeaderItemName_${index}`"
                  :data-source="headerNameSuggestions"
                  @change="actionKeyValueAttributeItemInputChange('httpHeaders',index)"
                />
              </div>
              <div slot="value" slot-scope="text, record, index">
                <a-input size="small" class="border-none"
                  v-model="target.httpHeaders[index].value" 
                  :ref="`txtHeaderItemValue_${index}`"
                  :placeholder="$t('directive.communicator.http.headerTableColumnValue')" 
                  @change="actionKeyValueAttributeItemInputChange('httpHeaders', index)"
                />
              </div>
              <div slot="actions" slot-scope="text, record, index">
                <a-button :ref="`btnHeaderItemDelete_${index}`" @click="actionKeyValueAttributeItemDelete('httpHeaders',index)" size="small">
                  <a-icon type="delete" />
                </a-button>
              </div>
            </a-table>
          </a-tab-pane>

          <!-- cookie -->
          <a-tab-pane key="cookie" tab="Cookie">
            <a-table :columns="tableCookieEditColumns" :data-source="target.httpCookies" 
              :pagination="false" :scroll="{ y: 300 }" size="small"
            >
              <div slot="name" slot-scope="text, record, index">
                <a-input size="small" class="border-none"
                  v-model="target.httpCookies[index].name" 
                  :ref="`txtCookieItemName_${index}`"
                  :placeholder="$t('directive.communicator.http.headerTableColumnName')" 
                  @change="actionKeyValueAttributeItemInputChange('httpCookies',index)"
                />
              </div>
              <div slot="value" slot-scope="text, record, index">
                <a-input size="small" class="border-none"
                  v-model="target.httpCookies[index].value" 
                  :ref="`txtCookieItemValue_${index}`"
                  :placeholder="$t('directive.communicator.http.headerTableColumnValue')" 
                  @change="actionKeyValueAttributeItemInputChange('httpCookies',index)"
                />
              </div>
              <div slot="actions" slot-scope="text, record, index">
                <a-button @click="actionKeyValueAttributeItemDelete('httpCookies',index)" size="small">
                <a-icon type="delete" />
                </a-button>
              </div>
            </a-table>
          </a-tab-pane>

          <!-- settings -->
          <a-tab-pane key="setting" :tab="$t('directive.communicator.http.settings')" class="pt-3">
            <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
              <a-form-item :label="$t('directive.communicator.http.followRedirect')">
                <a-checkbox ref="checkFollowRedirect" v-model="target.httpFollowRedirectEnable" @change="actionUpdateTarget"/>
              </a-form-item>
              <a-form-item :label="$t('directive.communicator.http.maxRedirectCount')">
                <a-input-number ref="txtRedirectMax" v-model="target.httpFollowRedirectMaxCount" :min="1" :step="1" @change="actionUpdateTarget" />
              </a-form-item>
              <a-form-item :label="$t('directive.communicator.http.showResponseHeaders')">
                <a-checkbox ref="checkShowResponse" v-model="target.httpResponseHeaderEnable" @change="actionUpdateTarget"/>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-modal>
    </a-col>
  </a-row>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js';
import TargetEditorMixin from '../TargetEditorMixin.js'
export default {
    name : 'HttpTargetEditor',
    mixins : [TargetEditorMixin],
    data() {
        return {
            modalRequestOptionPanel : 'query',
            modalRequestOptionEnable : false,
            tableQueryEditColumns : [
                {title: this.$t('directive.communicator.http.queryTableColumnName'),dataIndex: 'name',key: 'name', width:'40%',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.communicator.http.queryTableColumnValue'),dataIndex: 'value',key: 'value', width:'40%',scopedSlots: { customRender: 'value' }},
                {title: this.$t('directive.communicator.http.queryTableColumnOperation'),dataIndex: 'actions',key: 'actions',scopedSlots: { customRender: 'actions' }, className:'text-right'},
            ],
            tableHeaderEditColumns : [
                {title: this.$t('directive.communicator.http.headerTableColumnName'),dataIndex: 'name',key: 'name', width:'40%',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.communicator.http.headerTableColumnValue'),dataIndex: 'value',key: 'value', width:'40%',scopedSlots: { customRender: 'value' }},
                {title: this.$t('directive.communicator.http.headerTableColumnOperation'),dataIndex: 'actions',key: 'actions',scopedSlots: { customRender: 'actions' }, className:'text-right'},
            ],
            tableCookieEditColumns : [
                {title: this.$t('directive.communicator.http.cookieTableColumnName'),dataIndex: 'name',key: 'name', width:'40%',scopedSlots: { customRender: 'name' }},
                {title: this.$t('directive.communicator.http.cookieTableColumnValue'),dataIndex: 'value',key: 'value', width:'40%',scopedSlots: { customRender: 'value' }},
                {title: this.$t('directive.communicator.http.cookieTableColumnOperation'),dataIndex: 'actions',key: 'actions',scopedSlots: { customRender: 'actions' }, className:'text-right'},
            ],
            headerNameSuggestions : [
                "A-IM", "Accept", "Accept-Charset", "Accept-Encoding", "Accept-Language", "Accept-Datetime", 
                "Access-Control-Request-Method", "Access-Control-Request-Headers", "Authorization", "Cache-Control", 
                "Connection", "Content-Length", "Content-Type", "Cookie", "Date", "Expect", "Forwarded", "From", "Host", 
                "If-Match", "If-Modified-Since", "If-None-Match", "If-Range", "If-Unmodified-Since", "Max-Forwards", "Origin", 
                "Pragma", "Proxy-Authorization", "Range", "Referer", "TE", "User-Agent", "Upgrade", "Via", "Warning"
            ],
            methods : ['GET','POST','PUT','PATCH','DELETE','COPY','HEAD','OPTIONS','LINK','UNLINK','PURGE','LOCK','UNLOCK','PROPFIND','VIEW'],
        };
    },
    mounted() {
        this.setupTarget();
    },
    methods : {
        /**
         * setup target object, set default method to GET
         */
        setupTarget() {
            let hasChanged = MyObject.applyDefaultValues(this.target, {
                httpMethod : 'GET',
                httpUrl : '',
                httpQuery : [],
                httpHeaders : [],
                httpCookies : [],
                httpFollowRedirectMaxCount : 10,
                httpFollowRedirectEnable : true,
                httpResponseHeaderEnable : false,
            });
            if ( hasChanged ) {
                this.updateVModel();
            }
            if ( 0 == this.target.httpQuery.length ) {
                this.keyValueAttributeItemCreate('httpQuery');
                this.updateVModel();
            }
            if ( 0 == this.target.httpHeaders.length ) {
                this.keyValueAttributeItemCreate('httpHeaders');
                this.updateVModel();
            }
            if ( 0 == this.target.httpCookies.length ) {
                this.keyValueAttributeItemCreate('httpCookies');
                this.updateVModel();
            }

            this.isEditorInited = true;
        },

        /**
         * event handler on url changed
         */
        actionUrlChange() {
            let urlInfo = null;
            try {
                urlInfo = new URL(this.target.httpUrl);
            } catch {
                return;
            }
            
            let query = new URLSearchParams(urlInfo.search);
            this.target.httpQuery = [];
            for (let paramKey of query.keys() ) {
                this.target.httpQuery.push({
                    key:(new Date()).getTime()+paramKey, 
                    name : paramKey, 
                    value : query.get(paramKey),
                });
            }
            this.keyValueAttributeItemCreate('httpQuery');
            this.updateVModel();
        },

        /**
         * update url by query table data
         */
        updateUrlByQueryTable() {
            let query = new URLSearchParams();
            for ( let i=0; i<this.target.httpQuery.length; i++ ) {
                let param = this.target.httpQuery[i];
                let name = param.name.trim();
                if ( 0 === name.length ) {
                    continue;
                }
                query.append(param.name, param.value);
            }
            let queryString = query.toString();

            let url = this.target.httpUrl;
            if ( -1 != url.indexOf('?') ) {
                url  = url.substr(0, url.indexOf('?'));
            }
            this.target.httpUrl = url + '?' + queryString;
        },

        /**
         * create a new item for k-v attribute
         */
        keyValueAttributeItemCreate( attrName ) {
            this.target[attrName].push({key:(new Date()).getTime(), name : '',value : ''});
        },

        /**
         * delete header item by given index. 
         * if the attribute list is empty or deleting the last one, we need to 
         * create a new editor row to the end of list.
         * @param {String} attrName
         * @param {Number} index
         */
        actionKeyValueAttributeItemDelete( attrName, index ) {
            if ( index == this.target[attrName].length - 1 ) {
                this.keyValueAttributeItemCreate(attrName);
            }
            this.target[attrName].splice(index, 1);
            if ( 'httpQuery' === attrName ) {
                this.updateUrlByQueryTable();
            }
            this.updateVModel();
            this.$forceUpdate();
        },

        /**
         * update target model on header item has been changed.
         * @param {Number} index
         */
        actionKeyValueAttributeItemInputChange(attrName, index) {
            if ( 'httpQuery' === attrName ) {
                this.updateUrlByQueryTable();
            }
            if ( index == this.target[attrName].length - 1 ) {
                this.keyValueAttributeItemCreate(attrName);
            }
            this.updateVModel();
            this.$forceUpdate();
        },

        /**
         * show option edit modal
         */
        actionEditRequestOptions() {
            this.modalRequestOptionEnable = true;
        },

        /**
         * done options edit, hide the editor modal.
         */
        actionModalRequestOptionOk() {
            this.modalRequestOptionEnable = false;
            this.updateVModel();
        },
    },
    /**
     * Target editor config
     */
    editorConfig() {
        return {
            name : 'Http',
            label : window.app.$t('directive.communicator.http.name'),
            defaultDataType:'string',
            defaultResponseViewer : 'text'
        };
    }
}
</script>
<style>
.com-http-header-item-editor input {
    border : none !important;
}
</style>