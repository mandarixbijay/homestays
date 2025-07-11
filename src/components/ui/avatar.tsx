import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: React.ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-muted",
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="object-cover w-full h-full"
            onError={e => {
              if (fallback) {
                (e.target as HTMLImageElement).style.display = 'none';
              }
            }}
          />
        ) : fallback ? (
          fallback
        ) : (
          <span className="flex items-center justify-center w-full h-full text-muted-foreground text-xl font-semibold">
            {alt ? alt[0] : "?"}
          </span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar } 