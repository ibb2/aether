import { CanvasPathSchema } from '@/db/schema'

interface RawCanvasPath {
    drawMode?: boolean
    startTimestamp?: number
    endTimestamp?: number
    paths?: Array<{ x: number; y: number }>
    strokeColor?: string
    strokeWidth?: number
}

/**
 * This function is responsible for transforming the canvas paths into a
 * format that can be saved in the database.
 *
 * @param data RawCanvasPath[]
 * @returns CanvasPathSchema[]
 */
export const convertCanvasPathsForDatabase = (
    data: RawCanvasPath[]
): CanvasPathSchema[] => {
    /* 
        This function is responsible for transforming the canvas paths into a 
        format that can be saved in the database
        */
    return data.map((path: RawCanvasPath) => ({
        drawMode: path.drawMode ?? false,
        startTimestamp: path.startTimestamp ?? 0,
        endTimestamp: path.endTimestamp ?? 0,
        paths:
            path.paths?.map((p: { x: number; y: number }) => ({
                x: p.x,
                y: p.y,
            })) ?? [],
        strokeColor: path.strokeColor ?? '',
        strokeWidth: path.strokeWidth ?? 1,
    }))
}
