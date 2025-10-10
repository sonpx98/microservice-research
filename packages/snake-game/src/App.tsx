import { useState, useEffect, useCallback } from 'react'
import './App.css'

// Constants cho game
const BOARD_SIZE = 15 // Grid 15x15
const INITIAL_SNAKE = [{ x: 7, y: 7 }] // Vị trí giữa board
const INITIAL_FOOD = { x: 10, y: 10 }
const INITIAL_DIRECTION = { x: 1, y: 0 } // Di chuyển sang phải
const GAME_SPEED = 200 // milliseconds

type Position = { x: number; y: number }
type Direction = { x: number; y: number }

function App() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Tạo vị trí mới cho thức ăn (random)
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    }
    return newFood
  }, [])

  // Reset game về trạng thái ban đầu
  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(INITIAL_DIRECTION)
    setIsGameOver(false)
    setScore(0)
    setIsPlaying(false)
  }

  // Bắt đầu/dừng game
  const toggleGame = () => {
    if (isGameOver) {
      resetGame()
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  // Logic di chuyển snake
  const moveSnake = useCallback(() => {
    if (!isPlaying || isGameOver) return

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }
      
      // Tính vị trí mới của đầu snake
      head.x += direction.x
      head.y += direction.y

      // Kiểm tra va chạm với tường
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setIsGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      // Kiểm tra va chạm với chính mình
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      // Thêm đầu mới vào snake
      newSnake.unshift(head)

      // Kiểm tra ăn thức ăn
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood())
        // Không bỏ đuôi để snake lớn lên
      } else {
        // Bỏ đuôi để snake di chuyển
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, isPlaying, isGameOver, generateFood])

  // Game loop - chạy moveSnake theo interval
  useEffect(() => {
    if (!isPlaying || isGameOver) return

    const gameInterval = setInterval(moveSnake, GAME_SPEED)
    return () => clearInterval(gameInterval)
  }, [moveSnake, isPlaying, isGameOver])

  // Xử lý input từ bàn phím
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 })
          break
        case ' ':
          e.preventDefault()
          setIsPlaying(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, isPlaying])

  // Render game board
  const renderBoard = () => {
    const board = []
    
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellClass = 'cell'
        
        // Kiểm tra xem ô này có phải là snake không
        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y)
        const isFood = food.x === x && food.y === y
        
        if (isSnakeHead) {
          cellClass += ' snake-head'
        } else if (isSnakeBody) {
          cellClass += ' snake-body'
        } else if (isFood) {
          cellClass += ' food'
        }
        
        board.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
          />
        )
      }
    }
    
    return board
  }

  return (
    <div className="game-container">
      <h1>🐍 Snake Game MVP</h1>
      
      <div className="game-info">
        <div className="score">Score: {score}</div>
        <div className="controls">
          <button onClick={toggleGame} className="control-btn">
            {isGameOver ? 'Restart' : isPlaying ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>

      {isGameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
        </div>
      )}

      <div className="game-board">
        {renderBoard()}
      </div>

      <div className="instructions">
        <h3>How to Play:</h3>
        <p>• Use arrow keys to control the snake</p>
        <p>• Eat the red food to grow and score points</p>
        <p>• Don't hit the walls or yourself!</p>
        <p>• Press Space to pause/resume</p>
      </div>
    </div>
  )
}

export default App