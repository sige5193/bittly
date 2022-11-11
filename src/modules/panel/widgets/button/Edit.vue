<!--
 - widget ：button
 - @attr [icon] icon name
 - @attr [label] text
 - @author sige
-->
<template>
  <div>
    <a-button :type="widget.btnType" :size="widget.btnSize">
      <a-icon v-if="widget.icon" :type="widget.icon" />
      {{widget.label}}
    </a-button>

    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['directive','script']"
      defaultAction="directive"
    >
      <!-- icon -->
      <a-form-item :label="$t('panel.widgets.button.icon')">
        <a-select 
          ref="selectIcon"
          v-model="widget.icon" 
          show-search 
          allowClear 
          @input="actionForceUpdate"
        >
          <a-select-option 
            v-for="(icon, iconIndex) in icons" 
            :key="iconIndex" 
            :value="icon"
          ><a-icon :type="icon" /> {{icon}}</a-select-option>
        </a-select>
      </a-form-item>

      <!-- name -->
      <a-form-item :label="$t('panel.widgets.button.name')">
        <a-input ref="inputLabel" v-model="widget.label" @input="actionForceUpdate"/>
      </a-form-item>

      <!-- size -->
      <a-form-item :label="$t('panel.widgets.button.size')">
        <a-radio-group v-model="widget.btnSize" @change="actionForceUpdate">
          <a-radio-button value="large">{{$t('panel.widgets.button.sizeLarge')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.button.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.button.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- type -->
      <a-form-item :label="$t('panel.widgets.button.type')">
        <a-radio-group v-model="widget.btnType" @change="actionForceUpdate">
          <a-radio-button value="primary">{{$t('panel.widgets.button.typePrimary')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.button.typeDefault')}}</a-radio-button>
          <a-radio-button value="dashed">{{$t('panel.widgets.button.typeDashed')}}</a-radio-button>
          <a-radio-button value="danger">{{$t('panel.widgets.button.typeDanger')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- confirmMessage -->
      <a-form-item :label="$t('panel.widgets.button.confirmMessage')">
        <a-input ref="inputConfirmMessage" v-model="widget.confirmMessage" @input="actionForceUpdate"/>
      </a-form-item>

    </modal-action-widget-setting>
  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js'
export default {
    name : 'WidgetButton',
    mixins : [WidgetEditMixin],
    data() {
        return {
            icons : [
                'step-backward','step-forward','fast-backward','fast-forward','shrink','arrows-alt','down','up','left','right',
                'caret-up','caret-down','caret-left','caret-right','up-circle','down-circle','left-circle','right-circle',
                'double-right','double-left','vertical-left','vertical-right','vertical-align-top','vertical-align-middle',
                'vertical-align-bottom','forward','backward','rollback','enter','retweet','swap','swap-left','swap-right',
                'arrow-up','arrow-down','arrow-left','arrow-right','play-circle','up-square','down-square','left-square',
                'right-square','login','logout','menu-fold','menu-unfold','border-bottom','border-horizontal','border-inner',
                'border-outer','border-left','border-right','border-top','border-verticle','pic-center','pic-left','pic-right',
                'radius-bottomleft','radius-bottomright','radius-upleft','radius-upright','fullscreen','fullscreen-exit',
                'question','question-circle','plus','plus-circle','pause','pause-circle','minus','minus-circle','plus-square',
                'minus-square','info','info-circle','exclamation','exclamation-circle','close','close-circle','close-square',
                'check','check-circle','check-square','clock-circle','warning','issues-close','stop','edit','form','copy',
                'scissor','delete','snippets','diff','highlight','align-center','align-left','align-right','bg-colors','bold',
                'italic','underline','strikethrough','redo','undo','zoom-in','zoom-out','font-colors','font-size','line-height',
                'dash','small-dash','sort-ascending','sort-descending','drag','ordered-list','unordered-list','radius-setting',
                'column-width','column-height','area-chart','pie-chart','bar-chart','dot-chart','line-chart','radar-chart',
                'heat-map','fall','rise','stock','box-plot','fund','sliders','android','apple','windows','ie','chrome','github',
                'aliwangwang','dingding','weibo-square','weibo-circle','taobao-circle','html5','weibo','twitter','wechat',
                'youtube','alipay-circle','taobao','skype','qq','medium-workmark','gitlab','medium','linkedin','google-plus',
                'dropbox','facebook','codepen','code-sandbox','amazon','google','codepen-circle','alipay','ant-design',
                'ant-cloud','aliyun','zhihu','slack','slack-square','behance','behance-square','dribbble','dribbble-square',
                'instagram','yuque','alibaba','yahoo','reddit','sketch','account-book','alert','api','appstore','audio','bank',
                'bell','book','bug','bulb','calculator','build','calendar','camera','car','carry-out','cloud','code','compass',
                'contacts','container','control','credit-card','crown','customer-service','dashboard','database','dislike',
                'environment','experiment','eye-invisible','eye','file-add','file-excel','file-exclamation','file-image',
                'file-markdown','file-pdf','file-ppt','file-text','file-unknown','file-word','file-zip','file','filter','fire',
                'flag','folder-add','folder','folder-open','frown','funnel-plot','gift','hdd','heart','home','hourglass',
                'idcard','insurance','interaction','layout','like','lock','mail','medicine-box','meh','message','mobile',
                'money-collect','pay-circle','notification','phone','picture','play-square','printer','profile','project',
                'pushpin','property-safety','read','reconciliation','red-envelope','rest','rocket','safety-certificate','save',
                'schedule','security-scan','setting','shop','shopping','skin','smile','sound','star','switcher','tablet','tag',
                'tags','tool','thunderbolt','trophy','unlock','usb','video-camera','wallet','apartment','audit','barcode','bars',
                'block','border','branches','ci','cloud-download','cloud-server','cloud-sync','cloud-upload','cluster','coffee',
                'copyright','deployment-unit','desktop','disconnect','dollar','download','ellipsis','euro','exception','export',
                'file-done','file-jpg','file-protect','file-sync','file-search','fork','gateway','global','gold','history',
                'import','inbox','key','laptop','link','line','loading-3-quarters','loading','man','menu','monitor','more',
                'number','percentage','paper-clip','pound','poweroff','pull-request','qrcode','reload','safety','robot','scan',
                'search','select','shake','share-alt','shopping-cart','solution','sync','table','team','to-top','trademark',
                'transaction','upload','user-add','user-delete','usergroup-add','user','usergroup-delete','wifi','woman',
            ],
        };
    },

    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.btnSize = 'default';
            this.widget.btnType = 'default';
            this.widget.confirmMessage = '';
        },
    },
    
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'button', 
            type : 'trigger',
            label : window.app.$t('panel.widgets.button.widgetName'), 
            image : require('./icon.png')
        };
    },
}
</script>