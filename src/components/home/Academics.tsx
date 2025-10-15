"use client";

import {
  BookOpen,
  GraduationCap,
  Award,
  Lightbulb,
  Users,
  FlaskConical,
} from "lucide-react";

const Academics = () => {
  const programs = [
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      title: "Primary Education",
      description:
        "Foundational learning with focus on core subjects and holistic development",
      grades: "Grades 1-5",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <GraduationCap className="w-12 h-12 text-purple-600" />,
      title: "Middle School",
      description:
        "Advanced curriculum preparing students for higher education",
      grades: "Grades 6-8",
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: <Award className="w-12 h-12 text-green-600" />,
      title: "High School",
      description: "Specialized streams and board exam preparation",
      grades: "Grades 9-12",
      color: "bg-green-50 border-green-200",
    },
  ];

  const features = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Smart Classrooms",
      description: "Digital learning with interactive boards",
    },
    {
      icon: <FlaskConical className="w-8 h-8" />,
      title: "Modern Labs",
      description: "State-of-the-art science and computer labs",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Small Class Size",
      description: "Maximum 30 students per class for personalized attention",
    },
  ];

  return (
    <section
      id="academics"
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Academic <span className="text-blue-600">Excellence</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive curriculum is designed to nurture intellectual
            growth, critical thinking, and lifelong learning skills
          </p>
        </div>

        {/* Programs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {programs.map((program, index) => (
            <div
              key={index}
              className={`${program.color} border-2 rounded-xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
            >
              <div className="mb-6">{program.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {program.title}
              </h3>
              <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                {program.grades}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Our Academic Programs?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Highlights */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Core Curriculum
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Mathematics",
              "Science",
              "English",
              "Social Studies",
              "Computer Science",
              "Arts & Crafts",
              "Physical Education",
              "Music",
              "Languages",
            ].map((subject, index) => (
              <span
                key={index}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-colors duration-300"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Academics;
