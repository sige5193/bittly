<template>
  <div class="p-2">
    <a-radio-group v-model="format" button-style="solid" @change="actionFormatChange">
      <a-radio-button value="hex">Hex</a-radio-button>
      <a-radio-button value="string">String</a-radio-button>
    </a-radio-group>
    <a-textarea class="mt-2" :rows="4" @change="actionRecalculate" v-model="content"/>
    <a-select class="mt-2" style="width: 120px" v-model="calType">
      <a-select-option value="ParityCheck">{{$t('app.toolCalculator.dataValidationParityChecking')}}</a-select-option>
      <a-select-option value="Sum">{{$t('app.toolCalculator.dataValidationSumCheck')}}</a-select-option>
      <a-select-option value="CRC">CRC</a-select-option>
    </a-select>

    <div class="bg-white mt-2 border p-2">
      <a-row v-if="calType == 'ParityCheck'" :gutter="24" style="line-height: 32px;">
        <a-col :span="10"><span>{{$t('app.toolCalculator.dataValidationEvenParityChecking')}}</span></a-col>
        <a-col :span="14"><a-input :value="evenParity" /></a-col>
      </a-row>
      <a-row v-if="calType == 'ParityCheck'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>{{$t('app.toolCalculator.dataValidationOddParityChecking')}}</span></a-col>
        <a-col :span="14"><a-input :value="oddParity" /></a-col>
      </a-row>
      <a-row v-if="calType == 'Sum'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>{{$t('app.toolCalculator.dataValidationSumCheck')}}</span></a-col>
        <a-col :span="14"><a-input :value="sum" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC32</span></a-col>
        <a-col :span="14"><a-input :value="crc32" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC16 Modbus</span></a-col>
        <a-col :span="14"><a-input :value="crc16modbus" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC16 CCITT</span></a-col>
        <a-col :span="14"><a-input :value="crc16ccitt" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC1</span></a-col>
        <a-col :span="14"><a-input :value="crc1" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC8</span></a-col>
        <a-col :span="14"><a-input :value="crc8" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC8 1 Wire</span></a-col>
        <a-col :span="14"><a-input :value="crc81wire" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC16</span></a-col>
        <a-col :span="14"><a-input :value="crc16" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC16 Kermit</span></a-col>
        <a-col :span="14"><a-input :value="crc16kermit" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC16 Xmodem</span></a-col>
        <a-col :span="14"><a-input :value="crc16xmodem" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC24</span></a-col>
        <a-col :span="14"><a-input :value="crc24" /></a-col>
      </a-row>
      <a-row v-if="calType == 'CRC'" :gutter="24" style="line-height: 32px;" class="mt-1">
        <a-col :span="10"><span>CRC JAM</span></a-col>
        <a-col :span="14"><a-input :value="crcjam" /></a-col>
      </a-row>
    </div>
  </div>
</template>
<script>
import crc from 'crc';
import { Buffer } from 'buffer';
export default {
    data() {
        return {
            format : 'hex',
            content : '',
            calType : 'CRC',

            crc32 : null,
            crc16modbus : null,
            crc16ccitt : null,
            crc1 : null,
            crc8 : null,
            crc81wire : null,
            crc16 : null,
            crc16kermit : null,
            crc16xmodem : null,
            crc24 : null,
            crcjam : null,
            sum : null,
            evenParity : null,
            oddParity : null,
        };
    },
    methods : {
        /**
         * 重新计算
         */
        actionRecalculate() {
            let buf = null;
            try {
                if ( 'hex' == this.format ) {
                    buf = Buffer.from(this.content.replace(/\s/g,''), 'hex');
                } else {
                    buf = Buffer.from(this.content);
                }
            } catch (e) {
                buf = null;
            }
            this.calParityCheck(buf);
            this.calSumCheck(buf);
            this.calCRC(buf);
        },

        /**
         * CRC 校验
         */
        calCRC( buf ) {
            this.crc32 = null;
            this.crc16modbus = null;
            this.crc16ccitt = null;
            this.crc1 = null;
            this.crc8 = null;
            this.crc81wire = null;
            this.crc16 = null;
            this.crc16kermit = null;
            this.crc16xmodem = null;
            this.crc24 = null;
            this.crcjam = null;
            if ( null == buf || 0 == buf.length) {
                return; 
            }

            this.crc32 = crc.crc32(buf).toString(16).toUpperCase();
            this.crc16modbus = crc.crc16modbus(buf).toString(16).toUpperCase().padStart(4,'0');
            this.crc16ccitt = crc.crc16ccitt(buf).toString(16).toUpperCase();
            this.crc1 = crc.crc1(buf).toString(16).toUpperCase();
            this.crc8 = crc.crc8(buf).toString(16).toUpperCase();
            this.crc81wire = crc.crc81wire(buf).toString(16).toUpperCase();
            this.crc16 = crc.crc16(buf).toString(16).toUpperCase();
            this.crc16kermit = crc.crc16kermit(buf).toString(16).toUpperCase();
            this.crc16xmodem = crc.crc16xmodem(buf).toString(16).toUpperCase();
            this.crc24 = crc.crc24(buf).toString(16).toUpperCase();
            this.crcjam = crc.crcjam(buf).toString(16).toUpperCase();
        },

        /**
         * 和校验
         */
        calSumCheck (buf) {
            this.sum = null;
            if ( null == buf || 0 == buf.length) {
                return; 
            }

            let value = BigInt(0);
            for ( let i=0; i<buf.length; i++ ) {
                value += BigInt(buf[i]);
            }
            value = value.toString(16).toUpperCase();
            if ( 1 == value.length ) {
                value = `0${value}`;
            }
            this.sum = value.substr(value.length-2);
        },

        /**
         *奇偶校验
         */
        calParityCheck( buf ) {
            this.evenParity = null;
            this.oddParity = null;
            if ( null == buf || 0 == buf.length) {
                return; 
            }

            let parity = 0;
            for ( let i=0; i<buf.length; i++ ) {
                let byte = buf[i];
                for ( let bitI=0; bitI<8; bitI++ ) {
                    if((byte & 0x01) == 0x01) {
                        parity ++;
                    }
                    byte = byte >> 1; 
                }
            }
            this.evenParity = parity % 2 ^ 1;
            this.oddParity = parity % 2;
        },

        /**
         * 数据格式变更
         */
        actionFormatChange() {
            this.content = '';
            this.actionRecalculate();
        }
    },
    /**
     * 计算器信息
     */
    getInfo () {
        return {
            key : 'DataValidation',
            name : window.app.$t('app.toolCalculator.dataValidation'),
        };
    },
}
</script>