const contactsRef = firebase.database().ref('contact');
const gallaryRef = firebase.database().ref('gallary');
const eventsRef = firebase.database().ref('events');
const membershipRef = firebase.database().ref('membership');

const gallaryStorageRef = firebase.storage().ref("gallary");
const eventsStorageRef = firebase.storage().ref("events");


const SessionView = Vue.component('session-view', {
    template: `
        <div class="page-content center middle">

            <div v-if="!authState" class="unauth">

                <form name="login" @submit.prevent="handleSubmission">
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <input v-model='email' class="mdl-textfield__input" type="text" id="email" name="email" />
                        <label class="mdl-textfield__label" for="sample3">Email address</label>
                    </div>

                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <input v-model='password' class="mdl-textfield__input" type="password" id="password" name="password" />
                        <label class="mdl-textfield__label" for="sample3">Password</label>
                    </div>
                
                    <br />
                    
                    <div>
                        <center>
                            <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Login</button>
                        </center>
                    </div>

                </form>
            </div>
            
            <div v-else-if="loadingState && !authState" class="loading-view">
                <!-- MDL Spinner Component with Single Color -->
                <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
            </div>

            <div v-else class="usename">
                <center>
                    <h1>{{ username || useremail }}</h1>
                    <h2>{{ useremail }}</h2>

                    <button 
                        @click="$store.dispatch('logOut')"
                        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
                        Log out
                    </button>
                </center>
            </div>
        </div>
    `, 

    data() {
        return {
            email: '',
            password: '',
            loadingState: false
        }
    },
    methods: {
        handleSubmission() {
            if (!(this.email.length && this.password.length)) {
                alert("Complete given fields");
                return;
            }
            const payload = {
                email: this.email,
                password: this.password
            }

            this.loadingState = true;
            this.$store.dispatch('logIn', payload)
        }
    },
    watch: {
        authState(val) {
            if (val) {
                this.loadingState = false;
            }
        }
    },
    computed: {
        authState() {
            return this.$store.state.authState;
        },
        username() {
            return this.$store.state.admin.name;
        },
        useremail() {
            return this.$store.state.admin.email;
        }
    }
})

const ContactsView = Vue.component('contacts-view', {
    template: `
        <div class="page-content">
            <div v-if="contacts.length === 0" class="loading-view flex fcol center middle">
                <!-- MDL Spinner Component with Single Color -->
                <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
            </div>

            <div v-else id="bucket-list-wrapper">
                <div class="mdl-grid">
                    <div v-for="(contact, index) in contacts" :key="index" class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
                        <div class="mdl-card__title">
                            <h2 class="mdl-card__title-text">{{ contact.first_name + ' ' + contact.last_name }}</h2>
                        </div>
                        <div class="mdl-card__supporting-text">
                            <small>{{ new Date(contact.timestamp).toLocaleString() }}</small>
                            <br />
                            {{ contact.message }}
                        </div>
                        <div class="mdl-card__actions mdl-card--border">
                            <a :href="'/admin/print-contact/' + contact.key" target="new" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">
                                Print
                                <span class="mdl-button__ripple-container">
                                    <span class="mdl-ripple"></span>
                                </span>
                            </a>
                        </div> 
                        <div class="mdl-card__menu">
                            <button @click="deleteContact(contact.key)" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">
                                <i class="material-icons">delete</i>
                                <span class="mdl-button__ripple-container">
                                    <span class="mdl-ripple"></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `, 
    data() {
        return {
            loadingState: true,

            contacts: []
        }
    },

    methods: {
        deleteContact(id) {
            contactsRef.child(id).remove();
        }
    },

    mounted() {
        contactsRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            Reflect.set(data, 'key', snapshot.key);

            this.contacts.push(data);
        })
        contactsRef.on('child_removed', (doc) => {
            const contacts = this.contacts;
            this.contacts = contacts.filter(contact => contact.key !== doc.key);
        })
        
    }
})

