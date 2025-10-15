"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  CheckCircle,
  UserCheck,
  ClipboardCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Download,
} from "lucide-react";

const Admission = () => {
  const [activeTab, setActiveTab] = useState<"process" | "requirements">(
    "process"
  );

  const admissionProcess = [
    {
      icon: <FileText className="w-10 h-10" />,
      title: "Step 1: Submit Application",
      description:
        "Fill out the online application form with required details and upload necessary documents.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <CheckCircle className="w-10 h-10" />,
      title: "Step 2: Document Verification",
      description:
        "Our team will verify all submitted documents and credentials within 2-3 business days.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <UserCheck className="w-10 h-10" />,
      title: "Step 3: Entrance Assessment",
      description:
        "Attend the entrance test and parent-student interview at our campus.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <ClipboardCheck className="w-10 h-10" />,
      title: "Step 4: Admission Confirmation",
      description:
        "Receive admission letter and complete the enrollment process with fee payment.",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const requirements = [
    "Birth Certificate (Original & Photocopy)",
    "Transfer Certificate from previous school (if applicable)",
    "Previous year's report card / mark sheet",
    "Passport size photographs (4 copies)",
    "Aadhar Card copy of student and parents",
    "Address proof (Utility bill, etc.)",
    "Medical fitness certificate",
    "Caste certificate (if applicable)",
  ];

  const importantDates = [
    { event: "Application Opens", date: "January 1, 2025" },
    { event: "Application Deadline", date: "March 31, 2025" },
    { event: "Entrance Test", date: "April 15-20, 2025" },
    { event: "Result Announcement", date: "April 30, 2025" },
    { event: "Admission Confirmation", date: "May 1-15, 2025" },
    { event: "Academic Year Begins", date: "June 1, 2025" },
  ];

  return (
    <section id="admission" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Admission <span className="text-blue-600">Process</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of learners. Follow these simple steps to secure
            your child's future
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("process")}
              className={`px-8 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === "process"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admission Process
            </button>
            <button
              onClick={() => setActiveTab("requirements")}
              className={`px-8 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === "requirements"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Requirements & Dates
            </button>
          </div>
        </div>

        {/* Admission Process Tab */}
        {activeTab === "process" && (
          <div className="space-y-8 animate-fade-in">
            {admissionProcess.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`flex-shrink-0 p-4 rounded-full ${step.color}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Apply Now
              </Button>
            </div>
          </div>
        )}

        {/* Requirements & Dates Tab */}
        {activeTab === "requirements" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Required Documents */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  Required Documents
                </h3>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Document Checklist
                </Button>
              </div>

              {/* Important Dates */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                  Important Dates
                </h3>
                <div className="space-y-4">
                  {importantDates.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors duration-200"
                    >
                      <span className="font-medium text-gray-900">
                        {item.event}
                      </span>
                      <span className="text-purple-600 font-semibold">
                        {item.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Structure */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                Fee Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 text-center shadow-md">
                  <p className="text-gray-600 mb-2">Primary (Grades 1-5)</p>
                  <p className="text-3xl font-bold text-blue-600">৳50,000</p>
                  <p className="text-sm text-gray-500 mt-1">per annum</p>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow-md">
                  <p className="text-gray-600 mb-2">Middle (Grades 6-8)</p>
                  <p className="text-3xl font-bold text-blue-600">৳60,000</p>
                  <p className="text-sm text-gray-500 mt-1">per annum</p>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow-md">
                  <p className="text-gray-600 mb-2">High (Grades 9-12)</p>
                  <p className="text-3xl font-bold text-blue-600">৳75,000</p>
                  <p className="text-sm text-gray-500 mt-1">per annum</p>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-6">
                * Fee includes tuition, activity charges, and learning
                materials. Transportation and meals are additional.
              </p>
            </div>

            {/* Contact Info */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Need Help with Admission?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-6 h-6 mr-3" />
                  <div>
                    <p className="font-semibold">Call Us</p>
                    <p className="text-blue-100">+91 9876543210</p>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="w-6 h-6 mr-3" />
                  <div>
                    <p className="font-semibold">Email Us</p>
                    <p className="text-blue-100">admissions@greenfield.edu</p>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Clock className="w-6 h-6 mr-3" />
                  <div>
                    <p className="font-semibold">Office Hours</p>
                    <p className="text-blue-100">Mon-Fri: 9 AM - 5 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Admission;
