<template>
    <router-view v-slot="{ Component }">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </router-view>
</template>

<style>
html,
body,
div#app {
    height: 100%;
    width: 100%;
    margin: 0;
}
</style>
