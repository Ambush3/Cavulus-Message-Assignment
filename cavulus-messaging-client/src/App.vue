<template>
  <div class="container" v-if="client.id">
    <h1>{{ client.name }}</h1>
    <div>chat with : admin</div>
    <div class="chatbox">
      <div v-for="message in messages">
        <div :class="message.admin ? 'admin' : 'client'">
          {{ message.text }}
        </div>
      </div>
    </div>
    <input type="text" @keypress.enter="sendMessage" ref="newMessage" placeholder="new message ..." />
    <button @click="sendMessage" class="btn btn-primary">send</button>
  </div>
  <div v-else>
    <button @click="login">login</button>
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
    };
  },
  methods: {
    login: function () {
      signInWithPopup(auth, new GoogleAuthProvider());
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
  },
  mounted() {
    const loginListener = auth.onAuthStateChanged((user) => {
      if (user != null) {
        this.client.id = user.uid;
        this.client.name = user.displayName;

        const messages = onSnapshot(
          query(
            collection(db, 'chats/' + this.client.id + '/messages'),
            orderBy('date', 'desc')
          ),
          (snapshot) => {
            this.messages = snapshot.docs.map((doc) => {
              return { ...doc.data(), id: doc.id };
            });
          }
        );

        onUnmounted(messages);
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
</style>
