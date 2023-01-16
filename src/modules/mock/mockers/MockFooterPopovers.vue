<template>
  <div class="d-inline-block">
    <div v-for="mock in mocks" :key="mock.key" class="d-inline-block">
      <div class="popover-trigger">
        <div class="name">{{mock.mock.name}}</div>
        <div ref="actionClose" class="action" @click="actionClose(mock.key)">
          <a-icon type="close"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ComponentBase from '../../../utils/component/Base.js'
export default {
    name : 'MockMockersFooterPopovers',
    mixins : [ComponentBase],
    components : {
        
    },
    computed : {
        /**
         * get mock services
         * @returns {Object}
         */
        mocks() {
            return this.$store.getters.mocks;
        }
    },
    mounted() {
        this.registerEventHandler('mock-start', () => this.$forceUpdate());
        this.registerEventHandler('mock-stop', () => this.$forceUpdate());
    },
    beforeDestroy() {
        this.unregisterAllEventHandlers();
    },
    methods : {
        /**
         * close connection
         */
        actionClose(key) {
            this.mocks[key].stop();
        },
    }
}
</script>
<style scoped>
.popover-trigger {
    font-size: 0.9em;
    display: inline-block;
    margin-left: 5px;
}
.popover-trigger > .name {
    display: inline-block;
    background: #ff5722;
    color: white;
    padding: 1px 10px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}
.popover-trigger > .name:hover {
    background: #ff7346;
}
.popover-trigger > .action {
    display: inline-block;
    background: #c9c9c9;
    padding: 1px 5px;
    color: #898989;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    cursor: pointer;
}
.popover-trigger > .action:hover {
    background: #dddddd;
}
</style>