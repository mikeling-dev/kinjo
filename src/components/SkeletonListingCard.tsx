import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function SkeletonListingCard() {
  return (
    <Card className="flex flex-col w-60 h-64 min-w-60 space-y-2 pt-0 shadow-xl">
      <Skeleton className="h-36 w-full rounded-none rounded-t-xl top-0" />
      <div className="space-y-2 w-full px-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-1/5" />
      </div>
    </Card>
  );
}
