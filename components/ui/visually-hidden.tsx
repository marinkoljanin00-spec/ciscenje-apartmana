import * as React from "react"

export function VisuallyHidden({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        overflow: "hidden",
        position: "absolute",
        bottom: "0",
        left: "0",
        whiteSpace: "nowrap",
        width: "1px",
      }}
    >
      {children}
    </div>
  )
}
