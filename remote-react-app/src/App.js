import React, { Suspense } from "react";
import {$counter,createApi} from 'store/Counter';
// import Button from "./components/Button";
import {Button} from 'reactAppVite/Button'
import { useUnit } from 'effector-react';
// import ReactApp from 'reactAppVite/App'

const App = () => {
    const counter = useUnit($counter);
  const { increment, decrement } = createApi($counter, {
    increment: state => state + 1,
    decrement: state => state - 1,
  });

  console.log('counter', counter)

  return (
    <div style={{
      margin: "10px",
      padding:"10px",
      textAlign:"center",
      backgroundColor:"cyan",
      outline: '5px solid yellow'
    }}>
      <h1 >Remote React app by webpack</h1>
     <div style={{display: "flex", gap: "8px", justifyContent: 'center'}}>
     <Button onClick={increment}>increment</Button>
     <Button onClick={decrement}>decrement</Button>
      </div>
      <div>
        {counter}
      </div>
      
    </div>
  )
}

export default App;

