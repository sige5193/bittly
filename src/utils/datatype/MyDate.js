import MyNumber from './MyNumber.js'
export default class MyDate {
    /**
     * format date value to '2212151212'
     * @param {Date} date
     * @returns {String} 
     */
    static formatAsShortKey( date ) {
        if ( undefined === date || null === date ) {
            date = new Date();
        }
        let text = [];
        text.push(date.getFullYear().toString().substring(2));
        text.push(MyNumber.prependZero(date.getMonth()+1, 2));
        text.push(MyNumber.prependZero(date.getDate(), 2));
        text.push(MyNumber.prependZero(date.getHours(), 2));
        text.push(MyNumber.prependZero(date.getMinutes(), 2));
        return text.join('');
    }

    /**
     * format date value to '20221215120000'
     * @param {Date} date
     * @returns {String} 
     */
    static formatAsDateTimeNumberKey(date) {
        if ( undefined === date || null === date ) {
            date = new Date();
        }
        let text = [];
        text.push(date.getFullYear());
        text.push(MyNumber.prependZero(date.getMonth()+1, 2));
        text.push(MyNumber.prependZero(date.getDate(), 2));
        text.push(MyNumber.prependZero(date.getHours(), 2));
        text.push(MyNumber.prependZero(date.getMinutes(), 2));
        text.push(MyNumber.prependZero(date.getSeconds(), 2));
        text.push(MyNumber.prependZero(date.getMilliseconds(), 3));
        return text.join('');
    }

    /**
     * format date value to '2022-12-15 12:00:00.123'
     * @param {Date} date
     * @returns {String} 
     */
    static formatAsDateTimeDotMs ( date ) {
        let text = [];
        text.push(date.getFullYear());
        text.push('-');
        text.push(MyNumber.prependZero(date.getMonth()+1, 2));
        text.push('-');
        text.push(MyNumber.prependZero(date.getDate(), 2));
        text.push(' ');
        text.push(MyNumber.prependZero(date.getHours(), 2));
        text.push(':');
        text.push(MyNumber.prependZero(date.getMinutes(), 2));
        text.push(':');
        text.push(MyNumber.prependZero(date.getSeconds(), 2));
        text.push('.');
        text.push(MyNumber.prependZero(date.getMilliseconds(), 3));
        return text.join('');
    }

    /**
     * foramt date to given foramt pattern
     * @param {*} date 
     * @param {*} format 
     * @returns {String}
     */
    static format(date, format) {
        let result = [];
        for ( let i=0; i<format.length; i++ ) {
            let char = format[i];
            if ( '%' !== char ) {
                result.push(char);
                continue;
            }

            i++;
            char = format[i];
            if ( undefined === char ) {
                break;
            }

            let value = null;
            switch ( char ) {
            case 'd' : value = date.getDate().toString().padStart(2,'0'); break;
            case 'j' : value = date.getDate().toString(); break;
            case 'm' : value = (date.getMonth() + 1).toString().padStart(2,'0'); break;
            case 'n' : value = (date.getMonth() + 1).toString(); break;
            case 'Y' : value = date.getFullYear().toString(); break;
            case 'y' : value = date.getFullYear().toString().substr(2); break;
            case 'H' : value = date.getHours().toString().padStart(2,'0'); break;
            case 'G' : value = date.getHours().toString(); break;
            case 'i' : value = date.getMinutes().toString().padStart(2,'0'); break;
            case 's' : value = date.getSeconds().toString().padStart(2,'0'); break;
            case 'v' : value = date.getMilliseconds().toString().padStart(3,'0'); break;
            default : value = char; break;
            }
            result.push(value);
        }
        return result.join('');
    }
}