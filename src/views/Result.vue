<script setup>
import { ref, reactive, onActivated } from "vue"
import { useRoute, useRouter } from "vue-router";
import swal from "sweetalert"
import { useAnswerSheet } from "../stores/answer"
import axios from "axios";
const route = useRoute()
const router = useRouter()
const answerSheet = useAnswerSheet()
const resultSheet = reactive([])
const sumSheet = reactive([])
const testContent = reactive({ data: { res: { list: [], group: [] }, name: "" } })
const dangerList = reactive([])
const testAnswered = ref(false);

onActivated(() => {
    if (answerSheet.testContent.id === undefined) {
        swal("您没有完成的答卷", "您没有完成的答卷，因此无法展示结果", "error").then(() => {
            router.push({ name: "home" })
        })
        return
    }

    testContent.data = answerSheet.testContent

    let res = testContent.data.res
    let factor = testContent.data.factor

    // calculate score
    for (var i = 0; i < res.list.length; i++) {
        let factorScore = 0
        for (var p = 0; p < res.problem[i].length; p++) {
            let problem_id = res.problem[i][p] - 1
            factorScore += factor[res.factorUsed[i]][problem_id][0] * factor[res.factorUsed[i]][problem_id][1][answerSheet.answer[problem_id] - 1]
        }
        resultSheet[i] = factorScore % 1 === 0 ? factorScore : factorScore.toFixed(2)
        dangerList.push(Function("return " + factorScore + res.danger[i])())
    }
    // calculate sum
    for (var i = 0; i < res.list.length; i++) {
        let factorScore = 0
        for (var p = 0; p < res.problem[i].length; p++) {
            let problem_id = res.problem[i][p] - 1
            factorScore += factor[res.factorUsed[i]][problem_id][0] * Math.max(...factor[res.factorUsed[i]][problem_id][1])
        }
        sumSheet[i] = factorScore % 1 === 0 ? factorScore : factorScore.toFixed(2)
    }

    testAnswered.value = true

    if (import.meta.env.VITE_API_URL) {
        axios.post(import.meta.env.VITE_API_URL + "/psytest.php", {
            id: testContent.data.id,
            answer: answerSheet.answer,
            result: resultSheet
        })
    }
})

</script>

<template>
    <div class="bg-gradient-to-tl from-pink-200 to-rose-50 min-h-full overflow-hidden">
        <div class="lg:mx-24 md:mx-16 mx-10">
            <div class="content" v-if="testAnswered">
                <div id="title" class="mt-10 lg:mt-16">
                    <div class="tracking-wide">
                        <router-link to="/" class="text-sky-800 hover:text-sky-900 transition ease-in-out">返回首页
                        </router-link>
                    </div>
                    <div class="text-xl lg:text-3xl my-1 lg:my-3 tracking-widest text-rose-800">您完成了</div>
                    <div class="text-4xl lg:text-6xl my-1 lg:my-3 font-bold">{{ testContent.data.name }}</div>
                </div>
                <div id="score" class="mt-8 lg:mt-10">
                    <div v-for="gp in testContent.data.res.group.list.length"
                        class="backdrop-blur-xl bg-white/50 shadow-2xl p-8 my-6 lg:my-12 rounded-3xl transition ease-in-out duration-300">
                        <span class="text-xl lg:text-3xl font-bold">{{ testContent.data.res.group.list[gp - 1] }}</span>
                        <div class="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-x-8 lg:gap-y-4 mt-4 lg:mt-8 lg:mb-4 md:mx-3 lg:mx-6">
                            <div v-for="rs in testContent.data.res.group.res[gp - 1].length"
                                class="backdrop-blur-xl shadow-xl p-4 lg:p-8 my-1.5 lg:my-3 rounded-3xl transition ease-in-out hover:-translate-y-1 hover:scale-105 duration-300"
                                :class="{
                                    'bg-gradient-to-r from-red-600 to-orange-600 text-white': dangerList[testContent.data.res.group.res[gp - 1][rs - 1]],
                                    'bg-gradient-to-r from-green-600 to-green-500 text-white': !dangerList[testContent.data.res.group.res[gp - 1][rs - 1]]
                                }">
                                <p class="lg:text-lg">
                                    {{
                                    testContent.data.res.list[testContent.data.res.group.res[gp - 1][rs - 1]]
                                    }}
                                </p>
                                <div>
                                    <span class="text-lg lg:text-2xl font-semibold">
                                        {{ resultSheet[testContent.data.res.group.res[gp - 1][rs - 1]] }}
                                    </span>
                                    <span class="text-md lg:text-xl">
                                        / {{ sumSheet[testContent.data.res.group.res[gp - 1][rs - 1]] }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="backdrop-blur-xl bg-white/50 shadow-2xl p-8 my-6 lg:my-12 rounded-3xl transition ease-in-out duration-300">
                        <span class="text-xl lg:text-3xl font-bold">分析提示</span>
                        <p class="mt-2 lg:mt-6 text-base lg:text-lg whitespace-pre-line">{{ testContent.data.res.help }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>