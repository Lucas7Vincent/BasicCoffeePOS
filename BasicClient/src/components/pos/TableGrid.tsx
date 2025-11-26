'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/types/pos';
import { Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
  selectedTableId?: number;
}

export function TableGrid({ tables, onTableSelect, selectedTableId }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <Card
          key={table.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedTableId === table.id && "ring-2 ring-primary",
            table.hasActiveOrder ? "border-orange-400 bg-orange-50" : "border-green-400 bg-green-50"
          )}
          onClick={() => onTableSelect(table)}
        >
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">{table.tableName}</h3>
              
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{table.seatingCapacity} chỗ</span>
              </div>

              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                table.hasActiveOrder 
                  ? "bg-orange-100 text-orange-800" 
                  : "bg-green-100 text-green-800"
              )}>
                <Clock className="h-3 w-3" />
                {table.hasActiveOrder ? 'Đang phục vụ' : 'Trống'}
              </div>

              {table.description && (
                <p className="text-xs text-muted-foreground">{table.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}