<template>
  <div class="block-separator"
    @mousedown="actionMouseDown"
  ></div>
</template>
<script>
export default {
    props : {
        /**
         * number of height
         * @property {Number}
         */
        value : {}
    },
    data() {
        return {
            /**
             * callback handler to handle container mousemove
             * @property {Function}
             */
            containerMouseMoveHandler : null,
            /**
             * callback handler to handle container mouseup
             * @property {Function}
             */
            containerMouseUpHandler : null,
            containerMouseLeaveHandler : null,
        };
    },
    created() {
        this.containerMouseMoveHandler = event => this.onContainerMouseMove(event);
        this.containerMouseUpHandler = event => this.onContainerMouseUp(event);
        this.containerMouseLeaveHandler = event => this.onContainerMouseLeave(event);
    },
    methods : {
        /**
         * event handler on container mouse moved.
         * @param {Event} event
         */
        onContainerMouseMove( event ) {
            let parentRect = this.$el.parentElement.getBoundingClientRect();
            let height = Math.floor(event.clientY - parentRect.top);
            this.$emit('input', height);
        },

        /**
         * event handler on container mouse moved.
         * @param {Event} event
         */
        onContainerMouseUp(event) {
            this.$el.parentElement.removeEventListener('mousemove', this.containerMouseMoveHandler);
            this.$el.parentElement.removeEventListener('mouseup', this.containerMouseUpHandler);
            this.$el.parentElement.removeEventListener('mouseleave', this.containerMouseLeaveHandler);
        },

        /**
         * event handler on container mouse moved.
         * @param {Event} event
         */
        onContainerMouseLeave(event) {
            this.onContainerMouseUp(event);
        },

        /**
         * event handler for mouse move event
         */
        actionMouseDown() {
            this.$el.parentElement.addEventListener("mousemove", this.containerMouseMoveHandler);
            this.$el.parentElement.addEventListener('mouseup', this.containerMouseUpHandler);
            this.$el.parentElement.addEventListener('mouseleave', this.containerMouseLeaveHandler);
        },
    }
}
</script>
<style scoped>
.block-separator {
    text-align: center;
    width: 100%;
    cursor: ns-resize;
    top: -10px;
    height: 1px;
    border-bottom: 1px solid #dee2e6 !important;
    z-index : 999;
}
.block-separator:hover {
    background: #d6d6d6;
    border-radius: 5px;
    height: 10px;
    border:none;
}
</style>