import { Loader2 } from "lucide-react";
import { MotionButton } from "./motion";

interface LoadMoreButtonProps {
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    loadMore: (numItems: number) => void;
    numItems?: number;
}

export function LoadMoreButton({ status, loadMore, numItems = 20 }: LoadMoreButtonProps) {
    if (status === "Exhausted" || status === "LoadingFirstPage") {
        return null;
    }

    return (
        <div className="flex justify-center py-4">
            <MotionButton
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm
                           hover:bg-slate-200 transition-colors flex items-center gap-2
                           border border-slate-200 shadow-sm"
                onClick={() => loadMore(numItems)}
                disabled={status === "LoadingMore"}
            >
                {status === "LoadingMore" ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Loading...
                    </>
                ) : (
                    "Load More"
                )}
            </MotionButton>
        </div>
    );
}
