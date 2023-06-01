<template>
  <div class="container" v-if="client.id">
    <h1>{{ client.name }}</h1>
    <div>chat with: admin</div>
    <div class="chatbox">
      <div v-for="message in messages" :key="message.id">
        <div :class="message.admin ? 'admin' : 'client'">
          {{ message.text }}
        </div>
      </div>
    </div>
    <div class="message-box">
      <input type="text" @keypress.enter="sendMessage" ref="newMessage" placeholder="New message..." />
      <button @click="sendMessage" class="send-button">Send</button>
    </div>
  </div>
  <div v-else>
    <button @click="login">Login</button>
  </div>
</template>

<script>
import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

export default {
  props: {},
  data: () => {
    return {
      messages: ref([]),
      client: {
        id: null,
        name: '',
        date: 0,
        latestMessage: '',
        seen: false,
      },
      hasUnreadMessage: false,
    };
  },
  methods: {
    login: function () {
      signInWithPopup(auth, new GoogleAuthProvider()).then(() => {
        this.requestNotificationPermission();
      });
    },
    sendMessage: function () {
      addDoc(collection(db, 'chats/' + this.client.id + '/messages'), {
        text: this.$refs.newMessage.value,
        date: Date.now(),
      });

      let updateLatestMessage = {
        ...this.client,
        latestMessage: this.$refs.newMessage.value,
        seen: false,
        date: Date.now(),
      };
      delete updateLatestMessage.id;
      setDoc(doc(db, 'chats/' + this.client.id), updateLatestMessage);
      this.$refs.newMessage.value = '';
    },
    requestNotificationPermission: function () {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            this.showNotification();
          }
        });
      }
    },
    showNotification: function () {
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
    handleTabClick: function () {
      this.hasUnreadMessage = false;
    },
  },
  mounted() {
    const loginListener = auth.onAuthStateChanged((user) => {
      if (user != null) {
        this.client.id = user.uid;
        this.client.name = user.displayName;
        this.requestNotificationPermission();

        const messages = onSnapshot(
          query(
            collection(db, 'chats/' + this.client.id + '/messages'),
            orderBy('date', 'desc')
          ),
          (snapshot) => {
            this.messages = snapshot.docs.map((doc) => {
              return { ...doc.data(), id: doc.id };
            });
            if (!document.hasFocus()) {
              this.hasUnreadMessage = true;
            }
          }
        );

        onUnmounted(messages);
      }
    });

    onUnmounted(loginListener);

    window.addEventListener('focus', this.handleTabClick);
  },
  beforeUnmount() {
    window.removeEventListener('focus', this.handleTabClick);
  },
  watch: {
    hasUnreadMessage: function (newValue) {
      document.title = newValue ? '(1) New Message' : 'Chat App';
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
  height: 50vh;
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
  width: 300px;
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
</style>
