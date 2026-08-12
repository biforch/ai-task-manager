import { useEffect, useState } from "react";

import { getTasks } from "../api/tasks";

import TaskCard from "./TaskCard";

import axios from "axios";



function TaskList({ refresh }) {


  const [tasks, setTasks] = useState([]);



  useEffect(() => {

    loadTasks();

  }, [refresh]);




  const loadTasks = async () => {


    try {


      const response = await getTasks();


      setTasks(response.data);


    } catch(error) {


      console.error(
        "Failed to load tasks:",
        error
      );


    }


  };





  const onUpdate = async (id, data) => {


    try {


      await axios.put(

        `http://localhost:3000/api/tasks/${id}`,

        data

      );



      loadTasks();



    } catch(error) {


      console.error(

        "Failed update task:",

        error

      );


    }


  };






  return (

    <div className="task-list">


      {
        tasks.map((task)=>(


          <TaskCard

            key={task.id}

            task={task}

            onUpdate={onUpdate}


          />


        ))
      }


    </div>

  );


}



export default TaskList;