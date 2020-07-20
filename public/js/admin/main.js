
const app = new Vue({
    el: '#app',
    store,

    data() {
        return {
            hash: "session"
        }
    },

    methods: {
        setHash(name) {
            window.location.hash = name;
        },
        getHash() {
            return window.location.hash.substr(1);
        }
    },

    mounted() {
        this.$store.dispatch('logIn');

        this.hash = this.getHash();
    }
});

function protectRoute(val) {
    if (val !==  '' || val !== 'session') {
        if (!app.$store.state.authState) {
            app.setHash('session');
        }
    }
}

window.onload = () => {
    // Prevent at init state
    protectRoute(app.getHash());

    window.onhashchange = (val) => {
        
        // Prevent from explicit changes
        protectRoute(app.getHash());
        app.hash = app.getHash();
    }
}   