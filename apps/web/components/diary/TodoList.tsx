'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Todo {
  id: string
  text: string
  completed: boolean
}

interface TodoListProps {
  userId: string
  date: string
  initialTodos?: Todo[]
}

export function TodoList({ userId, date, initialTodos = [] }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Fetch todos if date changes or initialTodos is empty (and we expect data)
  useEffect(() => {
    setTodos(initialTodos)
  }, [initialTodos])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const tempId = Math.random().toString()
    const todoText = newTodo.trim()
    
    // Optimistic update
    const optimisticTodo = { id: tempId, text: todoText, completed: false }
    setTodos([...todos, optimisticTodo])
    setNewTodo('')

    try {
      const { data, error } = await (supabase
        .from('todos') as any)
        .insert({
          user_id: userId,
          date: date,
          text: todoText,
          completed: false
        })
        .select()
        .single()

      if (error) throw error

      // Replace temp ID with real ID
      setTodos(prev => prev.map(t => t.id === tempId ? data : t))
    } catch (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add task')
      setTodos(prev => prev.filter(t => t.id !== tempId))
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t))

    try {
      const { error } = await (supabase
        .from('todos') as any)
        .update({ completed })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error toggling todo:', error)
      toast.error('Failed to update task')
      // Revert
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
    }
  }

  const deleteTodo = async (id: string) => {
    // Optimistic update
    const prevTodos = todos
    setTodos(prev => prev.filter(t => t.id !== id))

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('Failed to delete task')
      setTodos(prevTodos)
    }
  }

  const loadTemplate = async () => {
    const template = [
      "Drink 3L of water 💧",
      "Eat 30g protein at breakfast 🍳",
      "Walk 8,000 steps 🚶",
      "No screens 1h before bed 📵",
      "Sleep 7+ hours 😴"
    ]

    setLoading(true)
    try {
      const newTodos: Todo[] = []
      for (const text of template) {
        // Check if already exists to avoid duplicates
        if (todos.some(t => t.text === text)) continue

        const { data, error } = await (supabase
          .from('todos') as any)
          .insert({
            user_id: userId,
            date: date,
            text: text,
            completed: false
          })
          .select()
          .single()
        
        if (error) throw error
        if (data) newTodos.push(data)
      }
      
      setTodos(prev => [...prev, ...newTodos])
      toast.success('FitJourney template loaded!')
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">To-Do List</h3>
        <span className="text-sm text-muted-foreground">
          {todos.filter(t => t.completed).length}/{todos.length}
        </span>
      </div>

      <form onSubmit={addTodo} className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newTodo.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {todos.length === 0 && (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              No tasks yet. Start fresh or use a template!
            </p>
            <Button variant="outline" size="sm" onClick={loadTemplate} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Load FitJourney Template 🚀
            </Button>
          </div>
        )}
        
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={cn(
              "group flex items-center justify-between p-3 rounded-lg border bg-card transition-all hover:shadow-sm",
              todo.completed && "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => toggleTodo(todo.id, !todo.completed)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  todo.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground hover:bg-muted"
                )}
              >
                {todo.completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <span
                className={cn(
                  "text-sm font-medium truncate transition-all",
                  todo.completed && "text-muted-foreground line-through"
                )}
              >
                {todo.text}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => deleteTodo(todo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
