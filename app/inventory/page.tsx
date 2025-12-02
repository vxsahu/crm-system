import { Suspense } from 'react';
import { InventoryManager } from '@/components/InventoryManager';

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>}>
      <InventoryManager />
    </Suspense>
  );
}
