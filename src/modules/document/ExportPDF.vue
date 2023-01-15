<template>
  <a-modal v-model="enable" :title="$t('document.exportAsPdf')">
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="$t('document.docOptionsAuthor')">
        <a-input v-model="docOptions.author" @change="actionDocOptionsUpdate"/>
      </a-form-item>
      <a-form-item :label="$t('document.docOptionsVersion')">
        <a-input v-model="docOptions.version" @change="actionDocOptionsUpdate"/>
      </a-form-item>
      <a-form-item :label="$t('document.docOptionsAuthorLogo')">
        <a-upload
          accept=".jpg"
          list-type="picture-card"
          :show-upload-list="false"
          :before-upload="() => false"
          @change="actionDocOptionAuthorLogoChanged"
        >
          <img v-if="null != docOptions.authorLogo" :src="docOptions.authorLogo" alt="avatar" class="w-100"/>
          <div v-else>
            <a-icon type="plus" />
          </div>
        </a-upload>
      </a-form-item>
      <a-form-item :label="$t('document.docOptionsProjectLogo')">
        <a-upload
          accept=".jpg"
          list-type="picture-card"
          :show-upload-list="false"
          :before-upload="() => false"
          @change="actionDocOptionProjectLogoChanged"
        >
          <img v-if="null != docOptions.projectLogo" :src="docOptions.projectLogo" alt="avatar" class="w-100" />
          <div v-else><a-icon type="plus" /></div>
        </a-upload>
      </a-form-item>
    </a-form>
    <template slot="footer">
      <a-button ref="btnStart" type="primary" @click="actionStart">{{$t('button.export')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
import { Buffer } from 'buffer';
import Common from '../../utils/Common.js'
import artTemplate from 'art-template/lib/template-web.js'
import { jsPDF } from "jspdf";
require('./fonts/simkai-normal.js');
require('jspdf-autotable');
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry';
import MdbProject from '../../models/MdbProject';
import MdbRuntimeVariable from '../../models/MdbRuntimeVariable';
import MyString from '../../utils/datatype/MyString.js';
export default {
    name : 'ExportPDF',
    data() {
        return {
            enable : false,
            project : null,
            entries : [],
            /**
             * @property {Object}
             */
            docWriter : {
                doc : null,
                cursorY : 10,
                currentPageNumber : 1,
                templateData : {},
                bookmarkMap : {},
                tocPageNum : null,
                contentPageStartNumer : null,
            },
            /**
             * options of pdf content
             * @property {Object}
             */
            docOptions : {
                version : '',
                author : '',
                authorLogo : null,
                projectLogo : null,
            },
            /**
             * pdf template
             * @property {Object}
             */
            template : {
                color : '#000000',
                fontSize : 16,
                paddingLeft : 15,
                pageMarginTop : 20,
                lineWidth : 180,
                content : [
                    /* cover page */
                    {element:'Text',content:'{{project.name}}',posX:105,posY:80,fontSize:48,textAlign:'center'},
                    {element:'Text',content:'{{"document.exportPdfSubTitle" | $t}}',posX:105,posY:100,fontSize:32,textAlign:'center'},
                    {element:'Text',content:'v{{option.version}}',posX:105,posY:110,fontSize:16,textAlign:'center'},
                    {element:'Text',content:'{{system.date()}}',posX:105,posY:280,fontSize:16,textAlign:'center'},
                    {element:'Text',content:'{{option.author}}',posX:105,posY:260,fontSize:16,textAlign:'center'},
                    {element:'Text',content:'{{"document.generatorMark" | $t}}',posX:105,posY:290,fontSize:16,color:'#b0b3b7',textAlign:'center'},
                    {element:'Image',content:'{{option.authorLogo}}',posX:97,posY:240,width:16,height:16},
                    {element:'Image',content:'{{option.projectLogo}}',posX:55,posY:130,width:100,height:100},
                    
                    /* introduction */
                    {element:'NewPage'},
                    {element:'Text',content:'{{project.name}}',posX:105,posY:40,fontSize:48,textAlign:'center'},
                    {element:'Text',content:'{{"document.exportPdfProjectIntroduction" | $t}}',posX:105,posY:70,fontSize:32,textAlign:'center'},
                    {element:'Text',content:'{{project.description}}',posX:105,posY:90,fontSize:32,textAlign:'center',color:'#707070'},
                    
                    /** Toc */
                    {element:'NewPage'},
                    {element:'Toc'},

                    /** directive list */
                    {element:'Directives', 
                        content : [
                            {element:'Text',content:'{{directive.name}}',fontSize:24},
                            {element:'Text',content:'{{directive.description}}',fontSize:20, marginTop:5},
                            {element:'Text',content:'{{"directive.endiannessLabel" | $t}} : {{directive.endianness | $dictName "ENDIANNESS"}}',fontSize:20,marginTop:5},
                            {element:'DirectiveAttributes', content : [
                                {element:'Text',content:'{{directiveAttribute.name}} : {{directiveAttribute.value}}',fontSize:20,marginTop:5}
                            ]},
                            {element:'DirectiveParameter', marginTop:5},
                            {element:'DirectiveResponse', marginTop:5},
                        ],
                    },
                ],
            },
        };
    },
    mounted() {
        this.init();
    },
    methods : {
        /**
         * init this component
         */
        async init() {
            this.project = null;
            let projectId = this.$store.getters.projectActivedId;
            this.project = await MdbProject.findOne(projectId);
        },

        /**
         * opem export modal
         */
        async open() {
            let optionVar = await MdbRuntimeVariable.getVarValue('document_export_pdf_options', '{}', this.project.id);
            this.docOptions = JSON.parse(optionVar);
            this.entries = await this.fetchAllEntriesByEntryParentId(MyString.uuidNil());
            this.enable = true;
        },

        /**
         * start exporting
         */
        async actionStart() {
            this.docWriter.doc = new jsPDF();
            this.docWriter.doc.setFont('simkai');
            this.docWriter.cursorY = this.template.pageMarginTop;
            this.docWriter.currentPageNumber = 1;
            this.docWriter.bookmarkMap = {};

            this.writeTemplateContents(this.template.content);
            this.writeToc();
            for ( let i=0; i<this.entries.length; i++ ) {
                this.writeBookmarkByEntry(this.entries[i]);
            }
            this.writePageNumber();
            
            let pdfData = this.docWriter.doc.output('arraybuffer');
            let pdfName = `${this.project.name}.pdf`;
            let pdfFilepath = window.dialog.showSaveDialogSync({ defaultPath: pdfName });
            if ( undefined == pdfFilepath ) {
                return;
            }

            await window.fs.promises.writeFile(pdfFilepath, Buffer.from(pdfData));
            this.enable = false;
            this.$message.success(this.$t('document.exportAsPdfSuccess',[pdfFilepath]), 5);
        },

        /**
         * write data to pdf file by given template contents
         * @param {Array} contents
         */
        writeTemplateContents( contents ) {
            for ( let i=0; i<contents.length; i++ ) {
                let writer = `writeElement${contents[i].element}`;
                this[writer](contents[i]);
            }
        },

        /**
         * write text element to pdf
         * @param {string|Object} element options for element or content of element
         * - content : {String} element content
         * - padding : {Number}
         * - marginTop : {Number}
         * - posY : {Number}
         * - posX : {Number}
         * - backgroundColor : {String}
         * - fontSize : {Number}
         * - color : {String}
         * - textAlign : {String}
         * - raw : {Boolean} default=false
         */
        writeElementText( element ) {
            if ( 'string' == typeof(element) ) {
                element = {content:element};
            }
            
            let doc = this.docWriter.doc;
            let text = element.content;
            if ( undefined == element.raw || false == element.raw ) {
                text = this.getTextContentFromTemplateString(element.content);
            }
            if ( 0 == text.length ) {
                return;
            }

            let options = Common.objCopy(element);
            options.align = options.textAlign || 'left',

            this.docWriter.cursorY += (options.marginTop || 0);
            let padding = options.padding || 0;
            let width = this.template.lineWidth - padding * 2;
            let cursorY = (options.posY || this.docWriter.cursorY) + padding;
            let cursorX = (options.posX || this.template.paddingLeft) + padding;
            let textDimensions = this.docWriter.doc.getTextDimensions(text);
            let lines = this.docWriter.doc.splitTextToSize(text, width);
            let linesHeight = textDimensions.h * lines.length;

            // background color
            if ( undefined != options.backgroundColor ) {
                this.docWriter.doc.setFillColor(options.backgroundColor);
                let bgX = cursorX - padding;
                switch ( options.align ) {
                case 'center' : bgX = bgX - textDimensions.w / 2 - 1; break;
                }
                let bgY = cursorY - textDimensions.h + 1 - padding;
                this.docWriter.doc.rect(bgX, bgY, this.template.lineWidth, linesHeight + padding * 2,'F');
            }

            doc.setFontSize(options.fontSize || this.template.fontSize);
            doc.setTextColor(options.color || this.template.color);
            for ( let i=0; i<lines.length; i++ ) {
                if ( cursorY > 290 ) {
                    this.docPageAdd();
                    cursorY = this.docWriter.cursorY;
                }
                this.docWriter.doc.text(lines[i], cursorX, cursorY, options);
                cursorY += textDimensions.h;
            }
            this.docWriter.cursorY = cursorY;
        },

        /**
         * write image element to pdf
         * @param {Object} element image options
         * - posX : {Number}
         * - posY : {Number}
         * - width : {Number}
         * - height : {Number}
         * - content : {String} data of image in base64 encoded
         */
        writeElementImage( element ) {
            let doc = this.docWriter.doc;
            let imageData = this.getTextContentFromTemplateString(element.content);
            if ( 0 == imageData.trim().length ) {
                return;
            }
            doc.addImage(imageData, 'JPEG', element.posX, element.posY, element.width, element.height);
        },

        /**
         * create a new page
         * @param {Object} element
         */
        writeElementNewPage( element ) {
            this.docPageAdd();
        },

        /**
         * write toc elements to pdf, it would mark toc page number, and draw toc 
         * at this page number as start page.
         * @param {Object} element
         */
        writeElementToc( element ) {
            this.docWriter.tocPageNum = this.docWriter.currentPageNumber;
        },

        /**
         * write directives elements to pdf.
         * @param {Object} element
         */
        writeElementDirectives( element ) {
            this.docWriter.contentPageStartNumer = this.docWriter.currentPageNumber;
            for ( let i=0; i<this.entries.length; i++ ) {
                this.writeDirectiveEntry(this.entries[i], element);
            }
        },

        /**
         * write entry content
         * @param {Object} entry
         * @param {Object} element
         */
        writeDirectiveEntry( entry, element ) {
            if ( 'folder' == entry.type ) {
                for ( let i=0; i<entry.children.length; i++ ) {
                    this.writeDirectiveEntry(entry.children[i], element);
                }
                return;
            }
            
            this.docWriter.bookmarkMap[entry.id] = this.docWriter.currentPageNumber;
            let directive = entry.targetModel;
            this.docWriter.templateData.directive = directive;
            this.writeTemplateContents(element.content);
            this.docWriter.cursorY += 20;
        },

        /**
         * write directives attributes elements
         * @param {Object} element
         */
        writeElementDirectiveAttributes( element ) {
            let directive = this.docWriter.templateData.directive;
            for ( let ai=0; ai<directive.attributes.length; ai++ ) {
                this.docWriter.templateData.directiveAttribute = directive.attributes[ai];
                this.writeTemplateContents(element.content);
            }
        },

        /**
         * write directives attributes elements
         * @param {Object} element
         */
        writeElementDirectiveParameter( element ) {
            let directive = this.docWriter.templateData.directive;
            this.docWriter.cursorY += (element.marginTop || 0);
            
            // file
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','FILE', directive.requestFormat) 
            && undefined != directive.requestContent.file ) {
                this.writeElementText(this.$t('document.requestParamsString'));
                this.writeElementText({
                    raw : true,
                    content : directive.requestContent.file,
                    marginTop : element.marginTop,
                    padding : 5,
                    color : '#989dad',
                    backgroundColor:'#f6f6f6'
                });
            }

            // text
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT', directive.requestFormat) 
            && undefined != directive.requestContent.text ) {
                this.writeElementText(this.$t('document.requestParamsString'));
                this.writeElementText({
                    raw : true,
                    content : directive.requestContent.text,
                    marginTop : element.marginTop,
                    padding : 5,
                    color : '#989dad',
                    backgroundColor:'#f6f6f6'
                });
            }

            // hex
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','HEX', directive.requestFormat) 
            && undefined != directive.requestContent.hex ) {
                this.writeElementText(this.$t('document.requestParamsHex'));
                this.writeElementText({
                    raw : true,
                    content : directive.requestContent.hex,
                    marginTop : element.marginTop,
                    padding : 5,
                    color : '#989dad',
                    backgroundColor:'#f6f6f6'
                });
            }
            
            // structual form
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','FORM', directive.requestFormat) 
            && undefined != directive.requestContent.form ) {
                this.writeElementText(this.$t('document.requestParams'));
                let prefixMap = {bin:'0b',oct:'0',dec:'',hex:'0x'};
                let tableBody = [];
                for ( let pi=0; pi<directive.requestContent.form.length; pi++ ) {
                    let row = [];
                    let param = directive.requestContent.form[pi];
                    row[0] = param.name;
                    row[1] = this.$dict.name('DIRECTIVE_PARAM_DATATYPE',param.type);
                    row[2] = param.desc;
                    let prefix = '';
                    if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',param.type,'unsigned', false) ) {
                        prefix = prefixMap[param.format];
                    }
                    row[3] = `${prefix}${param.value}`;
                    tableBody.push(row);
                }
                this.docTableWrite([
                    {content : this.$t('document.exportPdfParamName'), styles:{minCellWidth:40}}, 
                    {content : this.$t('document.exportPdfParamType'), styles:{minCellWidth:50}}, 
                    this.$t('document.exportPdfParamDesc'),
                    {content:this.$t('document.exportPdfParamExample'), styles:{minCellWidth:20}}
                ], tableBody);
            }
        },

        /**
         * write directives attributes elements
         * @param {Object} element
         */
        writeElementDirectiveResponse( element ) {
            let directive = this.docWriter.templateData.directive;
            if ( undefined != directive.responseFormatter.fields ) {
                this.writeElementText(this.$t('document.responseHeader'));
                let tableBody = [];
                for ( let fi=0; fi<directive.responseFormatter.fields.length; fi++ ) {
                    let row = [];
                    let param = directive.responseFormatter.fields[fi];
                    row[0] = param.name;
                    row[1] = this.$dict.name('DIRECTIVE_PARAM_DATATYPE',param.type);
                    row[2] = param.desc;
                    tableBody.push(row);
                }
                this.docTableWrite([
                    this.$t('document.exportPdfResponseName'), 
                    this.$t('document.exportPdfResponseType'), 
                    this.$t('document.exportPdfResponseDesc')
                ], tableBody);
            }
        },

        /**
         * add page to pdf writer
         */
        docPageAdd() {
            this.docWriter.doc.addPage();
            this.docWriter.currentPageNumber ++;
            this.docWriter.cursorY = this.template.pageMarginTop;
        },

        /**
         * write table data to current page.
         * @param {Array} column
         * @param {Array} body
         */
        docTableWrite( column, body ) {
            this.docWriter.doc.autoTable({
                head: [column],
                body: body,
                styles : { font : 'simkai' },
                startY : this.docWriter.cursorY,
            });
            let lastTable = this.docWriter.doc.lastAutoTable;
            this.docWriter.cursorY = parseInt(lastTable.finalY) + 10;
            this.docWriter.currentPageNumber = lastTable.startPageNumber + lastTable.pageCount - 1;
        },

        /**
         * generate TOC pages
         */
        writeToc() {
            if ( null == this.docWriter.tocPageNum ) {
                return;
            }

            let toc = [];
            toc.push({name: this.$t('document.tocLabel'), type:'title', level:0});
            for ( let i=0; i<this.entries.length; i++ ) {
                let items = this.writeTocEntryItemList(this.entries[i], 0);
                toc = toc.concat(items);
            }

            let doc = this.docWriter.doc;
            let itemCountPerPage = 26;
            let contentPageStartNumer = this.docWriter.tocPageNum;
            let tocPageCount = Math.ceil(toc.length / itemCountPerPage);
            
            let tocPageNum = contentPageStartNumer;
            while ( 0 < toc.length ) {
                doc.insertPage(tocPageNum);
                for ( let i=0; i<itemCountPerPage && 0 < toc.length; i++ ) {
                    let item = toc.shift();
                    let leftPadding = item.level * 8;
                    let x = 13 + leftPadding;
                    let y = this.template.pageMarginTop + 10 * i;
                    
                    let pageNumber = null;
                    let text = item.name;
                    if ( 'directive' == item.type ) {
                        let dotString = (new Array(69)).fill('.').join('');
                        text = `${item.name} ${dotString}`;
                        let lines = doc.splitTextToSize(text, 170 - leftPadding);
                        text = `${lines[0]} ${item.page - contentPageStartNumer + 1}`;
                        pageNumber = item.page + tocPageCount;
                    }

                    if ( null == pageNumber ) {
                        doc.text(text, x, y);
                    } else {
                        doc.textWithLink(text, x, y, { pageNumber: pageNumber});
                    }
                }
                tocPageNum ++;
            }

            this.refreshBookmarkMap(tocPageCount);
            this.docWriter.contentPageStartNumer = contentPageStartNumer + tocPageCount;
        },

        /**
         * get toc items
         * @returns {Array}
         */
        writeTocEntryItemList( entry, level ) {
            let list = [];
            let entrieItem = {};
            entrieItem.level = level;
            entrieItem.entry = entry;
            entrieItem.type = entry.type;
            entrieItem.name = entry.title;
            entrieItem.page = this.docWriter.bookmarkMap[entry.id];
            list.push(entrieItem);

            if ( 'folder' == entry.type ) {
                for ( let i=0; i<entry.children.length; i++ ) {
                    let subItems = this.writeTocEntryItemList(entry.children[i], level+1);
                    list = list.concat(subItems);
                }
            }
            return list;
        },

        /**
         * create bookmakr
         * @param {Object} entry
         * @param {Object} node
         */
        writeBookmarkByEntry( entry, node ) {
            let doc = this.docWriter.doc;

            if ( undefined == node ) {
                node = null;
            }
            let mark =  null;
            if ( 'directive' == entry.type ) {
                mark = {pageNumber:this.docWriter.bookmarkMap[entry.id]};
            }
            let subNode = doc.outline.add(node, entry.title, mark);

            if ( 'folder' == entry.type ) {
                for ( let i=0; i<entry.children.length; i++ ) {
                    this.writeBookmarkByEntry(entry.children[i], subNode);
                }
            }
        },

        /**
         * generate page number of current page
         */
        writePageNumber() {
            let doc = this.docWriter.doc;
            doc.setFontSize(12);
            doc.setTextColor('#d7d7d7');
            
            let startNum = this.docWriter.contentPageStartNumer;
            let contentPageCount = doc.internal.getNumberOfPages() - startNum + 1;
            for ( let i=0; i<contentPageCount; i++ ) {
                doc.setPage(i + startNum);
                doc.text(`${i+1} / ${contentPageCount}`, 185, 290);
            }
        },

        /**
         * get text content from template string
         * @param {String} template
         * @returns {String}
         */
        getTextContentFromTemplateString( template ) {
            let data = this.docWriter.templateData;
            data.project = this.project;
            data.option = this.docOptions;
            data.system = {
                date : () => {
                    let date = new Date();
                    return [
                        date.getFullYear(),
                        ((9 > date.getMonth()) ? `0${date.getMonth()+1}` : date.getMonth()+1 ),
                        ((10 > date.getDate()) ? `0${date.getDate()}` : date.getDate() ),
                    ].join('-');
                }
            };
            let $this = this;
            artTemplate.defaults.imports.$t = function (key) {
                return $this.$t(key);
            };
            artTemplate.defaults.imports.$dictName = function (key, group) {
                return $this.$dict.name(group, key);
            };

            return artTemplate.render(template, data);
        },
        
        /**
         * refresh book mark page number map
         * @param {Number} offset
         */
        refreshBookmarkMap( offset ) {
            for ( let id in this.docWriter.bookmarkMap ) {
                this.docWriter.bookmarkMap[id] += offset;
            }
        },

        /**
         * fetch all directive entry by given parent id
         * @param {String} parentId
         * @returns {Array}
         */
        async fetchAllEntriesByEntryParentId( parentId ) {
            let entries = await MdbDirectiveEntry.findAll({
                project_id: this.project.id,
                parent_id : parentId,
            });

            let list = [];
            for ( let i=0; i<entries.length; i++ ) {
                let item = entries[i].getData();
                let target = await entries[i].getTargetModel();
                item.targetModel = target;
                item.title = target.name;
                if ( 'folder' == item.type ) {
                    item.children = await this.fetchAllEntriesByEntryParentId(item.id);
                }
                list.push(item);
            }

            list.sort(function( itemA, itemB ) {
                if ( itemA.type == itemB.type ) {
                    return itemA.title.localeCompare(itemB.title);
                } else {
                    return 'folder' == itemA.type ? -1 : 1;
                }
            });
            return list;
        },

        /**
         * force update the component view.
         */
        actionDocOptionsUpdate() {
            let options = JSON.stringify(this.docOptions);
            MdbRuntimeVariable.setVarValue('document_export_pdf_options',options,this.project.id);
            this.$forceUpdate();
        },

        /**
         * event handler on doc option author logo changed
         * @param {Event} info
         */
        actionDocOptionAuthorLogoChanged( info ) {
            let $this = this;
            let reader = new FileReader();
            reader.addEventListener('load', () => {
                $this.docOptions.authorLogo = reader.result
                $this.actionDocOptionsUpdate();
            });
            reader.readAsDataURL(info.file);
        },

        /**
         * event handler on doc option project logo changed
         * @param {Event} info
         */
        actionDocOptionProjectLogoChanged( info ) {
            let $this = this;
            let reader = new FileReader();
            reader.addEventListener('load', () => {
                $this.docOptions.projectLogo = reader.result
                $this.actionDocOptionsUpdate();
            });
            reader.readAsDataURL(info.file);
        },
    },
}
</script>