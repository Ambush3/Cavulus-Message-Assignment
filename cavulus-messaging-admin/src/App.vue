<template>
  <div class="container">
    <h1>{{ title }}</h1>

    <div class="chat-list-container" v-if="loggedin">
      <div class="chat-list">
        <div v-for="chat in chats" class="p-2">
          <div @click="openedChats.push(chat)" class="w-100 btn my-1"
            :class="[chat.seen ? 'btn-secondary' : 'btn-primary', chat.seen ? 'seen' : 'unseen']">
            <small>{{ chat.name }}</small> <br />
            <strong>{{ chat.latestMessage }}</strong>
          </div>
          <DropdownMenu @delete-chat="deleteChat(chat)" @archive-chat="archiveChat(chat)"></DropdownMenu>
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
import { ref, onUnmounted, computed } from 'vue';

import Chat from './components/Chat';
import DropdownMenu from './components/DropdownMenu';

export default {
  name: 'App',
  components: {
    Chat,
    DropdownMenu
  },
  data() {
    return {
      chats: ref([]),
      openedChats: ref([]),
      loggedin: false,
      title: '',
      searchKeyword: '',
    };
  },
  computed: {
    filteredChats() {
      const keyword = this.searchKeyword.toLowerCase();
      return this.openedChats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(keyword) ||
          chat.latestMessage.toLowerCase().includes(keyword)
      );
    },
  },
  methods: {
    login() {
      signInWithPopup(auth, new GoogleAuthProvider());
    },
    logout() {
      signOut(auth);
    },
    deleteChat(chat) {
      // Update the chat document in the database to delete it
      const chatRef = doc(db, 'chats', chat.id);
      deleteDoc(chatRef);
    },
    archiveChat(chat) {
      // Update the chat document in the database to mark it as archived
      const chatRef = doc(db, 'chats', chat.id);
      setDoc(chatRef, { archived: true }, { merge: true });
    },
    openChat(chat) {
      if (!this.openedChats.includes(chat)) {
        this.openedChats.push(chat);
      }
    },
    highlightText(text) {
      const keyword = this.searchKeyword.toLowerCase();
      const regex = new RegExp(`(${keyword})`, 'gi');
      return text.replace(regex, '<span class="highlight">$1</span>');
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
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chat-list-container {
  width: 33%;
}

.chat-list {
  width: 100%;
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
  background-color: rgb(174, 172, 172);
  color: black;
}

.highlight {
  background-color: red;
}

@media screen and (max-width: 768px) {
  .chat-window {
    height: 50vh;
  }

  .chat-list-container {
    width: 100%;
  }
}
</style>
