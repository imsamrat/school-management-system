"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GraduationCap, Award, Mail, Loader2 } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  department: string;
  qualification: string | null;
  experience: string | null;
  bio: string | null;
  profileImage: string;
}

const Faculty = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/public/teachers");

      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }

      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Unable to load faculty members");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section
        id="faculty"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading our amazing faculty...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="faculty"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="faculty"
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Expert <span className="text-blue-600">Faculty</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our dedicated team of educators committed to nurturing
            excellence and inspiring the next generation of leaders
          </p>
        </div>

        {/* Teachers Grid */}
        {teachers.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No faculty members to display at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Profile Image */}
                <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                  {teacher.profileImage &&
                  teacher.profileImage !== "/placeholder-teacher.jpg" ? (
                    <Image
                      src={teacher.profileImage}
                      alt={teacher.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GraduationCap className="w-24 h-24 text-white opacity-50" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {teacher.name}
                  </h3>

                  {/* Department */}
                  <div className="flex items-center text-blue-600 font-semibold mb-3">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span className="text-sm">{teacher.department}</span>
                  </div>

                  {/* Qualification */}
                  {teacher.qualification && (
                    <div className="flex items-start mb-2">
                      <Award className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {teacher.qualification}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {teacher.experience && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {teacher.experience}
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {teacher.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {teacher.bio}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Faculty Member
                      </span>
                      <div className="flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {teachers.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Join Our Teaching Community
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Are you a passionate educator looking to make a difference?
                We're always looking for talented teachers to join our team.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                View Career Opportunities
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Faculty;
