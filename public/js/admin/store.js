
const store = new Vuex.Store({
    state: {
        admin: {},
        authState: false
    },

    mutations: {
        LOG_IN(state, payload) {
            state.admin = payload;
            state.authState = true;
        },
        LOG_OUT(state) {
            state.admin = {};
            state.authState = false;
        }
    },

    actions: {
        logIn({ commit }, values) {
            if (!values) {
                const { email = '', name = '', password = '' } = sessionStorage;
    
                if (name.length && email.length && password.length) {
                    commit('LOG_IN', { name, email, password })
                    return
                }
            } else {
                firebase
                    .database()
                    .ref('admins')
                    .orderByChild('email')
                    .equalTo(values.email)
                    .on('child_added', (doc) => {
                    
                    const data = doc.val();
    
                    if (data.password === values.password) {
                        for(const prop in data) {
                            sessionStorage.setItem(prop, data[prop]);
                        }
                        commit('LOG_IN', data);
                    }
                })
            }

        },

        logOut({ commit }) {
            sessionStorage.clear();
            commit('LOG_OUT');
        }
    }
})