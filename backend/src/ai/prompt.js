const buildPrompt = (goal)=>{

    return `
You are an AI task planning assistant.

User goal:

${goal}

Generate structured tasks.
`;

};


module.exports={
    buildPrompt
};