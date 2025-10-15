"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  School,
  Calendar,
  Users,
  Shield,
  Bell,
  Mail,
  Database,
  Save,
  Upload,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  // School Information Settings
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Green Valley High School",
    address: "123 Education Street, Learning City, LC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@greenvalleyhs.edu",
    website: "https://greenvalleyhs.edu",
    logo: "",
    description:
      "Excellence in education since 1985. Nurturing young minds for a brighter future.",
    establishedYear: "1985",
    affiliationNumber: "AFF/2024/001",
    principalName: "Dr. Sarah Johnson",
    principalEmail: "principal@greenvalleyhs.edu",
  });

  // Academic Year Settings
  const [academicSettings, setAcademicSettings] = useState({
    currentYear: "2024-25",
    yearStartDate: "2024-04-01",
    yearEndDate: "2025-03-31",
    totalWorkingDays: "220",
    gradesOffered: [
      "KG",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ],
    subjects: [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Hindi",
      "Computer Science",
    ],
    examTypes: ["Unit Test", "Mid-term", "Final Exam", "Project", "Assignment"],
    gradingSystem: "percentage",
    passingGrade: "35",
  });

  // User Management Settings
  const [userSettings, setUserSettings] = useState({
    maxStudentsPerClass: "40",
    maxSubjectsPerTeacher: "6",
    allowParentAccess: true,
    requireEmailVerification: true,
    passwordMinLength: "8",
    sessionTimeout: "30",
    allowMultipleLogins: false,
    defaultUserRole: "student",
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactorAuth: false,
    requireStrongPasswords: true,
    loginAttemptLimit: "5",
    lockoutDuration: "15",
    enableAuditLog: true,
    dataRetentionPeriod: "5",
    backupFrequency: "daily",
    enableEncryption: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: true,
    feeReminder: true,
    attendanceAlerts: true,
    examNotifications: true,
    announcementNotifications: true,
    defaultNotificationTime: "09:00",
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24",
    currency: "INR",
    language: "English",
    theme: "light",
    enableMaintenance: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
  });

  const handleSave = async (section: string) => {
    try {
      // Mock API call - replace with actual implementation
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    }
  };

  const handleBackup = async () => {
    try {
      // Mock API call - replace with actual implementation
      toast.success("Database backup initiated successfully");
    } catch (error) {
      toast.error("Failed to create backup");
    }
  };

  const handleRestore = async () => {
    if (
      !confirm(
        "Are you sure you want to restore from backup? This will overwrite current data."
      )
    ) {
      return;
    }

    try {
      // Mock API call - replace with actual implementation
      toast.success("Database restore initiated successfully");
    } catch (error) {
      toast.error("Failed to restore backup");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure system preferences, academic settings, and administrative
            controls
          </p>
        </div>

        <Tabs defaultValue="school" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="school" className="flex items-center space-x-2">
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">School</span>
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center space-x-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* School Information Tab */}
          <TabsContent value="school">
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
                <CardDescription>
                  Basic information about your school that appears throughout
                  the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name *</Label>
                    <Input
                      id="schoolName"
                      value={schoolInfo.name}
                      onChange={(e) =>
                        setSchoolInfo({ ...schoolInfo, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      value={schoolInfo.establishedYear}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          establishedYear: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={schoolInfo.phone}
                      onChange={(e) =>
                        setSchoolInfo({ ...schoolInfo, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={schoolInfo.email}
                      onChange={(e) =>
                        setSchoolInfo({ ...schoolInfo, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={schoolInfo.website}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          website: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affiliationNumber">
                      Affiliation Number
                    </Label>
                    <Input
                      id="affiliationNumber"
                      value={schoolInfo.affiliationNumber}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          affiliationNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={schoolInfo.address}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">School Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={schoolInfo.description}
                    onChange={(e) =>
                      setSchoolInfo({
                        ...schoolInfo,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="principalName">Principal Name</Label>
                    <Input
                      id="principalName"
                      value={schoolInfo.principalName}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          principalName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="principalEmail">Principal Email</Label>
                    <Input
                      id="principalEmail"
                      type="email"
                      value={schoolInfo.principalEmail}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          principalEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("School Information")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Settings Tab */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Configuration</CardTitle>
                <CardDescription>
                  Configure academic year settings, grades, subjects, and
                  examination structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentYear">Current Academic Year</Label>
                    <Input
                      id="currentYear"
                      value={academicSettings.currentYear}
                      onChange={(e) =>
                        setAcademicSettings({
                          ...academicSettings,
                          currentYear: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalWorkingDays">Total Working Days</Label>
                    <Input
                      id="totalWorkingDays"
                      type="number"
                      value={academicSettings.totalWorkingDays}
                      onChange={(e) =>
                        setAcademicSettings({
                          ...academicSettings,
                          totalWorkingDays: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearStartDate">Academic Year Start</Label>
                    <Input
                      id="yearStartDate"
                      type="date"
                      value={academicSettings.yearStartDate}
                      onChange={(e) =>
                        setAcademicSettings({
                          ...academicSettings,
                          yearStartDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearEndDate">Academic Year End</Label>
                    <Input
                      id="yearEndDate"
                      type="date"
                      value={academicSettings.yearEndDate}
                      onChange={(e) =>
                        setAcademicSettings({
                          ...academicSettings,
                          yearEndDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradingSystem">Grading System</Label>
                    <Select
                      value={academicSettings.gradingSystem}
                      onValueChange={(value) =>
                        setAcademicSettings({
                          ...academicSettings,
                          gradingSystem: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="gpa">GPA (4.0 Scale)</SelectItem>
                        <SelectItem value="letter">Letter Grades</SelectItem>
                        <SelectItem value="cgpa">CGPA (10.0 Scale)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingGrade">Minimum Passing Grade</Label>
                    <Input
                      id="passingGrade"
                      value={academicSettings.passingGrade}
                      onChange={(e) =>
                        setAcademicSettings({
                          ...academicSettings,
                          passingGrade: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Academic Settings")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management Settings</CardTitle>
                <CardDescription>
                  Configure user access controls, limits, and default settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxStudentsPerClass">
                      Max Students per Class
                    </Label>
                    <Input
                      id="maxStudentsPerClass"
                      type="number"
                      value={userSettings.maxStudentsPerClass}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          maxStudentsPerClass: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSubjectsPerTeacher">
                      Max Subjects per Teacher
                    </Label>
                    <Input
                      id="maxSubjectsPerTeacher"
                      type="number"
                      value={userSettings.maxSubjectsPerTeacher}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          maxSubjectsPerTeacher: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">
                      Minimum Password Length
                    </Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={userSettings.passwordMinLength}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          passwordMinLength: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={userSettings.sessionTimeout}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          sessionTimeout: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultUserRole">Default User Role</Label>
                    <Select
                      value={userSettings.defaultUserRole}
                      onValueChange={(value) =>
                        setUserSettings({
                          ...userSettings,
                          defaultUserRole: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Parent Access</Label>
                      <p className="text-sm text-gray-500">
                        Enable parent portal access
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.allowParentAccess}
                      onCheckedChange={(checked) =>
                        setUserSettings({
                          ...userSettings,
                          allowParentAccess: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-gray-500">
                        Users must verify email before access
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.requireEmailVerification}
                      onCheckedChange={(checked) =>
                        setUserSettings({
                          ...userSettings,
                          requireEmailVerification: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Multiple Logins</Label>
                      <p className="text-sm text-gray-500">
                        Users can login from multiple devices
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.allowMultipleLogins}
                      onCheckedChange={(checked) =>
                        setUserSettings({
                          ...userSettings,
                          allowMultipleLogins: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("User Management")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Configure security policies, authentication, and data
                  protection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="loginAttemptLimit">
                      Login Attempt Limit
                    </Label>
                    <Input
                      id="loginAttemptLimit"
                      type="number"
                      value={securitySettings.loginAttemptLimit}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          loginAttemptLimit: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">
                      Lockout Duration (minutes)
                    </Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={securitySettings.lockoutDuration}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          lockoutDuration: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataRetentionPeriod">
                      Data Retention Period (years)
                    </Label>
                    <Input
                      id="dataRetentionPeriod"
                      type="number"
                      value={securitySettings.dataRetentionPeriod}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          dataRetentionPeriod: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={securitySettings.backupFrequency}
                      onValueChange={(value) =>
                        setSecuritySettings({
                          ...securitySettings,
                          backupFrequency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Require 2FA for admin users
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enableTwoFactorAuth}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          enableTwoFactorAuth: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Strong Passwords</Label>
                      <p className="text-sm text-gray-500">
                        Enforce password complexity requirements
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireStrongPasswords}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          requireStrongPasswords: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Audit Logging</Label>
                      <p className="text-sm text-gray-500">
                        Track all system activities
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enableAuditLog}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          enableAuditLog: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Data Encryption</Label>
                      <p className="text-sm text-gray-500">
                        Encrypt sensitive data at rest
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enableEncryption}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          enableEncryption: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={() => handleSave("Security Settings")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleBackup}>
                    <Database className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button variant="outline" onClick={handleRestore}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification preferences and delivery methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultNotificationTime">
                    Default Notification Time
                  </Label>
                  <Input
                    id="defaultNotificationTime"
                    type="time"
                    value={notificationSettings.defaultNotificationTime}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        defaultNotificationTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.enableEmailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          enableEmailNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.enableSMSNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          enableSMSNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send push notifications to mobile apps
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.enablePushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          enablePushNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Fee Reminders</Label>
                      <p className="text-sm text-gray-500">
                        Send payment due reminders
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.feeReminder}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          feeReminder: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Attendance Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Alert parents about absences
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.attendanceAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          attendanceAlerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exam Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send exam schedules and results
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.examNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          examNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Announcement Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send school announcements
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.announcementNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          announcementNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Notification Settings")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Configure system-wide settings, appearance, and maintenance
                  options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={systemSettings.timezone}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          timezone: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          Asia/Kolkata (IST)
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={systemSettings.dateFormat}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          dateFormat: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select
                      value={systemSettings.timeFormat}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          timeFormat: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 Hour</SelectItem>
                        <SelectItem value="24">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={systemSettings.currency}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">System Language</Label>
                    <Select
                      value={systemSettings.language}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          language: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">System Theme</Label>
                    <Select
                      value={systemSettings.theme}
                      onValueChange={(value) =>
                        setSystemSettings({ ...systemSettings, theme: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">
                        Enable maintenance mode to restrict access
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.enableMaintenance}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          enableMaintenance: checked,
                        })
                      }
                    />
                  </div>

                  {systemSettings.enableMaintenance && (
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceMessage">
                        Maintenance Message
                      </Label>
                      <Textarea
                        id="maintenanceMessage"
                        rows={3}
                        value={systemSettings.maintenanceMessage}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            maintenanceMessage: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <Button onClick={() => handleSave("System Settings")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
