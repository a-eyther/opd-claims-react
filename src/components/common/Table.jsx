import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ children, className }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full border-collapse", className)}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className }) => (
  <thead className={cn("table-header", className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={cn("bg-white", className)}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, ...props }) => (
  <tr 
    className={cn("border-b border-gray-200 hover:bg-gray-50 transition-colors", className)} 
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className, sortable, onClick, ...props }) => (
  <th 
    className={cn(
      "px-3 py-2 text-left font-medium uppercase tracking-wider",
      sortable && "cursor-pointer hover:bg-primary-600",
      className
    )}
    onClick={onClick}
    {...props}
  >
    <div className="flex items-center gap-1">
      {children}
      {sortable && (
        <span className="text-xs opacity-60">↕</span>
      )}
    </div>
  </th>
);

export const TableCell = ({ children, className, ...props }) => (
  <td className={cn("px-3 py-2 text-sm", className)} {...props}>
    {children}
  </td>
);