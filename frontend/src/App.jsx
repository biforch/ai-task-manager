import { useState } from "react";

import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import AIGenerator from "./components/AIGenerator";


function App() {


  const [refresh, setRefresh] = useState(0);



  const reloadTasks = () => {

    setRefresh(refresh + 1);

  };



  return (

    <div>


      <h1>AI Task Manager</h1>



      <TaskForm
        onCreated={reloadTasks}
      />



      <AIGenerator
        onGenerated={reloadTasks}
      />



      <TaskList
        refresh={refresh}
      />


    </div>

  );

}


export default App;