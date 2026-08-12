import { useState } from "react";
import axios from "axios";


function AIGenerator({ onGenerated }) {


    const [goal,setGoal] = useState("");

    const [loading,setLoading] = useState(false);



    const generateTasks = async()=>{


        if(!goal){
            return;
        }


        try{


            setLoading(true);


            await axios.post(
                "http://localhost:3000/api/ai/generate",
                {
                    goal
                }
            );


            setGoal("");


            if(onGenerated){

                onGenerated();

            }


        }
        catch(error){

            console.error(
                "AI generate failed:",
                error
            );

        }
        finally{

            setLoading(false);

        }


    };



    return (

        <div className="ai-generator">


            <h2>
                AI Task Planner
            </h2>


            <input

                value={goal}

                onChange={
                    e=>setGoal(e.target.value)
                }

                placeholder="例如：30天学会React"

            />


            <button
                onClick={generateTasks}
                disabled={loading}
            >

                {
                    loading
                    ?
                    "Generating..."
                    :
                    "Generate Tasks"
                }

            </button>


        </div>

    );


}


export default AIGenerator;