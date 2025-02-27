// import {$counter,createApi} from 'store/Counter';
import {Button} from '../src/components/RemoteButton'


const App = () => {
  // const { increment, decrement } = createApi($counter, {
  //   increment: state => state + 1,
  //   decrement: state => state - 1,
  // });
  
  return (
    <div style={{
      margin: "10px",
      padding:"10px",
      textAlign:"center",
      backgroundColor:"cyan",
            outline: '5px solid yellow'
    }}>
      <h1 >Remote React App by vite</h1>

      <div style={{display: "flex", gap: "8px", justifyContent: 'center'}}>
     {/* <Button onClick={increment}>increment</Button>
     <Button onClick={decrement}>decrement</Button> */}
      </div>
    </div>
  )
}

export default App;

