import { Skeleton } from '@/components/ui/skeleton'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from '@/components/ui/card'

export function PricingSkeleton() {
    return (
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="flex flex-col h-full">
                    <CardHeader className="text-center pb-2">
                        <Skeleton className="h-8 w-24 mx-auto mb-7" />
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-32 mx-auto" />
                            <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                    </CardHeader>
                    <CardDescription className="text-center">
                        <Skeleton className="h-4 w-40 mx-auto" />
                    </CardDescription>
                    <CardContent className="flex-grow">
                        <ul className="mt-7 space-y-3">
                            {[1, 2, 3, 4].map((j) => (
                                <li key={j} className="flex space-x-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 flex-grow" />
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-6">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
