<template>
  <div class="container">
    <h1 class="title">{{ title }}</h1>
    <button class="logout" @click="logout" v-if="loggedin">Logout</button>
    <div class="chat-list-container" v-if="loggedin">
      <div class="chat-list">
        <div v-for="chat in chats" class="chat-item">
          <div @click="openChat(chat)" class="chat-button" :class="[chat.seen ? 'seen' : 'unseen']">
            <small class="chat-name">{{ chat.name }}</small>
            <strong class="latest-message">{{ chat.latestMessage }}</strong>
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
      <LoginForm @login-success="loginSuccess" />
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

import LoginForm from './components/LoginForm';
import Chat from './components/Chat';
import DropdownMenu from './components/DropdownMenu';

export default {
  name: 'App',
  components: {
    Chat,
    DropdownMenu,
    LoginForm
  },
  data() {
    return {
      chats: ref([]),
      openedChats: ref([]),
      loggedin: false,
      title: '',
      searchKeyword: '',
      openChatId: null,
      loginSuccess: false,
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
      requestNotificationPermission();
    },
    logout() {
      signOut(auth);
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
      // show message in browser tab with client name and latest message
      const { Notification } = window;
      if (
        !document.hasFocus() &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const notification = new Notification('New message', {
          body: `${this.chats[0].name}}`,
        });
      }
    }
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
        this.requestNotificationPermission();
      }
    });
    onUnmounted(loginListener);
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin-top: 20px;
  margin-bottom: 10px;
}

.logout {
  margin-top: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.chat-list-container {
  width: 33%;
}

.chat-list {
  width: 100%;
}

.chat-item {
  padding: 10px;
}

.chat-button {
  width: 100%;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background-color: #f5f5f5;
  color: #333;
  transition: background-color 0.3s ease;
}

.chat-button.seen {
  background-color: #eee;
}

.chat-button:hover {
  background-color: #ddd;
}

.chat-name {
  font-size: 14px;
}

.latest-message {
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
}

.chat-window {
  margin-top: 20px;
  overflow-y: auto;
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