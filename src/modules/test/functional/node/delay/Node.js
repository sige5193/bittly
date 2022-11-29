import {LiteGraph} from 'litegraph.js'
import NodeBase from '../NodeBase';
import Common from '../../../../../utils/Common.js';
/**
 * The node use to start the flow
 */
export default class Node extends NodeBase{
    /**
     * @constructor
     */
    constructor() {
        super();
        this.title = this.$t('name');
        this.addInput(this.$t('execute'), LiteGraph.EVENT);
        this.addOutput(this.$t('execute'), LiteGraph.EVENT);
        this.size = [120,30];

        // setup widget button for variable editting.
        this.onBtnSettingClicked = () => {};
        this.addWidget(
            'button',
            this.$t('setting'),
            null,
            () => this.onBtnSettingClicked(this)
        );

        // value viewer
        this.valueWidget = this.addWidget('text',this.$t('time'),'',()=>{},{disabled:true});
        this.valueWidget.disabled = true;

        this.onOptionUpdate();
    }
    
    /**
     * get type name of this node
     * @returns {String}
     */
    getTypeName() {
        return 'Delay';
    }

    /**
     * get init options
     * @returns {Object}
     */
    getInitOptions() {
        return {
            time : 1000,
        };
    }

    /**
     * handler on option updated
     */
    onOptionUpdate() {
        this.valueWidget.value = this.options.time;
        this.refresh();
    }
    
    /**
     * node action handler
     * @returns {void}
     */
    async onAction() {
        this.log('start');
        let time = this.options.time * 1;
        while ( time > 0 ) {
            await Common.msleep(1);
            time -= 10;
            this.valueWidget.value = time;
            this.refresh();
        }
        this.valueWidget.value = this.options.time;
        this.refresh();

        this.log('done');
        setTimeout(() => this.triggerSlot(0), 1);
    }
}