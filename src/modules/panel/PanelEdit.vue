<template>
  <div class="h-100 d-flex flex-dir-column">
    <a-page-header class="border-bottom mb-2 pl-0 pr-0">
      <template slot="title">
        <a-input 
          ref="inputName"
          v-model="panel.name" 
          :placeholder="$t('panel.editMode.panelNamePlaceholder')" 
          @input="actionForceUpdate"
        />
      </template>
      <template slot="extra">
        <a-button-group class="mr-2">
          <a-button ref="btnToggleWidgetDrawer" @click="actionDrawerToggle('widget')">{{$t('panel.editMode.widgetPanelTitle')}}</a-button>
          <a-button ref="btnToggleVariableDrawer" @click="actionDrawerToggle('variable')">{{$t('panel.editMode.variablePanelTitle')}}</a-button>
        </a-button-group>

        <a-button-group>
          <a-button ref="btnDelete" @click="actionPanelDelete">{{$t('button.delete')}}</a-button>
          <a-button 
            ref="btnSave" 
            :disabled="!isChanged"
            @click="actionPanelSave"
          ><a-badge v-if="isChanged" status="processing" class="mr-1"/> {{$t('button.save')}}</a-button>
        </a-button-group>

        <!-- model switch -->
        <a-radio-group button-style="solid" value="edit" @change="actionSwitchMode">
          <a-radio-button value="edit">{{$t('panel.mode.edit')}}</a-radio-button>
          <a-radio-button value="run">{{$t('panel.mode.run')}}</a-radio-button>
        </a-radio-group>
      </template>
    </a-page-header>

    <div class="position-relative flex-grow">
      <!-- widget drawer -->
      <a-drawer placement="right"
        :title="$t('panel.editMode.widgetPanelTitle')"
        :visible="widgetDrawerEnable"
        :get-container="false"
        :wrap-style="{position:'absolute'}"
        :headerStyle="{display:'none'}"
        :body-style="{padding:0,height:'100%',overflow: 'auto'}"
        @close="widgetDrawerEnable = false"
      >
        <a-row class="widget-list">
          <a-col :span="24" v-for="(widget,index) in widgets" :key="index">
            <div class="widget pl-1" draggable="true" @dragstart="actionWidgetDragStart($event, index)">
              <img :src="widget.image">
              <span>{{widget.label}}</span>
            </div>
          </a-col>
        </a-row>
      </a-drawer>
      
      <!-- variable drawer -->
      <a-drawer placement="right"
        :title="$t('panel.editMode.variablePanelTitle')"
        :visible="variableDrawerEnable"
        :get-container="false"
        :wrap-style="{position:'absolute'}"
        :headerStyle="{display:'none'}"
        :body-style="{padding:0,height:'100%',overflow: 'auto'}"
        @close="variableDrawerEnable = false"
      >
        <div class="h-100 d-flex flex-dir-column">
          <variable-manager ref="variableEditor" :panel="panel"></variable-manager>
          <a-button ref="btnVariableAdd" size="small" @click="actionVariableAdd"><a-icon type="plus" /></a-button>
        </div>
      </a-drawer>

      <!-- widget edit panel -->
      <div ref="editor" class="editor-widget-panel" 
        @dragover="actionEditorWidgetDragOver($event)" 
        @drop="actionEditorWidgetDrop($event)"
      >
        <a-dropdown :trigger="['contextmenu']" v-for="(widget,index) in panel.widgets" :key="widget.key" >
          <vue-draggable-resizable w="auto" h="auto" 
            :x="widget.pos.x" :y="widget.pos.y" :z="widget.zindex"
            :grid="[5,5]" 
            :parent="true" 
            :resizable="isWidgetResizable(widget.name)"
            @dragstop="(x, y) => actionWidgetMoveDragStop(x, y, index)"
            @resizestop="(x, y, width, height) => actionWidgetResizeStop(x, y, width, height, index)"
          >
            <div @dblclick="actionWidgetDoubleClick($event, index)">
              <custom-widget v-if="undefined !== widget.isCustom && true == widget.isCustom" ref="widgets"
                :name="panel.widgets[index].name"
                v-model="panel.widgets[index]"
                :panel="panel"
                @panel-change="onPanelChagned"
              />
              <component v-else ref="widgets" 
                v-model="panel.widgets[index]"
                :is="`widget-${widget.name}`" 
                :panel="panel" 
                @panel-change="onPanelChagned"
              />
            </div>
          </vue-draggable-resizable>
          <a-menu slot="overlay" @click="({ key: menuKey }) => actionWidgetContextMenuItemClicked(menuKey, index)">
            <a-menu-item key="Setting"><a-icon type="setting" /> {{$t('button.setting')}}</a-menu-item>
            <a-menu-item key="Delete"><a-icon type="delete" /> {{$t('button.delete')}}</a-menu-item>
            <a-menu-divider />
            <a-menu-item key="ZIndex" disabled><a-icon type="border-verticle" />{{$t('panel.editMode.widgetZindex')}} : {{widget.zindex}}</a-menu-item>
            <a-menu-item key="MoveToFront"><a-icon type="block" />{{$t('panel.editMode.widgetMoveFrontOneLayer')}}</a-menu-item>
            <a-menu-item key="MoveToBack"><a-icon type="block" :rotate="90" />{{$t('panel.editMode.widgetMoveBackOneLayer')}}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import CustomWidget from './widgets/CustomWidgetEdit.vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
