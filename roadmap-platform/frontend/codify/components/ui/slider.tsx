import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    />
))
Slider.displayName = SliderPrimitive.Root.displayName

const SliderTrack = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Track>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Track
        ref={ref}
        className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Range className="absolute h-full bg-blue-600" />
    </SliderPrimitive.Track>
))
SliderTrack.displayName = SliderPrimitive.Track.displayName

const SliderThumb = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Thumb>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Thumb
        ref={ref}
        className={cn(
            "block h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            className
        )}
        {...props}
    />
))
SliderThumb.displayName = SliderPrimitive.Thumb.displayName

// For simplicity in the onboarding code which uses <Slider /> directly
const SliderComponent = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100">
            <SliderPrimitive.Range className="absolute h-full bg-blue-600" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
))
SliderComponent.displayName = "Slider"

export { SliderComponent as Slider }
