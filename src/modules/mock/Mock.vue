<template>
  <div class="bg-white h-100 d-flex flex-dir-column">
    <a-page-header :title="mock.name" class="border-bottom">
      <template slot="extra">
        <a-dropdown :trigger="['click']">
          <a-menu slot="overlay" @click="actionOperationMenuItemClicked">
            <a-menu-item key="Delete"> <a-icon type="delete" /> {{$t('button.delete')}} </a-menu-item>
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
    <div class="h-0 flex-grow">
      <component ref="mocker" :is="`${mock.type}-mocker`" v-model="mock" />
    </div>
  </div>
</template>
<script>
import SerialPortMocker from './mockers/serialport/Mocker.vue'
export default {
    components : {
        'serialport-mocker' : SerialPortMocker,
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
        };
    },
    created() {
        this.mock = this.value;
    },
    mounted() {
        if ( this.mock.isNew ) {
            this.actionSetting();
        }
    },
    methods : {
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
                    $this.actionStop();
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
                this.status = 'running';
            } catch ( e ) {
                this.status = 'stopped';
                let message = 'string' === typeof(e) ? e : e.message;
                this.$message.error(message);
            }
        },

        /**
         * stop mocker
         */
        async actionStop() {
            try {
                this.status = 'closing';
                await this.$refs.mocker.stop();
                this.status = 'stopped';
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
            let handler = `operationHandler${event.key}`;
            this[handler]();
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