<template>
  <a-modal v-model="enable" :title="$t('document.exportAsMarkdown')">
    <a-progress :percent="progressPercent" />
    <template slot="footer">
      <a-button ref="btnStart" type="primary" @click="actionStart">{{$t('button.export')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
import MdbDirective from '../../models/MdbDirective';
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry';
import MdbProject from '../../models/MdbProject';
export default {
    name : 'DocumentExportMarkdown',
    data() {
        return {
            enable : false,
            filepath : null,
            progressPercent : 0,
        };
    },
    methods : {
        /**
         * open export modal
         */
        async start() {
            this.enable = true;
        },

        /**
         * event handle on start button clicked.
         */
        async actionStart() {
            await this.doExport();
        },

        /**
         * execute exporting 
         */
        async doExport() {
            let projectId = this.$store.getters.projectActivedId;
            let entries = await MdbDirectiveEntry.findAll({
                project_id:projectId,
                type:'directive'
            });

            let content = [];
            content.push('[TOC]');
            for ( let i=0; i<entries.length; i++ ) {
                this.progressPercent = parseInt((i/entries.length) * 100);
                let directive = await MdbDirective.findOne(entries[i].target);
                content.push(`# ${directive.name}`);
                content.push('');
                if ( 0 < directive.description.trim().length ) {
                    content.push(directive.description);
                }
                
                let attrs = [];
                for ( let ai=0; ai<directive.attributes.length; ai++ ) {
                    attrs.push(`\`${directive.attributes[ai].name} : ${directive.attributes[ai].value}\``);
                }
                content.push(attrs.join(' '));
                this.generateParameters(content, directive);

                // response format
                if ( undefined != directive.responseFormatter.fields ) {
                    content.push('');
                    content.push(`**${this.$t('document.responseHeader')}：**`);
                    for ( let fi=0; fi<directive.responseFormatter.fields.length; fi++ ) {
                        let param = directive.responseFormatter.fields[fi];
                        let name = param.name;
                        if ( 0 == name.trim().length ) {
                            name = '$' + fi;
                        }
                        content.push(`- \`${name}\` : [ ${this.$dict.name('DIRECTIVE_PARAM_DATATYPE',param.type)} ]`);
                        content.push(`  ${param.desc}`);
                    }
                }

                content.push('');
                content.push('');
                content.push('');
                content.push('');
            }

            this.enable = false;
            this.progressPercent = 100;
            let project = await MdbProject.findOne(projectId);

            let name = `${project.name}.md`;
            this.filepath = window.dialog.showSaveDialogSync({ defaultPath: name });
            if ( undefined == this.filepath ) {
                return;
            }
            await window.fs.promises.writeFile(this.filepath, content.join("\n"));
            this.$message.success(this.$t('messages.fileSaveSuccess'));
        },

        /** 
         * generate parameter doc area
         * @param {MdbDirective} directive
         */
        generateParameters(content, directive) {
            content.push(`**${this.$t('document.requestParams')} [${this.$t(`directive.parameter.${directive.requestFormat}.name`)}]**`);

            // form
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','FORM', directive.requestFormat) ) {
                if ( undefined == directive.requestContent.form || 0 == directive.requestContent.form.length ) {
                    content.push('```\n' + this.$t('document.parameterEmpty') +'\n```');
                } else {
                    for ( let pi=0; pi<directive.requestContent.form.length; pi++ ) {
                        let param = directive.requestContent.form[pi];
                        let name = param.name;
                        if ( 0 === name.trim().length ) {
                            name = '$' + pi;
                        }
                        content.push(`- \`${name}\` : [ ${this.$dict.name('DIRECTIVE_PARAM_DATATYPE',param.type)} ]`);
                        content.push(`  ${param.desc}  ${this.$t('document.requestParamExample')}：${param.value}`);
                    }
                }
                return;
            }

            // hex
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','HEX', directive.requestFormat) ) {
                if ( undefined == directive.requestContent.hex ) {
                    content.push('```\n' + this.$t('document.parameterEmpty') +'\n```');
                } else {
                    let pcontent = directive.requestContent.hex.toUpperCase().replace(/../g, function(item){ return `${item} ` });
                    if ( 0 == pcontent.trim().length ) {
                        pcontent = this.$t('document.parameterEmpty');
                    }
                    content.push('```');
                    content.push(pcontent);
                    content.push('```');
                }
                return;
            }

            // string
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT', directive.requestFormat) ) {
                debugger
                if ( undefined == directive.requestContent.text || 0 == directive.requestContent.text.trim().length ) {
                    content.push('```\n' + this.$t('document.parameterEmpty') +'\n```');
                } else {
                    let pcontent = directive.requestContent.text;
                    if ( 0 == pcontent.trim().length ) {
                        pcontent = this.$t('document.parameterEmpty');
                    }
                    content.push('```');
                    content.push(pcontent);
                    content.push('```');
                }
            }

            // file
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','file', directive.requestFormat) ) {
                if ( undefined == directive.requestContent.file ) {
                    content.push('```\n' + this.$t('document.parameterEmpty') +'\n```');
                } else {
                    let pcontent = directive.requestContent.file;
                    if ( 0 == pcontent.trim().length ) {
                        pcontent = this.$t('document.parameterEmpty');
                    }
                    content.push('```');
                    content.push(pcontent);
                    content.push('```');
                }
                return;
            }
        }
    },
}
</script>