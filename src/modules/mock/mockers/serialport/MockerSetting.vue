<template>
  <a-modal v-if="enable" v-model="enable"
    :closable="false"
    :keyboard="false"
    :maskClosable="false" 
    :title="$t('mock.mockers.serialport.settingTitle')"
  >
    <a-form :label-col="{span:4}" :wrapper-col="{span:17}">
      <a-form-item :label="$t('mock.name')">
        <a-input v-model="mock.name" />
      </a-form-item>
      
      <!-- Path -->
      <a-form-item :label="$t('mock.mockers.serialport.path')">
        <a-input-group compact>
          <a-auto-complete ref="path"
            style="width: 80%"
            v-model="mock.options.path" 
            :data-source="serialports"
          ><a-input></a-input></a-auto-complete>
          <a-button style="width:20%;" 
            @click="actionSerialPortListRefresh"
          ><a-icon type="reload" /></a-button>
        </a-input-group>
      </a-form-item>
      
      <!-- Baud Rate -->
      <a-form-item :label="$t('mock.mockers.serialport.baudRate')">
        <a-auto-complete class="w-100" 
          v-model="mock.options.baudRate" 
          :data-source="baudRates"
        ><a-input></a-input></a-auto-complete>
      </a-form-item>
      
      <!-- Data Bits -->
      <a-form-item :label="$t('mock.mockers.serialport.dataBits')">
        <a-select v-model="mock.options.dataBits">
          <a-select-option value="5">5</a-select-option>
          <a-select-option value="6">6</a-select-option>
          <a-select-option value="7">7</a-select-option>
          <a-select-option value="8">8</a-select-option>
        </a-select>
      </a-form-item>

      <!-- Stop Bits -->
      <a-form-item :label="$t('mock.mockers.serialport.stopBits')">
        <a-select v-model="mock.options.stopBits">
          <a-select-option value="1">1</a-select-option>
          <a-select-option value="1.5">1.5</a-select-option>
          <a-select-option value="2">2</a-select-option>
        </a-select>
      </a-form-item>
     
      <!-- Parity -->
      <a-form-item :label="$t('mock.mockers.serialport.parity')">
        <a-select v-model="mock.options.parity">
          <a-select-option value="none">None</a-select-option>
          <a-select-option value="odd">Odd</a-select-option>
          <a-select-option value="even">Even</a-select-option>
          <a-select-option value="mark">Mark</a-select-option>
          <a-select-option value="space">Space</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <template slot="footer">
      <a-button type="primary" @click="actionOk">{{$t('button.ok')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
export default {
    name : 'MockMockMockSetting',
    props : {
        /**
         * mock instance to edit
         * @property {Object}
         */
        value : {type:Object},
    },
    data() {
        return {
            /**
             * indicate if setting enabled.
             * @property {Boolean}
             */
            enable : false,
            /**
             * instance of mock model
             * @property {MdbMock}
             */
            mock : null,
            /**
             * list of serialports
             * @property {Array<Object>}
             */
            serialports : [],
            /**
             * list of baud rates 
             * @property {Array<String>}
             */
            baudRates : [
                '110','300','600','1200','2400','4800','9600','14400','19200',
                '38400','56000','57600','76800','115200','128000','153600',
                '230400','256000','307200','460800','614400','921600','1382400'
            ],
        };
    },
    methods : {
        /**
         * open setting modal
         * @public
         */
        open() {
            this.mock = this.value;
            if ( true === this.mock.isMockInitRequired ) {
                this.mock.options.baudRate = '9600';
                this.mock.options.dataBits = '8';
                this.mock.options.stopBits = '1';
                this.mock.options.parity = 'none';
            }
            this.enable = true;
        },

        /**
         * event handler on done setting
         */
        async actionOk() {
            let options = this.mock.options;
            this.mock.summary = `${this.$t('mock.mockers.serialport.typeName')} `
                + `${options.path}:${options.baudRate} `
                + `${options.dataBits}-${options.parity[0].toUpperCase()}-${options.stopBits}`;
            let isSuccess = await this.mock.save();
            if ( !isSuccess ) {
                throw Error('Failed to save mock model');
            }
            this.$emit('change');
            this.enable = false;
        },

        /**
         * refresh serialport list
         */
        async actionSerialPortListRefresh() {
            this.serialports = [];
            let serialports = await window.SerialPort.list();
            for ( let i=0; i<serialports.length; i++ ) {
                this.serialports.push(serialports[i].path);
            }

            if ( 0 === this.serialports.length ) {
                this.$message.info(this.$t('mock.mockers.serialport.deviceRefreshEmpty'), 1);
                return;
            }
            
            this.$message.success(this.$t('mock.mockers.serialport.deviceRefreshSuccess'), 1);
            if ( 1 === this.serialports.length ) {
                this.mock.options.path = this.serialports[0];
            }
            
            this.$forceUpdate();
            this.$nextTick(() => this.$refs.path.focus());
        },
    },
}
</script>