const GallaryView = Vue.component('gallary-view', {
    template: `
        <div class="page-content">
            <div class="pad-1">
                <!-- Colored FAB button with ripple -->
                <button @click="uploadModelState = !uploadModelState" :disabled="uploadModelState" class="mdl-button fixed-btn mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
                    <i class="material-icons">cloud_upload</i>
                </button>
            </div>

            <div v-if="photos.length === 0 && loadingState" class="loading-view flex fcol center middle">
                <!-- MDL Spinner Component with Single Color -->
                <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
            </div>

            <div v-if="photos.length === 0 && !loadingState" class="loading-view flex fcol center middle">
                <p>Empty collection</p>
            </div>

            <div v-else id="bucket-list-wrapper">
                <div class="mdl-grid">
                    <div v-for="(photo, index) in photos" :key="index" class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
                        <div class="mdl-card__title" :style="generateImageStyle(photo.url)">
                        
                        </div>
                        <div class="mdl-card__supporting-text">
                            <small>{{ new Date(photo.timestamp).toLocaleString() }}</small>
                            <h4>{{ photo.title }}</h4>
                            {{ photo.desc || '' }}
                        </div>
                        <div class="mdl-card__menu">
                            <button @click="deletePhoto(photo.key, photo.path)" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">
                                <i class="material-icons white">delete</i>
                                <span class="mdl-button__ripple-container">
                                    <span class="mdl-ripple"></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            

            <dialog class="mdl-dialog fixed" :open="uploadModelState">
            
            <div v-show="uploadingState">
                <!-- MDL Progress Bar with Indeterminate Progress -->
                <div class="mdl-progress mdl-js-progress mdl-progress__indeterminate is-active"></div>
            </div>

            <h4 class="mdl-dialog__title">Upload new photo</h4>
            <div class="mdl-dialog__content">
                    <p>Recommended to upload below then 2MB</p>
        
                    <form name="uploadGallaryPhoto" @submit.prevent="handleSubmission">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input class="mdl-textfield__input" type="file" id="photo" name="photo" />
                            <label class="mdl-textfield__label" for="photo">Photo</label>
                        </div>
            
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input v-model="title" class="mdl-textfield__input" type="text" id="title" name="title" />
                            <label class="mdl-textfield__label" for="title">Title</label>
                        </div>
            
                        <div class="mdl-textfield mdl-js-textfield">
                            <textarea v-model="desc" class="mdl-textfield__input" type="text" rows= "3" id="desc" ></textarea>
                            <label class="mdl-textfield__label" for="desc">Write description</label>
                        </div>
                        
                        <div class="mdl-dialog__actions">
                            <button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary">Upload</button>
                            <button @click="uploadModelState = false" type="button" class="mdl-button close">Cancel</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>

    `,

    data() {
        return {
            uploadModelState: false,

            loadingState: false,

            uploadingState: false,

            title: '',
            desc: '',
            photos: []
        }
    },

    mounted() {
        this.loadingState = true;

        setTimeout(() => {
            this.loadingState = false;
        }, 3500)

        gallaryRef.orderByChild('timeString').on('child_added', (snapshot) => {
            const data = snapshot.val();
            Reflect.set(data, 'key', snapshot.key);

            this.photos.push(data);
            this.loadingState = false;
        })
        gallaryRef.on('child_removed', (doc) => {
            const photos = this.photos;
            this.photos = photos.filter(photo => photo.key !== doc.key);
        })
        
    },

    methods: {
        generateImageStyle(bgUrl) {
            return {
                height: '16em',
                backgroundImage: `url(${bgUrl})`,
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(0.8)',
                backgroundSize: 'cover'
            }
        },
        deletePhoto(id, path) {
            gallaryRef.child(id).remove();
            firebase.storage().ref(path).delete();
        },
        async handleSubmission(ev) {
            const [ file ] = ev.target.photo.files;
            const { title, desc } = this;
            const self = this;

            if (!(file && title)) {
                alert("Select file and give a title");
                return
            }

            const uploadFileRef = gallaryStorageRef.child(file.name);

            const task = uploadFileRef.put(file);

            this.uploadingState = true;

            task.on('state_changed', 
                function progress(snapshot) {
                    console.log("Snaphot: ", snapshot);
                },

                function error(err) {
                    console.log("Error: ", err);
                },

                async function complete(res) {

                    try {
                        const url = await uploadFileRef.getDownloadURL();

                        firebase.database().ref('/gallary').push({
                            title,
                            desc,
                            path: uploadFileRef.location.path,
                            url,
                            timestamp: Date.now(),
                            timeString: new Date().toLocaleString()
                        });

                        self.uploadModelState = false;
                        self.uploadingState = false;
                    } catch(err) {
                        alert("Error while uploading an image");
                        return
                    }
                }
            )
        }
    }
})

