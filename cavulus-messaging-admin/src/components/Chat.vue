<template>
    <div>
        <div>Chat with: {{ client.name.charAt(0).toUpperCase() + client.name.slice(1) }}</div>
        <div class="chatbox">
            <div v-for="message in messages" :key="message.id" class="message"
                :class="{ admin: message.admin, client: !message.admin }">
                {{ message.text }}
            </div>
        </div>
        <div class="input-container">
            <input type="text" v-model="newMessage" @keypress.enter="sendMessage" placeholder="New message...">
            <button @click="sendMessage" class="btn btn-primary">Send</button>
        </div>
    </div>
</template>

<script>
import { db } from '../firebase';
import { onSnapshot, collection, addDoc, orderBy, query, setDoc, doc } from 'firebase/firestore';
import { ref, onUnmounted } from 'vue';

export default {
    props: {
        client: Object
    },
    data() {
        return {
            messages: [],
            newMessage: ''
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() === '') return;

            addDoc(collection(db, 'chats/' + this.client.id + '/messages'), {
                text: this.newMessage,
                admin: true,
                date: Date.now()
            });

            const updateLatestMessage = { ...this.client, latestMessage: this.newMessage };
            delete updateLatestMessage.id;
            setDoc(doc(db, 'chats/' + this.client.id), updateLatestMessage);

            this.newMessage = '';
        }
    },
    mounted() {
        const updateSeen = { ...this.client, seen: true };
        delete updateSeen.id;
        setDoc(doc(db, 'chats/' + this.client.id), updateSeen);
        this.client.seen = true;

        const messages = onSnapshot(
            query(collection(db, 'chats/' + this.client.id + '/messages'), orderBy('date', 'desc')),
            (snapshot) => {
                this.messages = snapshot.docs.map((doc) => {
                    return { ...doc.data(), id: doc.id };
                });
            }
        );

        onUnmounted(messages);
    }
};
</script>

<style>
.chat-header {
    font-weight: bold;
    padding: 1rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ccc;
}

.chatbox {
    height: 50vh;
    overflow-y: scroll;
    background-color: #f7dfdf;
    border-radius: 5px;
    display: flex;
    flex-direction: column-reverse;
    padding: 1rem;
}

.message {
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 4px;
}

.client {
    align-self: flex-start;
    background-color: #fdff8f;
}

.admin {
    align-self: flex-end;
    background-color: #ffffff;
}

.input-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
}

input[type="text"] {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

</style>
