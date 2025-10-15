"use client";

import { useEffect, useState } from "react";
import IDCard from "@/components/ui/id-card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Award,
} from "lucide-react";

interface Teacher {
  id: string;
  user: {
    name: string;
    email: string;
  };
  employeeId: string;
  profileImage?: string;
  department: string;
  qualification?: string;
  experience?: string;
  phone?: string;
  address?: string;
  bio?: string;
  joinDate: string;
}

interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  establishedYear: string;
  principalName: string;
  schoolLogo: string;
  schoolMotto: string;
  affiliation: string;
  schoolCode: string;
}

interface TeacherIDCardProps {
  teacher: Teacher;
  className?: string;
}

export default function TeacherIDCard({
  teacher,
  className,
}: TeacherIDCardProps) {
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(
    null
  );

  useEffect(() => {
    const fetchSchoolSettings = async () => {
      try {
        const response = await fetch("/api/settings/school");
        if (response.ok) {
          const data = await response.json();
          setSchoolSettings(data.settings);
        }
      } catch (error) {
        console.error("Error fetching school settings:", error);
      }
    };

    fetchSchoolSettings();
  }, []);

  if (!schoolSettings) {
    return <div className="animate-pulse">Loading ID card...</div>;
  }

  // Front Side Content
  const frontContent = (
    <div className="relative w-full h-full text-white p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-4 translate-y-4"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white transform -translate-x-8 -translate-y-8"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-3">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <BookOpen className="w-5 h-5" />
          <h1 className="text-sm font-bold">{schoolSettings.schoolName}</h1>
        </div>
        <p className="text-xs opacity-90">{schoolSettings.schoolMotto}</p>
        <Badge
          variant="secondary"
          className="mt-1 bg-white/20 text-white border-white/30"
        >
          FACULTY ID
        </Badge>
      </div>

      {/* Teacher Info */}
      <div className="relative z-10 flex items-start space-x-3">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/10 border-2 border-white/30">
            {teacher.profileImage ? (
              <img
                src={teacher.profileImage}
                alt={teacher.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {teacher.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold mb-1 truncate">
            {teacher.user.name}
          </h2>

          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-1">
              <span className="opacity-80">ID:</span>
              <span className="font-semibold">{teacher.employeeId}</span>
            </div>

            <div className="flex items-center space-x-1">
              <BookOpen className="w-3 h-3 opacity-80" />
              <span className="opacity-80">Dept:</span>
              <span className="font-semibold truncate">
                {teacher.department}
              </span>
            </div>

            {teacher.qualification && (
              <div className="flex items-center space-x-1">
                <Award className="w-3 h-3 opacity-80" />
                <span className="opacity-80">Qualification:</span>
                <span className="font-semibold text-xs truncate">
                  {teacher.qualification}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 opacity-80" />
              <span className="opacity-80">Since:</span>
              <span className="font-semibold">
                {new Date(teacher.joinDate).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* School Code */}
      <div className="absolute bottom-2 right-2 text-xs opacity-60">
        {schoolSettings.schoolCode}
      </div>
    </div>
  );

  // Back Side Content
  const backContent = (
    <div className="relative w-full h-full text-white p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-28 h-28 rounded-full bg-white transform -translate-x-6 -translate-y-6"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-white transform translate-x-4 translate-y-4"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-white transform translate-x-2"></div>
      </div>

      <div className="relative z-10">
        {/* School Information */}
        <div className="text-center mb-4">
          <h1 className="text-sm font-bold mb-1">
            {schoolSettings.schoolName}
          </h1>
          <p className="text-xs opacity-90 mb-1">
            Established {schoolSettings.establishedYear}
          </p>
          <p className="text-xs opacity-80">{schoolSettings.affiliation}</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start space-x-2">
            <MapPin className="w-3 h-3 mt-0.5 opacity-80 flex-shrink-0" />
            <span className="opacity-90 leading-tight">
              {schoolSettings.schoolAddress}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="w-3 h-3 opacity-80" />
            <span className="opacity-90">{schoolSettings.schoolPhone}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Mail className="w-3 h-3 opacity-80" />
            <span className="opacity-90">{schoolSettings.schoolEmail}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Globe className="w-3 h-3 opacity-80" />
            <span className="opacity-90">{schoolSettings.schoolWebsite}</span>
          </div>
        </div>

        {/* Teacher Details */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <h3 className="text-xs font-semibold mb-2 opacity-90">
            FACULTY INFORMATION
          </h3>

          {teacher.experience && (
            <div className="text-xs opacity-80 mb-1">
              <span className="font-medium">Experience:</span>{" "}
              {teacher.experience}
            </div>
          )}

          {teacher.phone && (
            <div className="text-xs opacity-80 mb-1">
              <span className="font-medium">Contact:</span> {teacher.phone}
            </div>
          )}

          {teacher.bio && (
            <div className="text-xs opacity-80 mt-2">
              <span className="font-medium">Specialization:</span>
              <p className="mt-1 leading-tight">{teacher.bio}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 left-4 right-4 text-center">
          <p className="text-xs opacity-60 mb-1">If found, please return to:</p>
          <p className="text-xs font-medium opacity-80">
            {schoolSettings.schoolName}
          </p>
          <p className="text-xs opacity-60">
            {schoolSettings.principalName} - Principal
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <IDCard
      frontContent={frontContent}
      backContent={backContent}
      cardTitle={`${teacher.user.name} - Faculty ID Card`}
      theme="teacher"
      className={className}
    />
  );
}
