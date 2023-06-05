<template>
    <div class="form-container">
        <h1>Login</h1>
        <form @submit.prevent="login" class="form">
            <div class="form-group">
                <label for="email">Email:</label>
                <input v-model="loginData.email" type="email" id="email" class="input-field" />
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input v-model="loginData.password" type="password" id="password" class="input-field" />
            </div>
            <button type="submit" class="submit-button">Login</button>
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