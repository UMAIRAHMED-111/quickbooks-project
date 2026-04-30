import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

type SquarePlotFrameProps = {
  children: ReactNode;
};

/**
 * Square plot area so four invoice charts align cleanly in one row (xl+).
 */
export function SquarePlotFrame({ children }: SquarePlotFrameProps) {
  return (
    <div className="mx-auto aspect-square w-full max-w-[200px] xl:max-w-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
