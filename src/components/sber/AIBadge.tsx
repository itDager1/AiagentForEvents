import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function AIBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none cursor-help">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-система активна
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">
            Искусственный интеллект помогает находить актуальную информацию о мероприятиях с официальных сайтов
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
