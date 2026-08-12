const {
    buildPrompt
}=require("./prompt");


const {
    askAI
}=require("./llmService");




async function generateAIResponse(goal){


    const prompt =
        buildPrompt(goal);



    const result =
        await askAI(prompt);



    return JSON.parse(result);


}



module.exports={
    generateAIResponse
};