import { useState } from "react";
import { createTask } from "../api/tasks";


function TaskForm({ onCreated }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");


  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!title.trim()) {
      return;
    }


    await createTask({
      title,
      description,
      status: "todo"
    });


    setTitle("");
    setDescription("");


    onCreated();

  };


  return (

    <form className="task-form" onSubmit={handleSubmit}>

      <input
        placeholder="Task title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />


      <input
        placeholder="Description"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />


      <button type="submit">
        Create Task
      </button>


    </form>

  );
}


export default TaskForm;