import VariableManager from './variable/Manager.vue'
import WidgetRegisterMixin from './widgets/WidgetEditRegisterMixin.js' 
import Common from '../../utils/Common.js'
export default {
    name : 'PanelEdit',
    mixins : [WidgetRegisterMixin],
    components : {
        'variable-manager' : VariableManager,
        'vue-draggable-resizable' : VueDraggableResizable,
        'custom-widget' : CustomWidget,
    },
    props : {
        /**
         * MdbPanel instance model to edit
         * @property {MdbPanel}
         */
        value : {},
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            isChanged : false,
            /**
             * @property {MdbPanel}
             */
            panel : null,
            /**
             * @property {String}
             */
            toolboxActiveKey : 'widget',
            /**
             * indicate whether widget drawer is open
             * @property {Boolean}
             */
            widgetDrawerEnable : false,
            /**
             * indicate whether variable drawer is open
             * @property {Boolean}
             */
            variableDrawerEnable : false,
        };
    },
    watch : {
        value () {
            this.initVModel();
        },
    },
    created() {
        this.$eventBus.$emit('app-panel-edit-init', this);
        this.initVModel();
    },
    destroyed() {
        this.panel.off('change', this.onPanelChagned);
    },
    methods : {
        /**
         * init v-model
         */
        initVModel() {
            this.panel = this.value.clone();
            this.panel.on('change', this.onPanelChagned);
            for ( let i=0; i<this.panel.widgets.length; i++ ) {
                if (undefined == this.panel.widgets[i].key ) {
                    this.panel.widgets[i].key = `${this.panel.id}:${i}`;
                }
            }
        },

        /**
         * event handler on panel data changed
         */
        onPanelChagned() {
            this.isChanged = true;
        },

        /**
         * event handler for widget drag over
         * @param {Event} event
         */
        actionEditorWidgetDragOver(event) {
            event.preventDefault();
        },

        /**
         * event handler on editarea drop event
         * @param {Event} event
         */
        actionEditorWidgetDrop(event) {
            let action = event.dataTransfer.getData("action");
            let handler = `editorWidgetDropHandler${action}`;
            this[handler](event);
        },

        /**
         * event handler for new widget droped in.
         * @param {Event} event
         */
        async editorWidgetDropHandlerNewWidget(event) {
            let widgetIndex = event.dataTransfer.getData("widgetIndex");
            let editorPos = this.$refs.editor.getBoundingClientRect();
            let widget = Common.objCopy(this.widgets[widgetIndex]);
            delete widget.image;
            widget.key = (new Date()).getTime();
            widget.pos = {
                x : Math.floor(event.clientX - editorPos.x), 
                y : Math.floor(event.clientY - editorPos.y),
            };
            widget.zindex = 1000;
            this.panel.widgets.push(widget);
            this.onPanelChagned();

            await this.$nextTick();
            let lastWidgetIndex = this.panel.widgets.length - 1;
            this.$refs.widgets[lastWidgetIndex].setting();
        },

        /**
         * @property {Number} index
         * @property {Object} attrs
         */
        widgetUpdate( index, attrs ) {
            let widget = Common.objCopy(this.panel.widgets[index]);
            for ( let key in attrs ) {
                widget[key] = attrs[key];
            }
            this.panel.widgets[index] = widget;
            this.onPanelChagned();
            this.$forceUpdate();
        },

        /**
         * event handler on widget move stoped.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} index
         */
        actionWidgetMoveDragStop(x, y, index) {
            this.widgetUpdate(index, {
                pos : {x : x, y : y + 2}
            });
        },

        /**
         * event handler on widget resize stoped.
         * @param {Number} x
         * @param {Number} y
         * @param {Number} width
         * @param {Number} height
         * @param {Number} index
         */
        actionWidgetResizeStop(x, y, width, height, index) {
            this.widgetUpdate(index, {
                pos : {x : x, y : y+2},
                sizeHeight : Math.round(height / 10) * 10,
                sizeWidth : Math.round(width / 10) * 10,
            });
            this.$nextTick(() => this.$refs.widgets[index].actionForceUpdate());
        },

        /**
         * event handler on widget db clicked.
         */
        actionWidgetDoubleClick(event, index){
            this.$refs.widgets[index].setting();
        },

        /**
         * event handler on widget context menu item clicked.
         * @param {String} event
         * @param {Number} index
         */
        actionWidgetContextMenuItemClicked( action, index ) {
            let handler = `widgetContextMenuItemClickHandle${action}`;
            this[handler](index);
        },

        /**
         * enable widget setting modal
         * @param {Number} index
         */
        widgetContextMenuItemClickHandleSetting(index) {
            this.$refs.widgets[index].setting();
        },

        /**
         * enable widget setting modal
         * @param {Number} index
         */
        widgetContextMenuItemClickHandleMoveToFront(index) {
            let zindex = this.panel.widgets[index].zindex || 0;
            zindex ++;
            this.widgetUpdate(index, {zindex : zindex});
        },

        /**
         * enable widget setting modal
         * @param {Number} index
         */
        widgetContextMenuItemClickHandleMoveToBack(index) {
            let zindex = this.panel.widgets[index].zindex || 0;
            if ( 0 >= zindex ) {
                return;
            }
            zindex --;
            this.widgetUpdate(index, {zindex : zindex});
        },

        /**
         * delete wideget by given index
         * @param {Number} index
         */
        widgetContextMenuItemClickHandleDelete(index) {
            let $this = this;
            let deleteHandler = () => {
                $this.panel.widgets.splice(index,1);
                $this.onPanelChagned();
                $this.$forceUpdate();
            };

            this.$confirm({
                title: this.$t('messages.dialogTitle.tip'),
                content: this.$t('panel.editMode.widgetDeleteConfirm'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'), 
                onOk : deleteHandler,
            });
        },

        /**
         * toggle drawer by given name
         * @property {String} name
         */
        actionDrawerToggle( name ) {
            let drawerPropertyName = `${name}DrawerEnable`;
            let drawerStatus = this[drawerPropertyName];

            this.widgetDrawerEnable = false;
            this.variableDrawerEnable = false;

            this[drawerPropertyName] = !drawerStatus;
        },

        /**
         * move widget start
         * @param {Event} event
         * @param {Number} index
         */
        actionWidgetDragStart(event, index) {
            this.widgetDrawerEnable = false;
            event.dataTransfer.setData("action","NewWidget");
            event.dataTransfer.setData("widgetIndex", index);
        },

        /**
         * variable create new
         */
        actionVariableAdd() {
            this.$refs.variableEditor.actionVariableAdd();
        },

        /**
         * save panel data
         * @event
         */
        async actionPanelSave() {
            this.value.setAttributes(this.panel.getData());
            if ( ! await this.value.save() ) {
                this.$message.error(this.$t('panel.editMode.panelSaveFailed'));
                return;
            }
            this.$message.success(this.$t('panel.editMode.panelSaved'));
            this.isChanged = false;
        },

        /**
         * delete this panel
         * @event
         */
        async actionPanelDelete() {
            let $this = this;
            this.$confirm({
                title: this.$t('panel.editMode.panelDeleteConfirmTitle'),
                content: this.$t('panel.editMode.panelDeleteConfirmContent'),
                okText: this.$t('button.ok'),
                cancelText: this.$t('button.cancel'),
                okType: 'danger',
                async onOk() {
                    await $this.panel.delete();
                    $this.$emit('panel-delete');
                    $this.$message.success($this.$t('panel.editMode.panelDeleteSuccess'));
                },
            });
        },

        /**
         * switch to run mode, if panel has changed, alert an message to 
         * save 
         */
        actionSwitchMode() {
            if ( !this.isChanged ) {
                this.$emit('switch-mode-to-run');
                return;
            }
            let $this = this;
            this.$confirm({
                title: this.$t('panel.editMode.panelChangedSaveConfirmTitle'),
                content: this.$t('panel.editMode.panelChangedSaveConfirmContent'),
                okText: this.$t('button.ok'),
                cancelText: this.$t('button.cancel'),
                okType: 'primary',
                async onOk() {
                    await $this.actionPanelSave();
                    $this.$emit('switch-mode-to-run');
                },
                onCancel() {
                    $this.$emit('switch-mode-to-run');
                },
            });
        },

        /**
         * update view
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },
    },
}
</script>
<style>
#panel-edit-toolbox-tabs .ant-tabs-content {flex-grow: 1;height: 0;}
</style>
<style scoped>
.widget {border: solid 1px #eeeeee; border-left: none; border-right: none; user-select: none;}
.widget > img {width: 60px;height:32px;}
.widget > span {color: #919191;padding-left: 15px;}
.widget:hover {background: #ededed;}
.editor-widget-panel {
  height: 100%;
  padding:0px;
  border: solid 1px #d3d3d3;
  position: relative;
  overflow: hidden;
  background: linear-gradient(-90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 5px 5px, 
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 5px 5px,
              linear-gradient(#f5f5f5, #f5f5f5);
}
</style>