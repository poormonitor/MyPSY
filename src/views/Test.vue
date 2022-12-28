<script setup>
import { ref, reactive, onActivated, computed } from "vue"
import { useRoute, useRouter } from "vue-router";
import axios from "axios"
import swal from "sweetalert"
import "animate.css"
import { useAnswerSheet } from "../stores/answer"
const route = useRoute()
const router = useRouter()
const answerSheet = useAnswerSheet()

const loadReady = ref(false)
const currentAnimation = ref(false)
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
        setTimeout(() => { nextProblem() }, 200)
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
    currentAnimation.value = "animate__fadeOutRight"
    setTimeout(() => {
        if (currentPage.value + 1 != testContent.data.problems.length) {
            currentPage.value++
        }
        currentAnimation.value = "animate__fadeInLeft"
        setTimeout(() => {
            currentAnimation.value = ""
        }, 200)
    }, 200)
}

const lastProblem = () => {
    currentAnimation.value = "animate__fadeOutLeft"
    setTimeout(() => {
        if (currentPage.value != 0) {
            currentPage.value--
        }
        currentAnimation.value = "animate__fadeInRight"
        setTimeout(() => {
            currentAnimation.value = ""
        }, 200)
    }, 200)
}

const lastUnfinishedProblem = () => {
    for (var i = 1; i <= testContent.data.problems.length; i++) {
        if (!(i in userOption)) {
            if (i - 1 > currentPage.value) {
                currentAnimation.value = "animate__backOutLeft"
                setTimeout(() => {
                    currentPage.value = i - 1
                    currentAnimation.value = "animate__backInRight"
                    setTimeout(() => {
                        currentAnimation.value = ""
                    }, 200)
                }, 200)
            } else if (i - 1 < currentPage.value) {
                currentAnimation.value = "animate__backOutRight"
                setTimeout(() => {
                    currentPage.value = i - 1
                    currentAnimation.value = "animate__backInLeft"
                    setTimeout(() => {
                        currentAnimation.value = ""
                    }, 200)
                }, 200)
            }
            return
        }
    }
}

const hasUnfinishedProblem = computed(() => {
    for (var i = 1; i <= testContent.data.problems.length; i++) {
        if (!(i in userOption)) {
            return true
        }
    }
    return false
})
</script>

<template>
    <div class="bg-gradient-to-tl from-orange-200 to-yellow-50 min-h-full overflow-hidden">
        <div class="lg:mx-24 mx-10">
            <div id="testSheet" v-if="loadReady">
                <div id="title" class="mt-10 lg:mt-16">
                    <div class="tracking-wide">
                        <router-link to="/" class="text-sky-800 hover:text-sky-900 transition ease-in-out text-sm lg:text-base">返回首页
                        </router-link>
                    </div>
                    <div class="text-xl lg:text-3xl my-1 lg:my-3 tracking-widest text-amber-800">您正在完成</div>
                    <div class="text-4xl lg:text-6xl my-1 lg:my-3 font-bold">{{ testContent.data.name }}</div>
                </div>
                <div id="direction" class="mt-4 lg:mt-6 text-sm lg:text-lg">
                    {{ testContent.data.direction }}
                </div>
                <div id="problems" class="mt-8 lg:mt-10">
                    <div class="animate__animated backdrop-blur-xl bg-white/75 shadow-xl px-10 py-8 lg:py-10 my-4 lg:my-8 rounded-3xl"
                        :class="currentAnimation" id="currentProblem">
                        <p class="font-mono">
                            <span class="lg:text-2xl font-bold">{{ currentPage + 1 }}</span>
                            <span class="text-sm lg:text-lg"> / {{ testContent.data.problems.length }}</span>
                        </p>
                        <p class="text-xl lg:text-3xl mt-3 lg:mb-8">{{ testContent.data.problems[currentPage] }}</p>
                        <div id="option"
                            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-x-8 gap-y-2 lg:gap-y-3 mt-4 lg:mt-6">
                            <div v-if="testContent.data.answers.length != testContent.data.problems.length"
                                v-for="optionIndex in testContent.data.answers[0].length"
                                class="text-sm lg:text-lg text-center rounded-lg border-2 p-1 border-amber-500 transition ease-in-out select-none cursor-pointer hover:bg-orange-100"
                                :class="{ 'optionActive': userOption[currentPage + 1] == optionIndex }"
                                :data-order="currentPage + 1" :data-option="optionIndex" @click="clickOption">
                                {{ testContent.data.answers[0][optionIndex - 1] }}
                            </div>
                            <div v-else v-for="optionIndex in testContent.data.answers[currentPage].length"
                                class="text-sm lg:text-lg text-center rounded-lg border-2 p-1 border-amber-500 transition ease-in-out select-none cursor-pointer hover:bg-orange-100"
                                :class="{ 'optionActive': userOption[currentPage + 1] == optionIndex }"
                                :data-order="currentPage + 1" :data-option="optionIndex" @click="clickOption">
                                {{ testContent.data.answers[currentPage][optionIndex - 1] }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 lg:mt-8 flex space-x-1 lg:space-x-3 justify-center">
                    <button
                        class="text-sm lg:text-xl inline-block px-3 py-1 lg:px-6 lg:py-2 bg-orange-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-lg focus:ring-offset-1 focus:ring-2 focus:ring-orange-500 disabled:bg-zinc-600 transition duration-150 ease-in-out"
                        type="button" @click="lastProblem" :disabled="currentPage == 0">
                        上一题
                    </button>
                    <button
                        class="text-sm lg:text-xl inline-block px-3 py-1 lg:px-6 lg:py-2 bg-orange-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-lg focus:ring-offset-1 focus:ring-2 focus:ring-orange-500 disabled:bg-zinc-600 transition duration-150 ease-in-out"
                        type="button" @click="lastUnfinishedProblem" :disabled="!hasUnfinishedProblem">
                        未做
                    </button>
                    <button
                        class="text-sm lg:text-xl inline-block px-3 py-1 lg:px-6 lg:py-2 bg-orange-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-lg focus:ring-offset-1 focus:ring-2 focus:ring-orange-500 disabled:bg-zinc-600 transition duration-150 ease-in-out"
                        type="button" @click="nextProblem"
                        :disabled="currentPage + 1 == testContent.data.problems.length">
                        下一题
                    </button>
                </div>
                <div class="mt-2 lg:mt-4 lg:mb-8 flex space-x-2 justify-center">
                    <button
                        class="text-md lg:text-xl inline-block px-6 py-2 lg:px-8 lg:py-3 bg-lime-500 text-white font-medium leading-tight uppercase rounded-2xl shadow-md hover:bg-lime-600 hover:shadow-lg focus:bg-lime-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-lime-700 active:shadow-lg disabled:bg-zinc-600 transition duration-150 ease-in-out"
                        type="button" @click="submitTest"
                        :disabled="hasUnfinishedProblem">
                        提交
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#currentProblem {
    --animate-duration: 0.2s;
}
</style>