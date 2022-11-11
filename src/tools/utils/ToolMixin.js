export default {
    /**
     * 
     */
    created() {
        this.handleWindowResized();
        window.onresize = () => this.handleWindowResized();
    },
    /**
     * 
     */
    methods : {
        /**
         * event handler on window resized
         */
         handleWindowResized() {
            if ( null !== window.os.version().match('Windows 7') ) {
                let borderStyle = window.remote.getCurrentWindow().isMaximized() ? 'none' : 'solid 1px #b7b7b7';
                document.getElementsByTagName('body')[0].style.border = borderStyle;
            }
        }
    }
}