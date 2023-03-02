class Formatter {
    /**
     * 配置 Vue
     */
    static setupVue( vue ) {
        vue.prototype.$format = ( value, formatter, options={} ) => {
            let handler = 'as' + formatter;
            return Formatter[handler](value, options);
        };
    }



    /**
     * @param {*} time 
     */
    static asDurationMS( time ) {
        if ( undefined === time ) {
            time = 0;
        }
        
        let ms = time % 1000;
        
        time = (time - ms) / 1000;
        let sec = time % 60;

        time = (time - sec) / 60;
        let min = time % 60;

        time = (time - min) / 60;
        let hour = time / 60;
        return `${hour.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}.${ms.toString().padStart(3,'0')}`;
    }

    /** 格式化为文件尺寸 */
    static asFileSize( value ) {
        if( null == value || value=='' || 0 == value) {
            return "0 B";
        }

        if ( 1 > value ) {
            value = 1;
        }
        value = parseFloat(value);
        let index = Math.floor(Math.log(value)/Math.log(1024));
        if ( 0 > index ) {
            index = 0;
        }

        let size = value / Math.pow(1024,index);
        size = size.toFixed(2);

        let units = ["B","KB","MB","GB","TB","PB","EB","ZB","YB"];
        return size + units[index];
    }

    /**
     * 数据时间
     * @param {Date} time
     */
    static asDataTime( time ) {
        let text = [];
        text.push(time.getFullYear());
        text.push('-');
        text.push((time.getMonth()+1).toString().padStart(2,'0'));
        text.push('-');
        text.push(time.getDate().toString().padStart(2,'0'));
        text.push(' ');
        text.push(time.getHours().toString().padStart(2,'0'));
        text.push(':');
        text.push(time.getMinutes().toString().padStart(2,'0'));
        text.push(':');
        text.push(time.getSeconds().toString().padStart(2,'0'));
        text.push('.');
        text.push(time.getMilliseconds().toString().padStart(3,'0'));
        return text.join('');
    }

    /**
     * 数据时间
     * @param {Date} time
     */
     static asTimeDotMS( time ) {
        let text = [];
        let hour = time.getHours();
        text.push(hour >= 10 ? hour : `0${hour}`);
        text.push(':');

        let min = time.getMinutes();
        text.push(min >= 10 ? min : `0${min}`);
        text.push(':');

        let sec = time.getSeconds();
        text.push( sec >= 10 ? sec : `0${sec}` );
        text.push('.');

        let ms = time.getMilliseconds();
        if ( 10 <= ms && ms < 100 ) {
            ms = `0${ms}`;
        } else if ( ms < 10 ) {
            ms = `00${ms}`;
        } 
        text.push(ms);
        return text.join('');
    }

    /**
     * 十六进制数据展示
     */
    static asHexString( data ) {
        if ( null == data ) {
            return '';
        }
        
        let bytes = [];
        for ( let i=0; i<data.length; i++ ) {
            let byte = data[i].toString(16);
            if ( 0xF >= data[i] ) {
                byte = '0' + byte;
            }
            bytes.push(byte);
        }
        return bytes.join(' ').toUpperCase();
    }
}
export default Formatter;