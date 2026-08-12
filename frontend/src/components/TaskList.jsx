import { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import TaskCard from "./TaskCard";


function TaskList({ refresh }) {

  const [tasks, setTasks] = useState([]);


  useEffect(() => {
    loadTasks();
  }, [refresh]);


  const loadTasks = async () => {
    try {

      const response = await getTasks();

      setTasks(response.data);

    } catch (error) {

      console.error(
        "Failed to load tasks:",
        error
      );

    }
  };


  return (

    <div className="task-list">

      {tasks.map((task) => (

        <TaskCard
          key={task.id}
          task={task}
        />

      ))}

    </div>

  );
}


export default TaskList;