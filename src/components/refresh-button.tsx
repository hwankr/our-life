'use client';

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // 브라우저 하드 리로드 (F5와 동일)
    window.location.reload();
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="h-8 w-8"
      title="새로고침"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    </Button>
  );
}
