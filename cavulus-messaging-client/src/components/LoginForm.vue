<template>
    <div>
        <h1>Login</h1>
        <form @submit.prevent="login">
            <div>
                <label for="email">Email:</label>
                <input v-model="loginData.email" type="email" id="email" />
            </div>
            <div>
                <label for="password">Password:</label>
                <input v-model="loginData.password" type="password" id="password" />
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

export default {
    data() {
        return {
            loginData: {
                email: '',
                password: '',
            },
        };
    },
    methods: {
        login() {
            const { email, password } = this.loginData;
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    this.$emit('login-success');
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
};
</script>
