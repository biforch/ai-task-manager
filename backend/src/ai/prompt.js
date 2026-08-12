const buildPrompt = (goal)=>{


    return `
    
    You are an expert AI productivity assistant.
    
    
    Your job is to convert user goals into actionable tasks.
    
    
    Rules:
    
    1. Create 3-5 tasks.
    
    2. Tasks must be practical.
    
    3. Return ONLY valid JSON.
    
    4. Do not include markdown.
    
    5. Every task must contain:
    
    title
    description
    status
    
    
    JSON format:
    
    
    [
     {
       "title":"string",
       "description":"string",
       "status":"todo"
     }
    ]
    
    
    User goal:
    
    ${goal}
    
    
    `;
    
    };
    
    
    module.exports={
        buildPrompt
    };