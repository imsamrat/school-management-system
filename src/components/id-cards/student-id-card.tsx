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
  GraduationCap,
} from "lucide-react";

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
  rollNo: string;
  profileImage?: string;
  class?: {
    name: string;
    section: string;
  };
  parentName?: string;
  parentPhone?: string;
  address?: string;
  emergencyContact?: string;
  admissionDate: string;
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

interface StudentIDCardProps {
  student: Student;
  className?: string;
}

export default function StudentIDCard({
  student,
  className,
}: StudentIDCardProps) {
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
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-3">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <GraduationCap className="w-5 h-5" />
          <h1 className="text-sm font-bold">{schoolSettings.schoolName}</h1>
        </div>
        <p className="text-xs opacity-90">{schoolSettings.schoolMotto}</p>
        <Badge
          variant="secondary"
          className="mt-1 bg-white/20 text-white border-white/30"
        >
          STUDENT ID
        </Badge>
      </div>

      {/* Student Info */}
      <div className="relative z-10 flex items-start space-x-3">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/10 border-2 border-white/30">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={student.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {student.user.name
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
            {student.user.name}
          </h2>

          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-1">
              <span className="opacity-80">Roll No:</span>
              <span className="font-semibold">{student.rollNo}</span>
            </div>

            {student.class && (
              <div className="flex items-center space-x-1">
                <span className="opacity-80">Class:</span>
                <span className="font-semibold">
                  {student.class.name} - {student.class.section}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 opacity-80" />
              <span className="opacity-80">Session:</span>
              <span className="font-semibold">2024-25</span>
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
      </div>

      <div className="relative z-10">
        {/* School Information */}
        <div className="text-center mb-4">
          <h1 className="text-sm font-bold mb-1">
            {schoolSettings.schoolName}
          </h1>
          <p className="text-xs opacity-90 mb-2">
            Established {schoolSettings.establishedYear}
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start space-x-2">
            <MapPin className="w-3 h-3 mt-0.5 opacity-80 flex-shrink-0" />
            <span className="opacity-90">{schoolSettings.schoolAddress}</span>
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

        {/* Emergency Contact */}
        {(student.parentName || student.emergencyContact) && (
          <div className="mt-4 pt-3 border-t border-white/20">
            <h3 className="text-xs font-semibold mb-2 opacity-90">
              EMERGENCY CONTACT
            </h3>

            {student.parentName && (
              <div className="text-xs opacity-80 mb-1">
                <span className="font-medium">Parent:</span>{" "}
                {student.parentName}
              </div>
            )}

            {student.parentPhone && (
              <div className="text-xs opacity-80 mb-1">
                <span className="font-medium">Phone:</span>{" "}
                {student.parentPhone}
              </div>
            )}

            {student.emergencyContact &&
              student.emergencyContact !== student.parentPhone && (
                <div className="text-xs opacity-80">
                  <span className="font-medium">Emergency:</span>{" "}
                  {student.emergencyContact}
                </div>
              )}
          </div>
        )}

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
      cardTitle={`${student.user.name} - Student ID Card`}
      theme="student"
      className={className}
    />
  );
}
