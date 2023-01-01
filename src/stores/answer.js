import { defineStore } from "pinia";

export const useAnswerSheet = defineStore("answer", {
    persist: {
        storage: window.sessionStorage,
    },
    state: () => ({
        answer: [],
        testContent: {},
    }),
    actions: {
        initAnswer(ans, test) {
            for (var i = 0; i < Object.keys(ans).length; i++) {
                this.answer[i] = ans[i + 1];
            }
            this.testContent = test;
        },
    },
});
