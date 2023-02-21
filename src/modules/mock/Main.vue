<template>
  <a-layout class="h-100" id="app-module-mock">
    <a-layout-sider width="300" class="bg-white border-right">
      <div class="d-flex flex-dir-column h-100">
        <!-- toolbar -->
        <div class="border-bottom p-1">
          <a-dropdown :trigger="['click']">
            <a-menu slot="overlay" @click="actionCreateMenuItemClicked">
              <a-menu-item key="serialport">{{$t('mock.mockers.serialport.typeName')}}</a-menu-item>
              <a-menu-item key="tcp">{{$t('mock.mockers.tcp.typeName')}}</a-menu-item>
              <a-menu-item key="udp">{{$t('mock.mockers.udp.typeName')}}</a-menu-item>
              <a-menu-item key="websocket">{{$t('mock.mockers.websocket.typeName')}}</a-menu-item>
            </a-menu>
            <a-button class="w-100"> 
              <span class="d-inline-block w-50 text-left">{{$t('button.create')}}</span> 
              <span class="d-inline-block w-50 text-right"><a-icon type="down" /></span>
            </a-button>
          </a-dropdown>
        </div>
        
        <!-- no mocks -->
        <div v-if="0 === mocks.length" class="content-center">
          <a-empty :description="false"/>
        </div>

        <!-- mock list -->
        <a-menu class="flex-grow h-0 overflow-y-auto overflow-x-hidden" mode="inline" 
          :selectedKeys="[activeMockIndex]"
          @click="actionMockListMenuItemClicked"
        >
          <a-menu-item v-for="(mock, index) in mocks" :key="index" 
            class="d-flex flex-dir-row"
            style="padding: 5px 16px;height: auto;line-height: 1.1em;"
          >
            <div class="flex-grow">
              <div>{{mock.name}}</div>
              <small class="text-black-50 d-block" style="font-size: 0.8em;">
                <span v-if="mock.summary">{{mock.summary}}</span>
                <span v-else><a-icon type="ellipsis" /></span>
              </small>
            </div>
            <div class="text-right" style="width: 32px;">
              <a-badge v-if="undefined !== mockServices[mock.id]" :span="6" status="processing" />
            </div>
          </a-menu-item>
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout>
      <a-layout-content>
        <div v-if="null === activeMockModel" class="content-center">
          <a-empty :description="false"/>
        </div>
        <!-- mocker -->
        <div v-else-if="false === activeMockModel" class="content-center bg-white">
          <a-spin />
        </div>
        <mock v-else v-model="activeMockModel" @delete="actionMockDeleted"/>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import Mock from './Mock.vue'
import ProjectMixin from '../../utils/ProjectMixin.js'
import ComponentBase from '../../utils/component/Base.js'
import MdbMock from '../../models/MdbMock.js';
export default {
    name : 'ModuleMockMain',
    mixins : [ComponentBase,ProjectMixin],
    components : {
        'mock' : Mock,
    },
    data() {
        return {
            /**
             * mock model instances
             * @property {Array<MdbMock>}
             */
            mocks : [],
            /**
             * active mock index
             * @property {Number}
             */
            activeMockIndex : -1,
            /**
             * active mock model instance
             * @property {null|false|MdbMock}
             */
            activeMockModel : null,
        };
    },
    computed : {
        /**
         * get all online mock services
         * @returns {Object}
         */
        mockServices () {
            return this.$store.getters.mocks;
        }
    },
    async mounted() {
        this.$store.commit('moduleIdSet', 'mock');
        
        await this.loadMocks();
        this.registerEventHandler('mock-start', () => this.$forceUpdate());
        this.registerEventHandler('mock-stop', () => this.$forceUpdate());
    },
    beforeDestroy() {
        this.unregisterAllEventHandlers();
    },
    methods : {
        /**
         * load all mock of current project
         */
        async loadMocks() {
            this.mocks = [];
            this.mocks = await MdbMock.findAll({project_id:this.curProjectId});
            this.mocks.sort((a,b) => a.name.localeCompare(b.name));
        },

        /**
         * active mock by given index
         * @param {Number} index
         */
        switchActiveMock( index ) {
            this.activeMockIndex = index;
            this.activeMockModel = false;
            setTimeout(() => this.activeMockModel = this.mocks[index], 300);
        },

        /**
         * event handler on project id changed
         * @see {ProjectMixin.handleCurProjectIdChanged}
         */
        handleCurProjectIdChanged() {
            this.loadMocks();
        },

        /**
         * event handler on create menu item clicked.
         * @parma {Event} event
         */
        actionCreateMenuItemClicked( event ) {
            if ( 'browser' === this.$env.name ) {
                return this.environmentNotSupport();
            }
            
            let mock = new MdbMock();
            mock.isMockInitRequired = true;
            mock.projectId = this.curProjectId;
            mock.type = event.key;
            mock.name = this.$t('mock.nameDefault', [this.$t(`mock.mockers.${mock.type}.typeName`)]);
            this.mocks.push(mock);
            this.switchActiveMock(this.mocks.length-1);
        },

        /**
         * event handler for mock menu item click, it would active the 
         * target mock.
         * @param {Event} event
         */
        actionMockListMenuItemClicked( event ) {
            let index = event.key;
            if ( index === this.activeMockIndex ) {
                return ;
            }
            this.switchActiveMock(index);
        },

        /**
         * event handler on mock deleted.
         * @param {String} id
         */
        actionMockDeleted( id ) {
            let index = null;
            for ( let i=0; i<this.mocks.length; i++ ) {
                if ( this.mocks[i].id !== id ) {
                    continue ;
                }
                index = i;
                break;
            }

            if ( null === index ) {
                return ;
            }

            this.mocks.splice(index, 1);
            this.activeMockIndex = -1;
            this.activeMockModel = null;
        }
    },
}
</script>