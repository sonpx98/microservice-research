import "./App.css";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button.tsx";

function App() {
  return (
    <SideBar>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button>Click me</Button>
    </SideBar>
  );
}

export default App;
