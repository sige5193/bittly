<template>
  <div class="bg-white h-100 d-flex flex-dir-column">
    <!-- header -->
    <a-page-header :title="mock.name" :sub-title="mock.summary" class="border-bottom">
      <template slot="extra">
        <a-dropdown :trigger="['click']">
          <a-menu slot="overlay" @click="actionOperationMenuItemClicked">
            <a-menu-item key="Delete" data-handler="this"> <a-icon type="delete" /> {{$t('button.delete')}} </a-menu-item>
            <a-menu-item v-for="mockActItem in extOperations" :key="mockActItem.key" data-handler="mocker">
              <a-icon :type="mockActItem.icon" /> {{mockActItem.label}}
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> {{$t('mock.operations')}} <a-icon type="down" /> </a-button>
        </a-dropdown>
        <a-button :disabled="-1 === ['stopped','running'].indexOf(status)" @click="actionSetting">{{$t('mock.setting')}}</a-button>
        <a-button v-if="'stopped' == status" type="primary" @click="actionStart">{{$t('mock.start')}}</a-button>
        <a-button v-else-if="'opening' == status" type="primary" :loading="true" disabled>{{$t('mock.start')}}</a-button>
        <a-button v-else-if="'running' == status" type="danger" @click="actionStop">{{$t('mock.stop')}}</a-button>
        <a-button v-else-if="'closing' == status" type="danger" :loading="true">{{$t('mock.stop')}}</a-button>
      </template>
    </a-page-header>
    
    <!-- main -->
    <div class="h-0 flex-grow">
      <component ref="mocker" :is="`mocker-${mock.type}`" v-model="mock" />
    </div>
  </div>
</template>
<script>
import ComponentBase from '../../utils/component/Base.js'
import SerialPortMockViewer from './mockers/serialport/MockViewer.vue'
import TcpMockviewer from './mockers/tcp/MockViewer.vue'
import UdpMockViewer from './mockers/udp/MockViewer.vue'
import WebSocketMockViewer from './mockers/websocket/MockViewer.vue'
export default {
    mixins : [ComponentBase],
    components : {
        'mocker-serialport' : SerialPortMockViewer,
        'mocker-tcp' : TcpMockviewer,
        'mocker-udp' : UdpMockViewer,
        'mocker-websocket' : WebSocketMockViewer,
    },
    props : {
        /**
         * instance of mock model
         * @property {MdbMock}
         */
        value : {type:Object},
    },
    data() {
        return {
            /**
             * instance of mock model
             * @property {MdbMock}
             */
            mock : null,
            /**
             * status of mock service : [stopped|running|closing|opening]
             * @property {String}
             */
            status : 'stopped',
            /**
             * list of ext actions
             * @property {Array<Object>}
             */
            extOperations : [],
        };
    },
    created() {
        this.mock = this.value;
    },
    mounted() {
        this.registerEventHandler('mock-start', (mocker) => this.onMockStart(mocker));
        this.registerEventHandler('mock-stop', (key) => this.onMockStop(key));
        if ( this.mock.isNew ) {
            this.actionSetting();
        }
        if ( undefined != this.$store.getters.mocks[this.mock.id] ) {
            this.status = 'running';
        }
        this.extOperations = this.$refs.mocker.getExtenActions();
    },
    beforeDestroy() {
        this.unregisterAllEventHandlers();
    },
    methods : {
        /**
         * event handler on mock started
         * @param {Object} mocker
         */
        onMockStart(mocker) {
            if ( mocker.key != this.mock.id ) {
                return ;
            }
            this.status = 'running';
            this.$message.success(this.$t('mock.mockerStarted'));
        },

        /**
         * event handler on mock stopped.
         * @param {String} key
         */
        onMockStop( key ) {
            if ( key != this.mock.id ) {
                return ;
            }
            this.status = 'stopped';
            this.$message.info(this.$t('mock.mockerStopped'));
        },

        /**
         * enable mock setting
         */
        actionSetting() {
            if ( 'stopped' == this.status ) {
                this.$refs.mocker.setting();
                return ;
            }
            
            let $this = this;
            this.$confirm({
                title: this.$t('mock.stopConfirm'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                async onOk() {
                    await $this.actionStop();
                    $this.$refs.mocker.setting();
                },
            });
        },

        /**
         * start mocker
         */
        async actionStart() {
            try {
                this.status = 'opening';
                await this.$refs.mocker.start();
            } catch ( e ) {
                this.status = 'stopped';
                let message = 'string' === typeof(e) ? e : e.message;
                this.$message.error(this.$t('mock.startFailed',[message]));
            }
        },

        /**
         * stop mocker
         */
        async actionStop() {
            try {
                this.status = 'closing';
                await this.$refs.mocker.stop();
            } catch ( e ) {
                this.status = 'running';
                let message = 'string' === typeof(e) ? e : e.message;
                this.$message.error(message);
            }
        },

        /**
         * handle operation menu item clicked.
         * @param {Event} event
         */
        actionOperationMenuItemClicked( event ) {
            let handelrType = event.domEvent.target.dataset.handler;
            if ( 'this' === handelrType ) {
                let handler = `operationHandler${event.key}`;
                this[handler]();
            } else {
                this.$refs.mocker.executeExtenAction(event.key);
            }
        },
        
        /**
         * delete this mock 
         */
        operationHandlerDelete() {
            let id = this.mock.id;
            
            let $this = this;
            this.$confirm({
                title: this.$t('mock.mockDeleteConfirm'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                async onOk() {
                    if ( 'running' == $this.status ) {
                        await $this.actionStop();
                    }
                    if ( !$this.mock.isNew ) {
                        await $this.mock.delete();
                    }
                    $this.$emit('delete', id);
                },
            });
        }
    },
}
</script>