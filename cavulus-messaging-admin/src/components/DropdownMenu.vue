<template>
    <div class="dropdown">
        <div class="dropdown-toggle" @click="toggleDropdown">
            <i class="fas fa-ellipsis-h"></i>
        </div>
        <div class="dropdown-menu" :class="{ show: showDropdown }">
            <a class="dropdown-item" @click="$emit('delete-chat')">Delete</a>
            <a class="dropdown-item" @click="$emit('archive-chat')">Archive</a>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showDropdown: false,
        };
    },
    methods: {
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
    },
};
</script>

<style>
.dropdown-toggle {
    align-items: center;
    cursor: pointer;
}

.dropdown-menu {
    position: absolute;
    right: 0;
    z-index: 100;
    display: none;
}

.show {
    display: block;
}

.dropdown-item {
    cursor: pointer;
}
</style>

