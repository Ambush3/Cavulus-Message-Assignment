<template>
    <div>
        <h1>Register</h1>
        <form @submit.prevent="register">
            <div>
                <label for="name">Name:</label>
                <input v-model="registration.name" type="text" id="name" />
            </div>
            <div>
                <label for="email">Email:</label>
                <input v-model="registration.email" type="email" id="email" />
            </div>
            <div>
                <label for="password">Password:</label>
                <input v-model="registration.password" type="password" id="password" />
            </div>
            <button type="submit">Register</button>
        </form>
    </div>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile, getAuth } from 'firebase/auth';
import { ref } from 'vue';

const auth = getAuth();
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
                            this.$emit('register-success');
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
