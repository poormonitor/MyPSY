<script setup>
import { ref, reactive, onActivated } from "vue"
import { useRoute, useRouter } from "vue-router";
import axios from "axios"
import swal from "sweetalert"
import { useAnswerSheet } from "../stores/answer"
const route = useRoute()
const router = useRouter()
const answerSheet = useAnswerSheet()

const loadReady = ref(false);
const testContent = reactive({ data: { problems: [] } })
const userOption = reactive([])
const currentPage = ref(0)

const fetchData = () => {
    userOption.length = 0
    axios.get('./tests/' + route.params.id + ".json")
        .then(function (response) {
            testContent.data = response.data
            if (answerSheet.answer.length && route.params.id == answerSheet.testContent.id) {
                for (let i = 0; i < answerSheet.answer.length; i++) {
                    userOption[i + 1] = answerSheet.answer[i]
                }
                currentPage.value = testContent.data.problems.length - 1
            }
            loadReady.value = true;
        })
        .catch(function (error) {
            swal("错误发生了", error, "error").then(() => {
                router.push({ name: "home" })
            })
        })
}

onActivated(() => {
    currentPage.value = 0
    loadReady.value = false
    fetchData()
})

const clickOption = (event) => {
    const order = event.target.dataset.order
    const option = event.target.dataset.option
    userOption[order] = option
    if (currentPage.value + 1 != testContent.data.problems.length) {
        setTimeout(() => { currentPage.value++ }, 200)
    }
}

const submitTest = () => {
    // check if the test is completed
    for (var i = 1; i <= testContent.data.problems.length; i++) {
        if (!(i in userOption)) {
            swal("还有题目没完成", "问题 " + i + " 没有完成，请完成后提交", "info")
                .then(() => {
                    currentPage.value = i - 1
                })
            return;
        }
    }

    answerSheet.initAnswer(userOption, testContent.data)
    router.push({ name: "result" })
}

const nextProblem = () => {
    if (currentPage.value + 1 != testContent.data.problems.length) {
        currentPage.value++
    }
}

const lastProblem = () => {
    if (currentPage.value != 0) {
        currentPage.value--
    }
}

const lastUnfinishedProblem = () => {
    for (var i = 1; i <= testContent.data.problems.length; i++) {
        if (!(i in userOption)) {
            currentPage.value = i - 1
            return
        }
    }
}

const hasUnfinishedProblem = () => {
    for (var i = 1; i <= testContent.data.problems.length; i++) {
        if (!(i in userOption)) {
            return true
        }
    }
    return false
}
</script>

<template>
    <div class="bg-gradient-to-tl from-orange-200 to-yellow-50 min-h-full overflow-hidden">
        <div class="lg:my-20 lg:mx-24 md:my-14 md:mx-16 my-12 mx-10">
            <div id="testSheet" v-if="loadReady">
                <div id="title" class="mt-16">
                    <div class="tracking-wide">
                        <router-link to="/" class="text-sky-800 hover:text-sky-900 transition ease-in-out">返回首页
                        </router-link>
                    </div>
                    <div class="text-3xl my-3 tracking-widest text-amber-800">您正在完成</div>
                    <div class="text-6xl my-3 font-bold">{{ testContent.data.name }}</div>
                </div>
                <div id="direction" class="mt-12 text-xl">
                    {{ testContent.data.direction }}
                </div>
                <div id="problems" class="mt-16">
                    <div class="backdrop-blur-xl bg-white/75 shadow-xl p-10 md:my-5 my-8 rounded-3xl"
                        id="currentProblem">
                        <p class="font-mono text-lg font-semibold">{{ currentPage + 1 }}</p>
                        <p class="text-3xl mt-3 mb-8">{{ testContent.data.problems[currentPage] }}</p>
                        <div id="option"
                            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-x-8 gap-y-3 mt-6">
                            <div v-for="optionIndex in testContent.data.answers.length"
                                class="text-center rounded-lg border-2 p-1 border-amber-500 transition ease-in-out text-lg select-none cursor-pointer hover:bg-orange-50"
                                :class="{ 'optionActive': userOption[currentPage + 1] == optionIndex }"
                                :data-order="currentPage + 1" :data-option="optionIndex" @click="clickOption">
                                {{ testContent.data.answers[optionIndex - 1] }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-8 flex space-x-3 justify-center">
                    <button
                        class="text-xl inline-block px-6 py-2 bg-orange-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-lg disabled:bg-zinc-800 transition duration-150 ease-in-out"
                        type="button" @click="lastProblem" :disabled="currentPage == 0">
                        上一题
                    </button>
                    <button
                        class="text-xl inline-block px-6 py-2 bg-orange-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-lg disabled:bg-zinc-800 transition duration-150 ease-in-out"
                        type="button" @click="lastUnfinishedProblem" :disabled="!hasUnfinishedProblem()">
                        未做
                    </button>
                    <button
                        class="text-xl inline-block px-6 py-2 bg-orange-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-lg disabled:bg-zinc-800 transition duration-150 ease-in-out"
                        type="button" @click="nextProblem"
                        :disabled="currentPage + 1 == testContent.data.problems.length">
                        下一题
                    </button>
                </div>
                <div class="mt-6 mb-12 flex space-x-2 justify-center">
                    <button
                        class="text-xl inline-block px-8 py-3 bg-lime-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-lime-600 hover:shadow-lg focus:bg-lime-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-lime-700 active:shadow-lg disabled:bg-zinc-800 transition duration-150 ease-in-out"
                        type="button" @click="submitTest"
                        :disabled="currentPage + 1 != testContent.data.problems.length">
                        提交
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>