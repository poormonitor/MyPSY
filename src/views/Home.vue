<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const testList = ref(0);
onMounted(() => {
    axios
        .get("./tests/index.json")
        .then((response) => {
            testList.value = response.data;
        })
        .catch(function (error) {
            swal("错误发生了", error, "error");
        });
});
const gotoTest = (event) => {
    const abbr = event.target.dataset.abbr;
    router.push({ name: "test", params: { id: abbr } });
};
</script>

<template>
    <div
        class="bg-gradient-to-br from-cyan-50 to-blue-200 min-h-full overflow-hidden"
    >
        <div class="lg:my-20 lg:mx-24 md:my-14 md:mx-16 my-12 mx-10">
            <div id="title" class="mb-6 md:mb-10 lg:mb-16">
                <div class="text-2xl lg:text-4xl my-3 tracking-widest">
                    欢迎来到
                </div>
                <div
                    class="text-4xl lg:text-6xl my-3 leading-tight font-semibold"
                >
                    MyPSY 心理评测系统
                </div>
            </div>
            <div
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 lg:gap-y-4"
            >
                <div
                    class="cursor-pointer select-none backdrop-blur-xl bg-white/75 shadow-xl p-6 lg:p-8 my-3 rounded-3xl transition ease-in-out hover:-translate-y-1 hover:scale-105 duration-300"
                    v-for="item in testList"
                    @click="gotoTest"
                    :data-abbr="item.abbr"
                >
                    <h4
                        class="text-sm lg:text-xl tracking-wide text-indigo-900/75 font-mono"
                        id="abbr"
                        :data-abbr="item.abbr"
                    >
                        {{ item.abbr }}
                    </h4>
                    <p
                        class="text-md lg:text-lg tracking-widest text-indigo-900"
                        id="description"
                        :data-abbr="item.abbr"
                    >
                        {{ item.description }}
                    </p>
                    <p
                        class="text-2xl lg:text-4xl mt-1 lg:mt-3"
                        id="name"
                        :data-abbr="item.abbr"
                    >
                        {{ item.name }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
