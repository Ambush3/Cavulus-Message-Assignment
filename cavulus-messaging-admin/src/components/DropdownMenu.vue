<template>
    <div class="dropdown" ref="dropdown">
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
    mounted() {
        document.addEventListener("click", this.handleClickOutside);
    },
    destroyed() {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        handleClickOutside(event) {
            if (
                this.showDropdown &&
                !this.$refs.dropdown.contains(event.target)
            ) {
                this.showDropdown = false;
            }
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
    right: 10;
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
