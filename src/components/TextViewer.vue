<template>
  <div v-html="renderContent" class="white-space-pre border rounded p-1 pre-content"></div>
</template>
<script>
export default {
    name : 'TextViewer',
    props : {
        /**
         * content of text
         * @property String
         */
        content : {},
        /**
         * @property {Boolean}
         */
        showBlankChars : {type:Boolean,default:false},
    },
    computed : {
        /**
         * get render content
         * @returns {String}
         */
        renderContent() {
            let content = this.content.toString();
            let chars = [];
            let blankChars = {10:'\\n',13:'\\r',9:'\\t'};
            for ( let i=0; i<content.length; i++ ) {
                let char = content[i];
                let code = content[i].charCodeAt();
                if ( this.showBlankChars && undefined != blankChars[code] ) {
                    char = `<span class="text-viewer-blank-char">${blankChars[code]}</span>${char}`;
                }
                chars.push(char);
            }
            return chars.join('');
        }
    },
}
</script>
<style>
.text-viewer-blank-char {
    background: #454545;
    color: white;
    font-size: 0.8em;
    display: inline-block;
    padding: 0 3px;
    border-radius: 3px;
    margin-left: 2px;
}
</style>