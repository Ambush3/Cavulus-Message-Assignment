<template>
    <div class="form-container">
        <h1>Register</h1>
        <form @submit.prevent="register" class="form">
            <div class="form-group">
                <label for="name">Name:</label>
                <input v-model="registration.name" type="text" id="name" class="input-field" />
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input v-model="registration.email" type="email" id="email" class="input-field" />
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input v-model="registration.password" type="password" id="password" class="input-field" />
            </div>
            <button type="submit" class="submit-button">Register</button>
        </form>
    </div>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile, getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

export default {
    props: {
        auth: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            registration: {
                name: '',
                email: '',
                password: '',
            },
        };
    },
    methods: {
        register() {
            const { email, password, name } = this.registration;
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    updateProfile(user, { displayName: name })
                        .then(() => {
                            const data = {
                                name,
                                seen: false,
                                createdAt: serverTimestamp(),
                            };
                            addDoc(collection(db, 'documents'), data)
                                .then(() => {
                                    this.$emit('register-success');
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
};
</script>

<style scoped>
.form-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f2f2f2;
    border-radius: 5px;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

.form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 15px;
}

label {
    font-weight: bold;
}

.input-field {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.submit-button {
    padding: 10px;
    background-color: #0045c4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>