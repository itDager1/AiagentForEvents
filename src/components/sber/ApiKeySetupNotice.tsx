import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Key, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

interface ApiKeySetupNoticeProps {
  isConfigured: boolean;
  isChecking: boolean;
  onRecheck: () => void;
}

export function ApiKeySetupNotice({ isConfigured, isChecking, onRecheck }: ApiKeySetupNoticeProps) {
  // Don't show anything if configured
  if (isConfigured) return null;

  return null;
}