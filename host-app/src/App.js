import React, {Suspense} from "react";
const RemoteReactApp = React.lazy(() => import("reactApp/App"));
import RemoteReactAppVite from  "reactAppVite/App";
import {Button} from  "reactAppVite/Button";
const RemoteVueApp = React.lazy(() => import('./WrappedVue'));

const App = () => {
  return (
    <div>
      <div style={{
        margin:"10px",
        padding:"10px",
        textAlign:"center",
        backgroundColor:"",
        outline: '5px solid red'
      }}>
        <h1>App Shell</h1>
        <div style={{display: "flex", gap: "8px", justifyContent: 'center'}}>
        {/* <Button onClick={increment}>increment</Button>
        <Button onClick={decrement}>decrement</Button> */}
        </div>
       
        <div style={{
        margin:"10px",
        padding:"10px",
        textAlign:"center",
        backgroundColor:"pink",
        outline: '5px solid blue'
      }}>
        <Suspense fallback={"loading..."}>
        <RemoteReactApp/>
        <RemoteVueApp/>
        <RemoteReactAppVite/>
        {/* <h3>Counter: {counter}</h3> */}
      </Suspense>
        </div>
      </div>
     
    </div>)
}


export default App;
