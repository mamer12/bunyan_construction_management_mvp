import * as React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Unified data table wrapper: consistent styling, RTL support, and horizontal scroll.
 * Use for all tabular data to keep UI consistent and avoid Arabic overflow glitches.
 */
const TableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("table-container", className)}
    {...props}
  />
));
TableContainer.displayName = "TableContainer";

interface DataTableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Optional dir override; defaults to language direction from context */
  dir?: "ltr" | "rtl";
}

const DataTable = React.forwardRef<HTMLTableElement, DataTableProps>(
  ({ className, dir: dirProp, ...props }, ref) => {
    const { dir: contextDir } = useLanguage();
    const dir = dirProp ?? contextDir;

    return (
      <table
        ref={ref}
        dir={dir}
        className={cn("data-table", className)}
        {...props}
      />
    );
  }
);
DataTable.displayName = "DataTable";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn(className)} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("text-theme-secondary font-semibold text-xs uppercase tracking-wider", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn(className)} {...props} />
));
TableCell.displayName = "TableCell";

export {
  TableContainer,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
