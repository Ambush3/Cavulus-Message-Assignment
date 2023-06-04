<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button class="logout" @click="logout" v-if="loggedin">Logout</button>
    <div class="chat-list-container" v-if="loggedin">
      <div class="chat-list">
        <div v-for="chat in chats" class="p-2">
          <div @click="openChat(chat)" class="w-100 btn my-1"
            :class="[chat.seen ? 'btn-secondary' : 'btn-primary', chat.seen ? 'seen' : 'unseen']">
            <small>{{ chat.name }}</small> <br />
            <strong>{{ chat.latestMessage }}</strong>
          </div>
          <DropdownMenu @delete-chat="deleteChat(chat)" @archive-chat="archiveChat(chat)"></DropdownMenu>
        </div>
        <div class="chat-window">
          <div v-for="chatId in openedChats" :key="chatId">
            <chat :client="chats.find(chat => chat.id === chatId)"></chat>
          </div>
        </div>
      </div>
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
      openChatId: null
    };
  },
  computed: {
    // used for filtering chats by keyword search
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
    openChat(chat) {
      const index = this.openedChats.indexOf(chat.id);
      if (index !== -1) {
        this.openedChats.splice(index, 1);
      } else {
        this.openedChats.push(chat.id);
      }
    },
    // working on this feature
    archiveChat(chat) {
      const chatRef = doc(db, 'chats', chat.id);
      setDoc(chatRef, { archived: true }, { merge: true });
    },
    deleteChat(chat) {
      const chatRef = doc(db, 'chats', chat.id);
      deleteDoc(chatRef);
    },
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

.logout {
  color: red;
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
