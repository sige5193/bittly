<template>
  <a-modal v-if="enable" v-model="enable" :bodyStyle="{padding:0}" :width="800" :title="$t('plugin.manager')">
    <a-table :columns="columns" :data-source="data" size="small" :pagination="false">
      <div slot="name" slot-scope="text">{{ text }}</div>
      <div slot="operations" slot-scope="text,record">
        <a-button v-if="record.configurable" size="small" class="mr-1" @click="actionSetting(record.id)"><a-icon type="setting" /></a-button>
        <a-button size="small" @click="actionDelete(record.id)"><a-icon type="delete" /></a-button>
      </div>
    </a-table>
    
    <template slot="footer">
      <a-row>
        <a-col :span="12" class="text-left">
          <a-upload accept=".zip"
            :directory="false" :multiple="false" :showUploadList="false"
            :beforeUpload="() => false" @change="actionInstallPackageSelected"
          ><a-button type="primary">{{$t('plugin.btnInstall')}}</a-button></a-upload>
        </a-col>
        <a-col :span="12">
          <a-button @click="actionCancel">{{$t('button.cancel')}}</a-button>
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script>
import Manager from './Manager';
export default {
    name : 'PluginManagerModal',
    data() {
        return {
            enable : false,
            columns : [
                {title:this.$t('plugin.name'),dataIndex:'name',key:'name',width:200,scopedSlots:{customRender:'name'}},
                {title:this.$t('plugin.version'),dataIndex:'version',key:'version',width:80},
                {title:this.$t('plugin.description'),dataIndex:'desc',key:'desc',ellipsis:true},
                {title:this.$t('plugin.operations'),key:'operations',width:100,align:'right',scopedSlots:{customRender:'operations'}}
            ],
            data : [],
        };
    },
    methods : {
        /**
         * refresh plugin list.
         */
        refresh() {
            this.data = [];
            let plugins = Manager.getManager().plugins;
            for ( let id in plugins ) {
                let item = {};
                item.key = id;
                item.id = id;
                item.name = plugins[id].manifest.name;
                item.version = plugins[id].manifest.version;
                item.desc = plugins[id].manifest.description;
                item.configurable = plugins[id].manifest.configurable;
                this.data.push(item);
            }
        },

        /**
         * delete plugin by given id
         */
        actionDelete(id) {
            this.$confirm({
                title: this.$t('plugin.uninstallTitle'),
                content : this.$t('plugin.uninstallConfirm'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                onOk() {
                    Manager.getManager().pluginDeleteById(id);
                },
            });
        },

        /**
         * @param {Object} info
         */
        async actionInstallPackageSelected( info ) {
            let zipData = await this.fileReadAsArrayBuffer(info.file);

            try {
                await Manager.getManager().pluginInstallByFileData(zipData);
            } catch ( e ) {
                this.$message.error(this.$t('plugin.installFailed', [e.message]));
                return;
            }

            this.$success({
                title: this.$t('plugin.installSuccess'),
                content: this.$t('plugin.installSuccessMessage'),
                okText : this.$t('button.ok'),
                onOk() {
                    window.remote.app.relaunch();
                    window.remote.app.quit();
                },
            });
        },

        /**
         * read file content
         */
        fileReadAsArrayBuffer( file ) {
            return new Promise(( resolve ) => {
                let fileReader = new FileReader();
                fileReader.addEventListener('load', () => {
                    resolve(fileReader.result);
                });
                fileReader.readAsArrayBuffer(file);
            });
        },

        /**
         * open management modal
         */
        open () {
            if ( ! this.$env.isPluginsAvailable ) {
                return this.$env.errorActionNotSupported();
            }
            this.refresh();
            this.enable = true;
        },

        /**
         * 
         */
        actionCancel() {
            this.enable = false;
        }
    },
}
</script>