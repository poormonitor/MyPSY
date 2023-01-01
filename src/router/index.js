import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("../views/Home.vue"),
        },
        {
            path: "/test/:id",
            name: "test",
            component: () => import("../views/Test.vue"),
        },
        {
            path: "/result",
            name: "result",
            component: () => import("../views/Result.vue"),
        },
    ],
});

export default router;
