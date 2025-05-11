// drawingStore.ts
import { isDate } from 'node:util/types'
import { create } from 'zustand'

interface DrawingState {
    isDrawing: boolean
    history: any[]
    step: number
    strokes: any[]
    currentStroke: any[]
    setIsDrawing: (isDrawing: boolean) => void
    setCurrentStroke: (currentStroke: any[]) => void
    setStrokes: (strokes: any[]) => void
    push: (stroke: any) => void
    undo: () => void
    redo: () => void
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
    isDrawing: false,
    history: [],
    step: 0,
    strokes: [],
    currentStroke: [],
    setIsDrawing: (isDrawing) => {
        set({ isDrawing })
    },
    setCurrentStroke: (currentStroke) => {
        set({ currentStroke })
    },
    setStrokes: (strokes) => {
        set({ strokes })
    }, // placeholder; you'll inject it
    push: (stroke) => {
        const { history, step } = get()
        const newHistory = [...history.slice(0, step), stroke]
        set({ history: newHistory, step: step + 1 })
    },
    undo: () => {
        const { step, history, setStrokes } = get()
        if (step === 0) return
        const newStep = step - 1
        set({ step: newStep })
        setStrokes(history.slice(0, newStep))
    },
    redo: () => {
        const { step, history, setStrokes } = get()
        if (step === history.length) return
        const newStep = step + 1
        set({ step: newStep })
        setStrokes(history.slice(0, newStep))
    },
}))
