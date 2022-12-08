<template>
  <a-row class="directive-response-hex-entry">
    <!-- address -->
    <a-col :span="2" class="border-right bg-light">
      <div class="line-addr">{{renderAddressName(source.address)}}</div>
    </a-col>
    
    <a-col :span="22" class="d-flex flex-dir-row">
      <!-- hex -->
      <div class="line-hex border-right">
        <span v-for="(byte, index) in hexList" :key="index" 
          class="directive-response-hex-byte" 
          :data-line="source.no" 
          :data-col="index"
        >{{byte}}</span>
      </div>
      
      <!-- text -->
      <div class="line-text">
        <span v-for="(char,index) in charList" :key="index" 
          class="directive-response-hex-byte" 
          :data-line="source.no" 
          :data-col="index"
          v-html="char"
        ></span>
      </div>
    </a-col>
  </a-row>
</template>
<script>
export default {
    name: 'BlockResponseViewerHexLine',
    props: {
      /**
       * index of data entry item
       * @property {Number}
       */
      index: {type: Number},
      /**
       * data entry object
       * @property {Object}
       */
      source: {type: Object,default () {return {}}},
      /**
       * 
       */
      lineNumberRadix : {type:String,default:'hex'},
    },
    data() {
        return {
            hexList : [],
            charList : [],
        };
    },
    created() {
        this.refreshContent();
    },
    methods : {
        /**
         * refresh render content
         */
        refreshContent() {
            this.hexList = [];
            this.charList = [];
            
            // real bytes and chars
            for ( let i=0; i<this.source.data.length; i++ ) {
                this.hexList.push(this.renderHex(this.source.data[i]));
                this.charList.push(this.renderChar(this.source.data[i]));
            }

            // placeholders
            let blankLen = this.source.colSize - this.source.data.length;
            for ( let i=0; i<blankLen; i++ ) {
                this.hexList.push('--');
                this.charList.push('.');
            }
        },

        /**
         * convert byte number to hex string 
         * @returns {String}
         */
        renderAddressName( address ) {
            address = `${address}`;
            if ( 'hex' === this.lineNumberRadix ) {
                address = BigInt(address);
                address = address.toString(16);
            }
            return address.padStart(10, "0").toUpperCase();
        },

        /**
         * convert byte number to hex string 
         * @returns {String}
         */
        renderHex( byte ) {
            return byte.toString(16).toUpperCase().padStart(2,'0');
        },

        /**
         * convert byte number to hex string 
         * @returns {String}
         */
        renderChar( byte ) {
            let char = null;
            if ( 0x20 == byte ) {
                char = '&nbsp;';
            } else  if ( byte > 31 && byte < 127 ) {
                char = String.fromCharCode(byte);
            } else {
                char = '.';
            }
            return char;
        }
    },
}
</script>
<style scoped>
.line-addr {text-align: right;padding: 5px;cursor: default;width: 100%;}
.line-text {white-space: pre !important;padding: 5px;}
.line-hex {white-space: pre !important;padding: 5px;}
</style>