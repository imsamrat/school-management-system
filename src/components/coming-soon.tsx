import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Construction, LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  featureDescription: string;
  icon: LucideIcon;
  note?: string;
}

export default function ComingSoon({
  title,
  description,
  featureDescription,
  icon: Icon,
  note,
}: ComingSoonProps) {
  return (
    <Card>
      <CardHeader className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <Construction className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Coming Soon</CardTitle>
        <CardDescription className="text-base">
          {featureDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-12">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <Icon className="h-4 w-4 mr-2" />
          Part of Full Version Release
        </div>
        {note && (
          <div className="mt-4 text-sm text-gray-600">
            <p>{note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
