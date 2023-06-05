<template>
    <div class="login-form">
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="loginData.email" placeholder="Enter your email" />
        </div>
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="loginData.password" placeholder="Enter your password" />
        </div>
        <button class="login-button" @click="login">Login</button>
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

<style>
.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.form-group {
    margin-bottom: 10px;
}

label {
    font-weight: bold;
}

input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 250px;
}

.login-button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.login-button:hover {
    background-color: #0056b3;
}

@media screen and (max-width: 768px) {
    input {
        width: 100%;
    }
}
</style>
