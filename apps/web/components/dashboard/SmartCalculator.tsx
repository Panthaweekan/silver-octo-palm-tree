'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ACTIVITY_LEVELS, GENDER_OPTIONS, GOAL_TYPES, Gender, GoalType } from '@/lib/constants'
import { calculateBMR, calculateTDEE, calculateCalorieTarget, calculateAge } from '@/lib/fitness-utils'
import { Calculator, Activity, Target } from 'lucide-react'

interface SmartCalculatorProps {
  userId: string
  currentData?: {
    gender?: Gender
    date_of_birth?: string
    height_cm?: number
    weight_kg?: number // Current weight from weights table or profile
    target_calories?: number
  }
  children?: React.ReactNode
}

export function SmartCalculator({ userId, currentData, children }: SmartCalculatorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Inputs, 2: Results/Confirm
  
  // Form State
  const [gender, setGender] = useState<Gender>(currentData?.gender || 'male')
  const [dob, setDob] = useState(currentData?.date_of_birth || '')
  const [height, setHeight] = useState(currentData?.height_cm?.toString() || '')
  const [weight, setWeight] = useState(currentData?.weight_kg?.toString() || '')
  const [activityLevel, setActivityLevel] = useState(ACTIVITY_LEVELS[2].value.toString())
  const [goal, setGoal] = useState<GoalType>('lose_weight')

  // Calculated Results
  const [results, setResults] = useState<{
    bmr: number
    tdee: number
    target: number
  } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  function handleCalculate() {
    if (!dob || !height || !weight) {
      toast.error('Please fill in all fields')
      return
    }

    const age = calculateAge(dob)
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const act = parseFloat(activityLevel)

    if (age < 0 || age > 120) {
      toast.error('Invalid date of birth')
      return
    }

    const bmr = calculateBMR(w, h, age, gender)
    const tdee = calculateTDEE(bmr, act)
    const target = calculateCalorieTarget(tdee, goal)

    setResults({ bmr, tdee, target })
    setStep(2)
  }

  async function handleSave() {
    setLoading(true)
    try {
      // Update profile with new target and stats
      const { error } = await supabase
        .from('profiles')
        .update({
          gender,
          date_of_birth: dob,
          height_cm: parseFloat(height),
          target_calories: results?.target,
          // We don't save weight here as it's in a separate table, 
          // but we could update the latest weight if we wanted to be thorough.
          // For now, let's just update profile settings.
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Goals updated successfully!')
      setOpen(false)
      router.refresh()
      setStep(1) // Reset for next time
    } catch (error) {
      toast.error('Failed to save goals')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Smart Calculator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Smart Calorie Calculator</DialogTitle>
          <DialogDescription>
            Calculate your daily calorie needs based on your body stats and activity level.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      {level.label} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={(v) => setGoal(v as GoalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label} ({g.adjustment > 0 ? '+' : ''}{g.adjustment} kcal)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase font-bold">BMR</div>
                <div className="text-xl font-bold text-foreground">{results?.bmr}</div>
                <div className="text-[10px] text-muted-foreground/70">kcal/day</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase font-bold">TDEE</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{results?.tdee}</div>
                <div className="text-[10px] text-muted-foreground/70">kcal/day</div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-xs text-primary uppercase font-bold">Target</div>
                <div className="text-xl font-bold text-primary">{results?.target}</div>
                <div className="text-[10px] text-primary/70">kcal/day</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="flex items-start gap-2">
                <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>
                  Based on your stats, you burn approximately <strong>{results?.tdee} kcal</strong> per day.
                  To reach your goal of <strong>{GOAL_TYPES.find(g => g.value === goal)?.label}</strong>, 
                  you should aim for <strong>{results?.target} kcal</strong> daily.
                </span>
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <Button onClick={handleCalculate} className="w-full">Calculate</Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save to Profile'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
