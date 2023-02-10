<template>
  <div class="d-inline-block">
    <a-icon v-if="hasError" 
      ref="iconError"
      class="mr-1"  
      type="info-circle"
      spin theme="twoTone" 
      two-tone-color="red" 
      @click="actionShowError" 
    />
    
    <a-modal v-if="errorModalVisible"
      width="80%"
      ref="modalErrorInfo"
      :title="$t('app.errorHandler.title')" 
      :visible="errorModalVisible"
      @cancel="errorModalVisible=false"
    >
      <!-- error info -->
      <p>Version : {{packageInfo.version}}</p>
      <p>[{{error.componentName}}] <span class="error-message">{{error.message}}</span></p>
      <pre class="error-stack">{{error.stack}}</pre>
      <p>{{error.info}}</p>
      
      <hr />

      <!-- report contacts -->
      <p>{{$t('app.errorHandler.reportTip')}}</p>
      <p>
        <span class="d-inline-block text-center">
          <img src="../assets/sige-wechat.jpg" style="width:150px;height:150px;" /><br/>
          <span><a-icon type="wechat" /> sigech--</span>
        </span>
        <span class="d-inline-block text-center">
          <img src="../assets/sige-qq.jpg" style="width:150px;height:150px;" /> <br/>
          <span>
            <a-icon class="cursor-pointer" type="qq"/> 568109749
            <a-icon ref="iconStartQQ" class="cursor-pointer" type="sound" @click="actionStartQQ"/>
          </span>
        </span>
        <span class="d-inline-block text-center">
          <img src="../assets/qq-group.jpg" style="width:150px;height:150px;padding:5px;" /> <br/>
          <span>
            <a-icon class="cursor-pointer" type="team"/> 1014521818
            <a-icon ref="iconStartQQGroup" class="cursor-pointer" type="sound" @click="actionStartQQGroup"/>
          </span>
        </span>
      </p>
      
      <div slot="footer">
        <a-button ref="btnErrorIgnore" type="danger" @click="actionIgnore">{{$t('app.errorHandler.errorIgnore')}}</a-button>
      </div>
    </a-modal>
  </div>
</template>
<script>
import packageInfo from '../../package.json'
import Vue from 'vue'
export default {
    name : 'AppErrorHandler',
    data() {
        return {
            /**
             * indicate if error exists
             * @property {Boolean}
             */
            hasError : false,
            /**
             * indicate whether error modal visiable
             * @property {Boolean}
             */
            errorModalVisible : false,
            /**
             * error information
             * @property {Object}
             */
            error : null,
            /**
             * content of package.json
             * @property {Object}
             */
            packageInfo : null,
        };
    },
    mounted() {
        this.packageInfo = packageInfo;
        this.init();
    },
    methods : {
        /**
         * init error handler
         */
        init() {
            Vue.config.errorHandler = (error,vm,info) => this.vueErrorHandler(error, vm, info);
            window.addEventListener('error', event => this.globalErrorHandler(event));
            window.addEventListener("unhandledrejection", event => this.gloablUnhandledRejectionHandler(event));
        },

        /**
         * report error info to server.
         */
        reportError( error ) {
            error.userAgent = navigator.userAgent;
            error.version = packageInfo.version;
            error.moduleId = this.$store.getters.moduleId;
            this.$bittly.errorReport(error);
        },
        
        /**
         * event handler to handle unhandled rejection.
         */
        gloablUnhandledRejectionHandler (event) {
            event.preventDefault();
            let error = event.reason;
            console.error(error);
            if ( undefined == event.reason ) {
                error = {message:'Empty Rejection Message', stack:null};
            }
            if ( 'string' == typeof(error) ) {
                error = {message:error, stack:null};
            }
            
            let errorInfo = {};
            errorInfo.type = 'unhandledrejection';
            errorInfo.message = error.message;
            errorInfo.stack = error.stack;
            errorInfo.info = 'ErrorType : unhandledrejection';
            this.reportError(errorInfo);

            this.hasError = true;
            this.errorModalVisible = true;
            this.error = {};
            this.error.message = error.message;
            this.error.stack = error.stack;
            this.error.componentName = 'NOT-COMPONENT'
            this.error.info = 'ErrorType : unhandledrejection';
        },

        /**
         * global error handler
         * @param {ErrorEvent} event
         */
        globalErrorHandler(event) {
            event.preventDefault();
            let error = event.error;
            if ( 'string' == typeof(error) ) {
                error = {message:error, stack:null};
            }

            let errorInfo = {};
            errorInfo.type = 'unhandledrejection';
            errorInfo.message = error.message;
            errorInfo.stack = error.stack;
            errorInfo.info = 'ErrorType : error';
            this.reportError(errorInfo);

            this.hasError = true;
            this.errorModalVisible = true;
            this.error = {};
            this.error.message = error.message;
            this.error.stack = error.stack;
            this.error.componentName = 'NOT-COMPONENT'
            this.error.info = 'ErrorType : error';
            console.error(event.error);
        },

        /**
         * VUE error handler
         */
        vueErrorHandler( error, vm, info ) {
            if ( 'string' == typeof(error) ) {
                error = {message:error, stack:null};
            }
            
            let errorInfo = {};
            errorInfo.message = error.message;
            errorInfo.stack = error.stack;
            errorInfo.info = `Vue Error Handler : ${info}`;
            errorInfo.componentName = vm.$options.name;
            errorInfo.componentData = JSON.stringify(vm.$data);
            
            // we need to know which component occures the error
            errorInfo.componentPath = [];
            let com = vm;
            while ( undefined !== com.$parent ) {
                errorInfo.componentPath.push(com.$options.name || 'Anonymouse');
                com = com.$parent;
            }
            
            this.reportError(errorInfo);

            this.hasError = true;
            this.errorModalVisible = true;
            this.error = {};
            this.error.message = error.message;
            this.error.stack = error.stack;
            this.error.componentName = vm.$options.name;
            this.error.info = info;
            console.error(error);
        },

        /**
         * show error dialog
         */
        actionShowError() {
            this.errorModalVisible = true;
        },

        /**
         * ignore this error
         */
        actionIgnore() {
            this.hasError = false;
            this.errorModalVisible = false;
            this.error = null;
        },

        /**
         * Open QQ Link
         */
        actionStartQQ() {
            window.shell.openExternal("http://wpa.qq.com/msgrd?v=1&uin=568109749&site=qq&menu=yes");
        },

        /**
         * Open QQ group link
         */
        actionStartQQGroup() {
            window.shell.openExternal('https://qm.qq.com/cgi-bin/qm/qr?k=NqSWCMQAFL5RE-ic1tC8U0Fp5gtc1XwB&jump_from=webapi');
        },
    },
}
</script>
<style scoped>
.error-stack { white-space: break-spaces; word-break: break-all;}
.error-message {color: #ff5858; font-weight: 700;}
</style>