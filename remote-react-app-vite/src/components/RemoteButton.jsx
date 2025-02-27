
import "./Button.css"

export const Button = ({children, ...props}) => {
  console.debug('props', props)
  return (
    <div>
      <button id='click-btn' className='shared-btn' {...props}>
        Remote Button from React App by Vite<br />
        {children}
        </button>
    </div>
  )
}

export default Button