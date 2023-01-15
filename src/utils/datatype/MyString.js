import { NIL as NIL_UUID, v4 as uuidV4 } from 'uuid';
export default class MyString {
    /**
     * generate uuid v4 string
     * @returns {String}
     */
    static uuidV4() {
        return uuidV4();
    }

    /**
     * generate uuid nil string
     * @returns {String}
     */
    static uuidNil() {
        return NIL_UUID;
    }
}