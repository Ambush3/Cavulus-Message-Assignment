<template>
  <div class="container">
    <h1>{{ title }}</h1>

    <div v-if="loggedin">
      <div class="chat-list">
        <div v-for="chat in chats" class="p-2">
          <div @click="openedChats.push(chat)" class="w-100 btn my-1"
            :class="[chat.seen ? 'btn-secondary' : 'btn-primary', chat.seen ? 'seen' : 'unseen']">
            <small>{{ chat.name }}</small> <br />
            <strong>{{ chat.latestMessage }}</strong>
          </div>
        </div>
      </div>

      <div class="chat-window">
        <div v-for="chat in openedChats">
          <chat :client="chat"></chat>
        </div>
      </div>

      <button @click="logout">Logout</button>
    </div>

    <div v-else>
      <button @click="login">Login</button>
    </div>
  </div>
</template>

<script>
import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
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
import { ref, onUnmounted } from 'vue';

import Chat from './components/Chat';

export default {
  name: 'App',
  components: {
    Chat,
  },
  data() {
    return {
      chats: ref([]),
      openedChats: ref([]),
      loggedin: false,
      title: '',
    };
  },
  methods: {
    login() {
      signInWithPopup(auth, new GoogleAuthProvider());
    },
    logout() {
      signOut(auth);
    },
  },
  mounted() {
    const loginListener = auth.onAuthStateChanged((user) => {
      if (user) {
        this.loggedin = true;
        this.title = 'Welcome Admin';
        const chatSnapshot = onSnapshot(
          query(collection(db, 'chats'), orderBy('date', 'desc')),
          (snapshot) => {
            this.chats = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
          },
          (error) => {
            if (this.loggedin && error.code.includes('permission')) {
              this.title = 'You are not admin!';
            }
          }
        );
        onUnmounted(chatSnapshot);
      } else {
        this.loggedin = false;
        this.title = 'Please login';
      }
    });
    onUnmounted(loginListener);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 50px; */
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* height: 100vh; */
}

.chat-list {
  overflow-y: auto;
}

.chat-window {
  margin-top: 20px;
  overflow-y: auto;
}

.btn-primary {
  background-color: white;
  color: black;
}

.btn-secondary {
  background-color: blue;
  color: white;
}

.seen {
  background-color: blue;
  color: white;
}

.unseen {
  background-color: white;
  color: black;
}

@media screen and (max-width: 768px) {
  .chat-list {
    height: 50vh;
  }

  .chat-window {
    height: 50vh;
  }
}
</style>