const MembershipView = Vue.component('memberhip-view', {
    template: `
        <div class="page-content">
            <div v-if="memberships.length === 0" class="loading-view flex fcol center middle">
                <!-- MDL Spinner Component with Single Color -->
                <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
            </div>

            <div v-else id="bucket-list-wrapper">
                <div class="mdl-grid">
                    <div v-for="(membership, index) in memberships" :key="index" class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
                        <div class="mdl-card__title">
                            <h2 class="mdl-card__title-text">{{ membership.first_name + ' ' + membership.last_name }}</h2>
                        </div>
                        <div class="mdl-card__supporting-text">
                            <small>{{ new Date(membership.timestamp).toLocaleString() }}</small>
                            <br />
                        </div>
                        <div class="mdl-card__actions mdl-card--border">
                            <a :href="'/admin/print-membership/' + membership.key" target="new" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">
                                Print
                                <span class="mdl-button__ripple-container">
                                    <span class="mdl-ripple"></span>
                                </span>
                            </a>
                        </div> 
                        <div class="mdl-card__menu">
                            <button @click="deleteMembership(membership.key)" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">
                                <i class="material-icons">delete</i>
                                <span class="mdl-button__ripple-container">
                                    <span class="mdl-ripple"></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            loadingState: true,

            memberships: []
        }
    },

    methods: {
        deleteMembership(id) {
            membershipRef.child(id).remove();
        }
    },

    mounted() {
        membershipRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            Reflect.set(data, 'key', snapshot.key);

            this.memberships.push(data);
        })
        membershipRef.on('child_removed', (doc) => {
            const memberships = this.memberships;
            this.memberships = memberships.filter(membership => membership.key !== doc.key);
        })
        
    }
});

const EventsView = Vue.component('events-view', {
    template: `
        <div class="page-content">
            <div class="pad-1">
                <!-- Colored FAB button with ripple -->
                <button @click="uploadModelState = !uploadModelState" :disabled="uploadModelState" class="mdl-button fixed-btn mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
                    <i class="material-icons">add</i>
                </button>
            </div>

            <div v-if="events.length === 0 && loadingState" class="loading-view flex fcol center middle">
                <!-- MDL Spinner Component with Single Color -->
                <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
            </div>

            <div v-if="events.length === 0 && !loadingState" class="loading-view flex fcol center middle">
                <p>Empty collection</p>
            </div>

            <div v-else id="bucket-list-wrapper">
                <div class="mdl-grid">
                    <div v-for="(event, index) in events" :key="index" class="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
                        <div class="mdl-card__title" :style="generateImageStyle(event.url)">
                        </div>
                        <div class="mdl-card__supporting-text">
                            <small>{{ new Date(event.timestamp).toLocaleString() }}</small>
                            <h4>{{ event.title }}</h4>
                            {{ event.desc || '' }}
                        </div>
                        <div class="mdl-card__menu">
                            <button @click="deleteEvent(event.key, event.path)" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">
                                <i class="material-icons white">delete</i>
                                <span class="mdl-button__ripple-container">
                                    <span class="mdl-ripple"></span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <dialog class="mdl-dialog fixed" :open="uploadModelState">

            <div v-show="uploadingState">
                <!-- MDL Progress Bar with Indeterminate Progress -->
                <div class="mdl-progress mdl-js-progress mdl-progress__indeterminate is-active"></div>
            </div>

            <h4 class="mdl-dialog__title">Upload new Event</h4>
            <div class="mdl-dialog__content">
                    <p>Recommended to upload below then 2MB</p>
        
                    <form name="uploadGallaryPhoto" @submit.prevent="handleSubmission">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input class="mdl-textfield__input" type="file" id="photo" name="photo" />
                            <label class="mdl-textfield__label" for="photo">Photo</label>
                        </div>
            
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input v-model="title" class="mdl-textfield__input" type="text" id="title" name="title" />
                            <label class="mdl-textfield__label" for="title">Title</label>
                        </div>
            
                        <div class="mdl-textfield mdl-js-textfield">
                            <textarea v-model="about" class="mdl-textfield__input" type="text" rows= "3" id="about" ></textarea>
                            <label class="mdl-textfield__label" for="about">Write description</label>
                        </div>

                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input v-model="date" class="mdl-textfield__input" type="date" id="date" name="date" />
                            <label class="mdl-textfield__label" for="date">Date</label>
                        </div>

                        <div class="mdl-dialog__actions">
                            <button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary">Upload</button>
                            <button @click="uploadModelState = false" type="button" class="mdl-button close">Cancel</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>

    `,

    data() {
        return {
            uploadModelState: false,

            loadingState: false,

            uploadingState: false,

            title: '',
            about: '',
            date: '',
            events: []
        }
    },

    mounted() {
        this.loadingState = true;

        setTimeout(() => {
            this.loadingState = false;
        }, 3500)

        eventsRef.orderByChild('timeString').on('child_added', (snapshot) => {
            const data = snapshot.val();
            Reflect.set(data, 'key', snapshot.key);

            this.events.push(data);
            this.loadingState = false;
        })
        eventsRef.on('child_removed', (doc) => {
            const events = this.events;
            this.events = events.filter(event => event.key !== doc.key);
        })
        
    },

    methods: {
        generateImageStyle(bgUrl) {
            return {
                height: '16em',
                backgroundImage: `url(${bgUrl})`,
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(0.8)',
                backgroundSize: 'cover'
            }
        },
        deleteEvent(id, path) {
            if (confirm("Are you sure that you want to delete this event?")) {
                eventsRef.child(id).remove();
                firebase.storage().ref(path).delete();
                return;
            }
        },
        async handleSubmission(ev) {
            const [ file ] = ev.target.photo.files;
            const { title, about, date } = this;
            const self = this;

            if (!(file && title.length && date.length)) {
                alert("Select file and give a title and date value");
                return
            }

            const uploadFileRef = eventsStorageRef.child(file.name);

            const task = uploadFileRef.put(file);

            this.uploadingState = true;

            task.on('state_changed', 
                function progress(snapshot) {
                    console.log("Snaphot: ", snapshot);
                },

                function error(err) {
                    console.log("Error: ", err);
                },

                async function complete(res) {

                    try {
                        const url = await uploadFileRef.getDownloadURL();

                        eventsRef.push({
                            title,
                            about,
                            date,
                            path: uploadFileRef.location.path,
                            url,
                            timestamp: Date.now(),
                            timeString: new Date().toLocaleString()
                        });

                        ev.target.reset();

                        self.uploadModelState = false;
                        self.uploadingState = false;
                    } catch(err) {
                        alert("Error while creating an event");
                        return
                    }
                }
            )
        }
    }
})