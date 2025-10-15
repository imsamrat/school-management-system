"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pin, Clock, Users, AlertCircle } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
}

const NoticeBoard = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/announcements?limit=4");

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load announcements"
      );

      // Only set mock data if no announcements were loaded previously
      if (announcements.length === 0) {
        setAnnouncements([
          {
            id: "demo-1",
            title: "Welcome to School Management System",
            content:
              "This is a demo notice. The announcement system is currently being set up. Please check back later for actual school announcements.",
            targetRole: null,
            isActive: true,
            createdAt: "2025-10-14T10:00:00Z",
            updatedAt: "2025-10-14T10:00:00Z",
            author: { name: "System Administrator", email: "admin@school.edu" },
          },
          {
            id: "demo-2",
            title: "System Setup in Progress",
            content:
              "We are currently setting up the announcement system. Please contact the administration office for urgent notices.",
            targetRole: "STUDENT",
            isActive: true,
            createdAt: "2025-10-14T11:00:00Z",
            updatedAt: "2025-10-14T11:00:00Z",
            author: { name: "Technical Team", email: "tech@school.edu" },
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getNoticeStyle = (index: number, targetRole: string | null) => {
    const colors = [
      { bg: "bg-red-50 border-red-200", pin: "text-red-500" },
      { bg: "bg-blue-50 border-blue-200", pin: "text-blue-500" },
      { bg: "bg-green-50 border-green-200", pin: "text-green-500" },
      { bg: "bg-purple-50 border-purple-200", pin: "text-purple-500" },
    ];
    return colors[index % colors.length];
  };

  const getTargetRoleBadge = (targetRole: string | null) => {
    if (!targetRole) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          All Users
        </Badge>
      );
    }

    const roleColors: Record<string, string> = {
      STUDENT: "bg-blue-100 text-blue-800 border-blue-200",
      TEACHER: "bg-green-100 text-green-800 border-green-200",
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      STAFF: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <Badge
        className={
          roleColors[targetRole] || "bg-gray-100 text-gray-800 border-gray-200"
        }
      >
        {targetRole.charAt(0).toUpperCase() + targetRole.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <section id="notices" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Notice Board
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest announcements and important
              information from our school community
            </p>
          </div>

          {/* Notice Board Container */}
          <div className="relative">
            {/* Cork board background */}
            <div className="bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 rounded-2xl p-8 shadow-2xl border-8 border-amber-200 relative overflow-hidden">
              {/* Cork board texture overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 20%, #8B4513 2px, transparent 2px),
                                       radial-gradient(circle at 80% 80%, #8B4513 1px, transparent 1px),
                                       radial-gradient(circle at 40% 60%, #8B4513 1px, transparent 1px)`,
                }}
              ></div>

              {/* Push pins decoration */}
              <div className="absolute top-4 left-8">
                <Pin className="text-red-500 w-6 h-6 transform rotate-12" />
              </div>
              <div className="absolute top-6 right-12">
                <Pin className="text-blue-500 w-6 h-6 transform -rotate-45" />
              </div>

              {/* Notices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card
                      key={index}
                      className="bg-gray-50 border-gray-200 animate-pulse"
                    >
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="h-16 bg-gray-200 rounded mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : error ? (
                  // Error state with fallback content
                  <div className="col-span-2">
                    <div className="text-center py-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 text-sm mb-2">
                        API Error: {error}
                      </p>
                      <button
                        onClick={fetchAnnouncements}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {loading ? "Retrying..." : "Retry Connection"}
                      </button>
                    </div>

                    {/* Show fallback content if available */}
                    {announcements.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {announcements.map((announcement, index) => {
                          const style = getNoticeStyle(
                            index,
                            announcement.targetRole
                          );
                          return (
                            <Card
                              key={announcement.id}
                              className={`${style.bg} shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-xl relative group opacity-75`}
                              style={{
                                transform: `rotate(${
                                  index % 2 === 0 ? -1 : 1
                                }deg)`,
                              }}
                            >
                              {/* Push pin */}
                              <div className="absolute -top-2 -right-2 z-20">
                                <Pin
                                  className={`${style.pin} w-5 h-5 drop-shadow-lg`}
                                />
                              </div>

                              <CardContent className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                      {announcement.title}
                                    </h3>
                                    <div className="flex items-center space-x-2 mb-3">
                                      {getTargetRoleBadge(
                                        announcement.targetRole
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        By {announcement.author.name}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Content */}
                                <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3">
                                  {announcement.content}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {formatDate(announcement.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {getTimeAgo(announcement.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : announcements.length === 0 ? (
                  // No announcements state
                  <div className="col-span-2 text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No announcements available</p>
                  </div>
                ) : (
                  // Announcements list
                  announcements.map((announcement, index) => {
                    const style = getNoticeStyle(
                      index,
                      announcement.targetRole
                    );
                    return (
                      <Card
                        key={announcement.id}
                        className={`${style.bg} shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-xl relative group`}
                        style={{
                          transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`,
                        }}
                      >
                        {/* Push pin */}
                        <div className="absolute -top-2 -right-2 z-20">
                          <Pin
                            className={`${style.pin} w-5 h-5 drop-shadow-lg`}
                          />
                        </div>

                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                {announcement.title}
                              </h3>
                              <div className="flex items-center space-x-2 mb-3">
                                {getTargetRoleBadge(announcement.targetRole)}
                                <Badge variant="outline" className="text-xs">
                                  By {announcement.author.name}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3">
                            {announcement.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(announcement.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{getTimeAgo(announcement.createdAt)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* View All Button */}
              <div className="text-center mt-8">
                <button
                  onClick={fetchAnnouncements}
                  disabled={loading}
                  className="bg-white text-gray-800 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Refresh Notices"}
                  <Users className="inline-block w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Shadow effect */}
            <div className="absolute inset-0 bg-gray-900 rounded-2xl transform translate-x-2 translate-y-2 -z-10 opacity-10"></div>
          </div>

          {/* Additional info */}
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">
              Important notices are also sent via email and SMS to parents
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Urgent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Important</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>General</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeBoard;
