const generateTasks = (goal)=>{

    return [
        {
            title:`Start ${goal}`,
            description:"First step",
            status:"todo"
        }
    ];

};


module.exports={
    generateTasks
};