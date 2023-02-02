export default class MockStore {
    /**
     * @constructor
     */
    constructor() {
        this.getters = {
            mocks : {},
        };
        this.commit = jest.fn((mutation, payload) => this.mockCommit(mutation, payload));
    }

    /**
     * @param {*} mutation 
     * @param {*} payload 
     */
    mockCommit(mutation, payload) {
        switch ( mutation ) {
        case 'mockStart':
            this.getters.mocks[payload.key] = payload;
            window.app.$eventBus.$emit('mock-start', payload);
            break; 
        case 'mockStop' : 
            debugger
            delete this.getters.mocks[payload];
            window.app.$eventBus.$emit('mock-stop', payload);
            break;
        default : 
            throw Error(`unhandled mutation "${mutation}"`);
        }
    }
}