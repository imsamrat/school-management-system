"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Download, Printer } from "lucide-react";

interface IDCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  cardTitle: string;
  theme?: "student" | "teacher";
  className?: string;
}

export default function IDCard({
  frontContent,
  backContent,
  cardTitle,
  theme = "student",
  className,
}: IDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDownload = () => {
    // In a real implementation, you would generate and download a PDF
    console.log(`Downloading ${cardTitle} ID card`);
  };

  const handlePrint = () => {
    window.print();
  };

  const themeClasses = {
    student: "from-blue-500 via-blue-600 to-blue-700",
    teacher: "from-green-500 via-green-600 to-green-700",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{cardTitle}</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Flip Card</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center space-x-1"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* ID Card Container */}
      <div className="flex justify-center">
        <div className="relative w-[340px] h-[220px] perspective-1000">
          <div
            className={cn(
              "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
              isFlipped && "rotate-y-180"
            )}
          >
            {/* Front Side */}
            <Card
              className={cn(
                "absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br shadow-xl border-0",
                themeClasses[theme]
              )}
            >
              {frontContent}
            </Card>

            {/* Back Side */}
            <Card
              className={cn(
                "absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br shadow-xl border-0",
                themeClasses[theme]
              )}
            >
              {backContent}
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
