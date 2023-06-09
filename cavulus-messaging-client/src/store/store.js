import { createStore } from 'vuex';

export default createStore({
    state: {
        user: null,
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload;
            console.log('user set to: ', state.user);
        },
    },
});

