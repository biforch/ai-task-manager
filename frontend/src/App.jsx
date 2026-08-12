import { useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";


function App() {

  const [refresh, setRefresh] = useState(0);


  return (

    <div>

      <h1>
        AI Task Manager
      </h1>


      <TaskForm
        onCreated={() => {
          setRefresh(refresh + 1);
        }}
      />


      <TaskList
        refresh={refresh}
      />

    </div>

  );
}


export default App;