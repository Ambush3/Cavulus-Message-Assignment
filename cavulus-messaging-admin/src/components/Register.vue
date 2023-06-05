<template>
    <div class="register-container">
        <h1>Register</h1>
        <!-- Add your registration form here -->
        <form @submit.prevent="register">
            <!-- Form inputs for name, email, and password -->
            <input type="text" v-model="name" placeholder="Name" required>
            <input type="email" v-model="email" placeholder="Email" required>
            <input type="password" v-model="password" placeholder="Password" required>
            <!-- Register button -->
            <button type="submit">Register</button>
        </form>
        <!-- Add your login link/button here -->
        <div>
            Already have an account? <router-link to="/login">Login</router-link>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            name: '',
            email: '',
            password: ''
        };
    },
    methods: {
        register() {
            // Implement your registration logic here
        }
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px;
}
</style>
