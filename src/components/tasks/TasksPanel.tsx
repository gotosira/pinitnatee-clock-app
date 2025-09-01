import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useState } from 'react'

type Task = { id: string; text: string; done: boolean }

function createTask(text: string): Task {
  return { id: Math.random().toString(36).slice(2), text, done: false }
}

export function TasksPanel() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])
  const [text, setText] = useState('')

  function addTask() {
    if (!text.trim()) return
    setTasks([...tasks, createTask(text.trim())])
    setText('')
  }

  return (
    <div className="tasks">
      <div className="tasks-header">Tasks</div>
      <div className="tasks-list">
        {tasks.map((t) => (
          <label key={t.id} className={`task ${t.done ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() =>
                setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
              }
            />
            <span className="text">{t.text}</span>
            <button
              className="ghost small"
              onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
            >
              ✕
            </button>
          </label>
        ))}
      </div>
      <div className="tasks-input">
        <input
          value={text}
          placeholder="New task"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button className="ghost" onClick={addTask}>
          Add
        </button>
      </div>
    </div>
  )
}

export default TasksPanel


