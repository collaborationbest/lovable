
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar = ({ percentage }: ProgressBarProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-[#454240]/80">Progression globale</span>
        <span className="text-xs font-medium text-[#B88E23] bg-[#B88E23]/10 px-2 py-0.5 rounded-full">
          {percentage}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          "h-2.5",
          "[&>div]:bg-gradient-to-r [&>div]:from-[#B88E23]/80 [&>div]:to-[#B88E23]",
          "bg-[#B88E23]/10"
        )}
      />
    </div>
  );
};

export default ProgressBar;
