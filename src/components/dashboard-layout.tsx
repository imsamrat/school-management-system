"use client";

import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Home,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Settings,
  MessageSquare,
  DollarSign,
  IdCard,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "staff" | "teacher" | "student";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const { data: session } = useSession();

  const getNavigation = () => {
    const baseNav = [{ name: "Dashboard", href: `/${role}`, icon: Home }];

    switch (role) {
      case "admin":
        return [
          ...baseNav,
          { name: "Students", href: `/${role}/students`, icon: Users },
          { name: "Teachers", href: `/${role}/teachers`, icon: Users },
          { name: "Classes", href: `/${role}/classes`, icon: BookOpen },
          { name: "Subjects", href: `/${role}/subjects`, icon: BookOpen },
          { name: "Schedules", href: `/${role}/schedules`, icon: Calendar },
          {
            name: "Attendance",
            href: `/${role}/attendance`,
            icon: ClipboardCheck,
          },
          { name: "Grades", href: `/${role}/grades`, icon: ClipboardCheck },
          { name: "Fees", href: `/${role}/fees`, icon: DollarSign },
          { name: "ID Cards", href: `/${role}/id-cards`, icon: IdCard },
          { name: "Messages", href: `/${role}/messages`, icon: MessageSquare },
          { name: "Settings", href: `/${role}/settings`, icon: Settings },
        ];
      case "staff":
        return [
          ...baseNav,
          { name: "Students", href: `/${role}/students`, icon: Users },
          {
            name: "Attendance",
            href: `/${role}/attendance`,
            icon: ClipboardCheck,
          },
          { name: "Fees", href: `/${role}/fees`, icon: DollarSign },
          { name: "Messages", href: `/${role}/messages`, icon: MessageSquare },
        ];
      case "teacher":
        return [
          ...baseNav,
          { name: "My Classes", href: `/${role}/classes`, icon: BookOpen },
          { name: "Students", href: `/${role}/students`, icon: Users },
          {
            name: "Attendance",
            href: `/${role}/attendance`,
            icon: ClipboardCheck,
          },
          { name: "Assignments", href: `/${role}/assignments`, icon: BookOpen },
          { name: "Grades", href: `/${role}/grades`, icon: ClipboardCheck },
          { name: "Schedule", href: `/${role}/schedule`, icon: Calendar },
        ];
      case "student":
        return [
          ...baseNav,
          { name: "My Classes", href: `/${role}/classes`, icon: BookOpen },
          {
            name: "Attendance",
            href: `/${role}/attendance`,
            icon: ClipboardCheck,
          },
          { name: "Assignments", href: `/${role}/assignments`, icon: BookOpen },
          { name: "Grades", href: `/${role}/grades`, icon: ClipboardCheck },
          { name: "Schedule", href: `/${role}/schedule`, icon: Calendar },
        ];
      default:
        return baseNav;
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              School Management System
            </h1>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
              {role}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>{session?.user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-[calc(100vh-73px)] overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
