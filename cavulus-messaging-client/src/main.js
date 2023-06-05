import App from './App.vue'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { registerPlugins } from '@/plugins'
// import store from '@/store/store'

const store = createStore({
    state() {
        return {
            user: null,
        }
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload;
            console.log('user set to: ', state.user);
        }
    }
});

const app = createApp(App)
registerPlugins(app)
createApp(App).use(store).mount('#app')


