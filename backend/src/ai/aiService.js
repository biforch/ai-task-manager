const generateAIResponse = (goal) => {

    return [
        {
            title: `Understand ${goal}`,
            description: "Learn the basic concepts",
            status: "todo"
        },
        {
            title: `Practice ${goal}`,
            description: "Build a small project",
            status: "todo"
        },
        {
            title: `Review ${goal}`,
            description: "Summarize and improve knowledge",
            status: "todo"
        }
    ];

};


module.exports = {
    generateAIResponse
};