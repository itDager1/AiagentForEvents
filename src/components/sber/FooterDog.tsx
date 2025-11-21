import React from 'react';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import catImage from 'figma:asset/be6c08208236b0d0ab12c3b7522e41ad4d459818.png';

interface FooterDogProps {
  onSubscribe?: (email: string) => void;
}

export function FooterDog({ onSubscribe }: FooterDogProps) {
  return (
    <div className="mt-auto bg-white border-t border-gray-100 relative overflow-hidden">
      {/* Footer content removed */}
    </div>
  );
}