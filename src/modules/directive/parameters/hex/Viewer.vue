<template>
  <div class="border rounded viewer h-100 overflow-auto">
    <a-row>
      <!-- HEX Viewer -->
      <a-col :span="12" class="p-1 border-right" ref="hexViewer">
        <div
          :class="{byte:true,active:charIndex==activeIndex}" 
          v-for="(char,charIndex) in hexList" :key="charIndex"
          @mouseenter="actionSetActiveChar(charIndex)"
          @mouseleave="actionSetDeactiveChar()"
        >{{char}}</div>
      </a-col>
      
      <!-- ASCII Viewer -->
      <a-col :span="12" class="p-1" ref="asciiViewer" style="background: #f9f9f9;">
        <div 
          :class="{char:true,active:charIndex==activeIndex}" 
          v-for="(char,charIndex) in hexList" :key="charIndex"
          @mouseenter="actionSetActiveChar(charIndex)"
          @mouseleave="actionSetDeactiveChar()"
        >
          <span v-if="'20' != char">{{getChar(char)}}</span>
          <span v-else>&nbsp;</span>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
    name : 'ModuleDirectiveParameterHexViewer',
    props: {
        /**
         * @property {Executor}
         */
        executor:{},
    },
    data() {
        return {
            activeIndex : null,
        };
    },
    computed : {
        /**
         * hex list
         */
        hexList() {
            return this.getHexList();
        },
    },
    methods : {
        /**
         * get hex list
         */
        getHexList() {
            if ( null == this.executor ) {
                return [];
            }
            
            let paramBuilder = this.executor.getParamBuilder();
            // paramBuilder may be null if communicator failed to open.
            if ( null === paramBuilder ) {
                return [];
            }

            let buffer = paramBuilder.getRequestBuffer();
            let list = [];
            for ( let i=0; i<buffer.length; i++ ) {
                let byte = buffer[i].toString(16);
                if ( 1 == byte.length ) {
                    byte = `0${byte}`;
                }
                list.push(byte.toUpperCase());
            }
            return list;
        },

        /**
         * set active char
         * @param {Number}
         */
        actionSetActiveChar(charIndex) {
            this.activeIndex = charIndex;
        },

        /**
         * unset active char
         * @param {Number}
         */
        actionSetDeactiveChar() {
            this.activeIndex = null;
        },

        /**
         * get ascii char from byte string
         * @param {String} byte
         */
        getChar( byte ) {
            byte = parseInt(`0x${byte}`);
            if ( byte > 31 && byte < 127 ) {
                return String.fromCharCode(byte);
            }
            return '.';
        }
    }
}
</script>
<style scoped>
.viewer {background-color: #e9e9e9 !important;}
.byte {display: inline-block;text-align: center;padding: 5px;cursor: default;width: 32px;}
.byte.active {background: #c9c9c9;color: black;border-radius: 5px;text-align: center;}
.byte:hover {background: #c9c9c9;color: black;border-radius: 5px;text-align: center;}
.char {display: inline-block;text-align: center;padding: 5px;cursor: default;width: 32px;}
.char:hover {background: #c9c9c9;color: black;border-radius: 5px;text-align: center;}
.char.active {background: #c9c9c9;color: black;border-radius: 5px;text-align: center;}
</style>