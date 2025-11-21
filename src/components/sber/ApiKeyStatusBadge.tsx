import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { checkApiKeyStatus } from '../../utils/checkApiKey';

/**
 * Badge component that displays the status of OpenRouter API Key
 * Only visible in development mode
 */
export function ApiKeyStatusBadge() {
  const [status, setStatus] = useState<{
    isConfigured: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const checkStatus = async () => {
      setIsChecking(true);
      const result = await checkApiKeyStatus();
      setStatus(result);
      setIsChecking(false);
    };

    checkStatus();
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (isChecking) {
    return (
      <Badge 
        variant="outline" 
        className="bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1.5 text-xs"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        Проверка API...
      </Badge>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span></span>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-xs"
        >
          <div className="space-y-2">
            <p className="font-medium">{status.message}</p>
            {status.details && (
              <p className="text-xs text-muted-foreground">{status.details}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}