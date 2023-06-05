<template>
  <div class="container">
    <div v-if="!loggedIn">
      <div v-if="!showRegisterForm">
        <LoginForm @login-success="loginSuccess" />
        <br /><br />
        <button @click="showRegisterForm = true">Register</button>
      </div>
      <div v-else>
        <RegistrationForm :auth="auth" @register-success="handleRegisterSuccess" />
        <br /><br />
        <button @click="showRegisterForm = false">Login</button>
      </div>
    </div>
    <div v-else>
      <div class="client-section" v-if="isClient && client.name">
        <h1>Hello {{ client.name }}</h1>
        <!-- <div>Chat with: Hello {{ client.name }}</div> -->
        <div class="search-bar">
          <input v-model="searchKeyword" type="text" placeholder="Search messages" />
        </div>
        <div class="chatbox">
          <div v-for="message in filteredMessages" :key="message.id">
            <div :class="message.admin ? 'admin' : 'client'">
              {{ message.text }}
              <small class="message-date">{{ formatDate(message.date) }}</small>
            </div>
          </div>
        </div>
        <div class="message-box">
          <input type="text" @keypress.enter="sendMessage" ref="newMessage" placeholder="New message..." />
          <button @click="sendMessage" class="send-button">Send</button>
        </div>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
      <div class="admin-section" v-else>
        <!-- <h1>Chat With Admin</h1> -->
        <div class="chatbox">
          <div v-for="message in filteredMessages" :key="message.id">
            <div :class="message.admin ? 'admin' : 'client'">
              {{ message.text }}
              <small class="message-date">{{ formatDate(message.date) }}</small>
            </div>
          </div>
        </div>
        <div class="message-box">
          <input type="text" @keypress.enter="sendMessage" ref="newMessage" placeholder="New message..." />
          <button @click="sendMessage" class="send-button">Send</button>
        </div>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
    </div>
  </div>
</template>


<script>
import { db, auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  onSnapshot,
  collection,
  doc,
  deleteDoc,
  setDoc,
  addDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { ref, onUnmounted, computed } from 'vue';
import LoginForm from './components/LoginForm.vue';
import RegistrationForm from './components/RegistrationForm.vue';

export default {
  components: {
    LoginForm,
    RegistrationForm,
  },
  data() {
    return {
      registration: {
        name: '',
        email: '',
        password: '',
      },
      loginData: {
        email: '',
        password: '',
      },
      loggedIn: false,
      isClient: false,
      messages: ref([]),
      client: {
        id: null,
        name: '',
        latestMessage: '',
        seen: false,
      },
      hasUnreadMessage: false,
      searchKeyword: '',
      loginSuccess: false,
      registerSuccess: false,
      showRegisterForm: false,
      auth: {},
    };
  },
  computed: {
    filteredMessages() {
      if (!this.searchKeyword) {
        return this.messages;
      }

      const keyword = this.searchKeyword.toLowerCase();
      return this.messages.filter((message) =>
        message.text.toLowerCase().includes(keyword)
      );
    },
  },
  methods: {
    handleRegisterSuccess() {
      this.registerSuccess = true;
    },
    login() {
      const { email, password } = this.loginData;
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          this.requestNotificationPermission();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    sendMessage() {
      addDoc(collection(db, `chats/${this.client.id}/messages`), {
        text: this.$refs.newMessage.value,
        date: Date.now(),
        admin: !this.isClient,
      });

      const updateLatestMessage = {
        ...this.client,
        latestMessage: this.$refs.newMessage.value,
        seen: false,
        date: Date.now(),
      };
      delete updateLatestMessage.id;
      setDoc(doc(db, `chats/${this.client.id}`), updateLatestMessage);
      this.$refs.newMessage.value = '';
    },
    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            this.showNotification();
          }
        });
      }
    },
    showNotification() {
      const { Notification } = window;
      if (
        !document.hasFocus() &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const notification = new Notification('New Message', {
          body: 'You have received a new message.',
          icon: '/cavulus-messaging-client/src/assets/notification.png',
        });
      }
    },
    handleTabClick() {
      this.hasUnreadMessage = false;
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    },
    logout() {
      auth.signOut();
      this.loggedIn = false;
      this.isClient = false;
      this.client.id = null;
      this.messages = [];
    },
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user != null) {
        this.loggedIn = true;
        this.isClient = true;
        this.client.id = user.uid;
        this.client.name = user.displayName;
        this.requestNotificationPermission();

        const messages = onSnapshot(
          query(
            collection(db, `chats/${this.client.id}/messages`),
            orderBy('date', 'desc')
          ),
          (snapshot) => {
            this.messages = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            if (!document.hasFocus()) {
              this.hasUnreadMessage = true;
            }
          }
        );

        onUnmounted(messages);
      } else {
        this.client.name = localStorage.getItem('clientName');
      }

      window.addEventListener('focus', this.handleTabClick);
    });
  },
  beforeUnmount() {
    window.removeEventListener('focus', this.handleTabClick);
  },
  watch: {
    hasUnreadMessage(newValue) {
      document.title = newValue ? 'New Message' : 'Cavulus Client';
    },
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chatbox {
  height: 70vh;
  width: 30vw;
  overflow: scroll;
  flex-direction: column-reverse;
  background-color: #0045c4;
  border-radius: 5px;
  display: flex;
}

.chatbox>div {
  display: flex;
  flex-direction: column;
}

.chatbox>div>div {
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 4px;
}

.message-date {
  font-size: 0.75rem;
  color: #888;
}

.client {
  align-self: end;
  background-color: white;
}

.admin {
  align-self: start;
  background-color: #fdff8f;
}

.message-box {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.message-box input[type="text"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 45vh;
}

.message-box .send-button {
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #0045c4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ff0000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button {
  padding: 0.5rem 1rem;
  background-color: #0045c4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-form input[type="text"],
.login-form input[type="password"] {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
}

.admin-section h1,
.client-section h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.search-bar input[type="text"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 1rem;
}

@media only screen and (max-width: 768px) {
  .chatbox {
    height: 70vh;
    width: 70vw;
  }

  .message-box input[type="text"] {
    width: 52vw;
  }
}

@media only screen and (min-width: 768px) and (max-width: 1024px) {
  .chatbox {
    height: 70vh;
    width: 50vw;
  }

  .message-box input[type="text"] {
    width: 41vw;
  }

  .search-bar input[type="text"] {
    width: 53.5vw;
  }
}
</style>
