<template>
  <div>
    <a-modal 
      ref="modalEditor"
      v-if="enable" 
      v-model="enable" 
      :title="$t('directive.entry.editTitle')" 
      :okText="$t('button.save')" 
      :cancelText="$t('button.cancel')"
      @ok="actionSaveFolder" 
      @cancel="actionCancel"
    >
      <a-form :label-col="{ span: 4 }"  :wrapper-col="{ span: 18 }">
        <a-form-item :label="$t('directive.entry.formFieldName')">
          <a-input ref="inputName" v-model="folder.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import MdbDirectiveEntry from '@/models/MdbDirectiveEntry.js'
import MdbDirectiveFolder from '@/models/MdbDirectiveFolder.js'
export default {
    name : 'ModalCollectionEdit',
    data() {
        return {
            enable : false,
            id : null,
            parentEntry : null,
            folder : null,
            actResolve : null,
            actReject : null,
        };
    },
    methods : {
        /**
         * create new folder
         * @public
         * @param {String} parentEntryId
         * @returns {Promise}
         */
        create( parentEntryId ) {
            let $this = this;
            return new Promise((resolve, reject) => {
                $this.id = null;
                $this.parentEntry = parentEntryId;
                $this.folder = new MdbDirectiveFolder();
                $this.enable = true;
                $this.actResolve = resolve;
                $this.actReject = reject;
            });
        },

        /**
         * update given folder
         * @public 
         * @param {MdbDirectiveFolder} folder
         * @returns {Promise}
         */
        update( folder ) {
            let $this = this;
            return new Promise(( resolve, reject) => {
                $this.id = folder.id;
                $this.folder = folder;
                $this.enable = true;
                $this.actResolve = resolve;
                $this.actReject = reject;
            });
        },

        /**
         * event handler to save folder, if the folder is new 
         * the entry to this folder would be created
         */
        async actionSaveFolder() {
            let projectId = this.$store.getters.projectActivedId;
            this.folder.projectId = projectId;
            await this.folder.save();

            let newEntry = null;
            if ( null == this.id ) {
                newEntry = new MdbDirectiveEntry();
                newEntry.projectId = projectId;
                newEntry.type = 'folder';
                newEntry.target = this.folder.id;
                newEntry.parentId = this.parentEntry;
                await newEntry.save();
            }

            this.enable = false;
            this.actResolve(newEntry);
        },

        /**
         * event handler to canncel edition.
         */
        actionCancel() {
            this.actReject(Error('user canceled folder edit'));
        },
    },
}
</script>