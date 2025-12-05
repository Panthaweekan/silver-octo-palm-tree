import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import { Exercise } from '@/lib/api/workouts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
  const [open, setOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${search}%`)
        .order('name')
        .limit(50)
      
      if (data) setExercises(data)
      setLoading(false)
    }

    // Debounce search
    const timer = setTimeout(() => {
      fetchExercises()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, supabase])

  const handleCreateExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const muscle_group = formData.get('muscle_group') as string
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await (supabase
      .from('exercises') as any)
      .insert({
        name,
        muscle_group,
        created_by: user.id,
        is_custom: true
      })
      .select()
      .single()

    if (data) {
      onSelect(data)
      setCreateDialogOpen(false)
      setOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
           Add Exercise...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false} loop>
            <CommandInput placeholder="Search exercises..." onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>
                <div className="p-2 text-sm text-center">
                  No exercise found.
                  <Button 
                    variant="link" 
                    className="h-auto p-0 ml-1"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create &quot;{search}&quot;?
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup heading="Exercises">
                {exercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => {
                      onSelect(exercise)
                      setOpen(false)
                    }}
                  >
                    <div className="flex flex-col">
                        <span>{exercise.name}</span>
                        <span className="text-xs text-muted-foreground">{exercise.muscle_group}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Exercise</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateExercise} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ex-name">Name</Label>
                    <Input id="ex-name" name="name" defaultValue={search} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="muscle">Muscle Group</Label>
                    <Select name="muscle_group" defaultValue="other">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="chest">Chest</SelectItem>
                            <SelectItem value="back">Back</SelectItem>
                            <SelectItem value="legs">Legs</SelectItem>
                            <SelectItem value="shoulders">Shoulders</SelectItem>
                            <SelectItem value="arms">Arms</SelectItem>
                            <SelectItem value="core">Core</SelectItem>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="full_body">Full Body</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" className="w-full">Create Exercise</Button>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
