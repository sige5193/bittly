import MyNumber from './MyNumber.js'
export default class MyDate {
    /**
     * format date value to '20221215120000'
     * @param {Date} date
     * @returns {String} 
     */
    static formatAsDateTimeNumberKey(date) {
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
}