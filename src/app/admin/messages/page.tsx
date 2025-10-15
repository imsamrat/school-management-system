"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  Users,
  Calendar,
  Eye,
  Bell,
  Mail,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  recipients: string[];
  recipientCount: number;
  createdAt: string;
  scheduledAt?: string;
  status: string;
  readCount: number;
  authorName: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string[];
  priority: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  authorName: string;
  viewCount: number;
}

const messageTypes = [
  "Announcement",
  "Notification",
  "Alert",
  "Reminder",
  "Newsletter",
  "Event",
  "Academic",
  "Administrative",
];

const priorityLevels = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-yellow-100 text-yellow-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const audienceTypes = [
  "All Users",
  "Students",
  "Teachers",
  "Parents",
  "Staff",
  "Specific Class",
  "Specific Grade",
];

const messageStatuses = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  {
    value: "scheduled",
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "sent", label: "Sent", color: "bg-green-100 text-green-800" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-800" },
];

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<"messages" | "announcements">(
    "announcements"
  );

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "",
    priority: "medium",
    targetAudience: [] as string[],
    scheduledAt: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedType, selectedPriority, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "announcements") {
        // Fetch real announcements from API
        const response = await fetch("/api/announcements?limit=20");
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match expected interface
          const transformedAnnouncements = data.announcements.map(
            (announcement: any) => ({
              id: announcement.id,
              title: announcement.title,
              content: announcement.content,
              type: "Announcement", // Default type since schema doesn't have this field
              targetAudience: announcement.targetRole
                ? [announcement.targetRole]
                : ["All Users"],
              priority: "medium", // Default priority since schema doesn't have this field
              isPublished: announcement.isActive,
              publishedAt: announcement.createdAt,
              expiresAt: undefined,
              authorName: announcement.author.name,
              viewCount: Math.floor(Math.random() * 300), // Mock view count for now
            })
          );
          setAnnouncements(transformedAnnouncements);
        } else {
          throw new Error("Failed to fetch announcements");
        }
      } else {
        // Keep mock data for messages since we don't have a messages API yet
        setMessages([
          {
            id: "1",
            title: "Fee Payment Reminder - Grade 10",
            content:
              "This is a gentle reminder that the quarterly fee payment is due by June 30th, 2024. Please visit the accounts office for payment.",
            type: "Reminder",
            priority: "medium",
            recipients: ["Grade 10 Parents"],
            recipientCount: 45,
            createdAt: "2024-06-20T09:00:00Z",
            status: "sent",
            readCount: 32,
            authorName: "Accounts Manager",
          },
          {
            id: "2",
            title: "Emergency Contact Update Required",
            content:
              "Please update your emergency contact information in the student portal. This is mandatory for all students and must be completed by June 25th.",
            type: "Alert",
            priority: "urgent",
            recipients: ["All Parents"],
            recipientCount: 350,
            createdAt: "2024-06-18T16:45:00Z",
            status: "sent",
            readCount: 298,
            authorName: "Admin Office",
          },
          {
            id: "3",
            title: "Sports Day Event Notification",
            content:
              "Our annual sports day is scheduled for July 15th, 2024. Students are requested to participate actively. Registration forms are available in the sports office.",
            type: "Event",
            priority: "low",
            recipients: ["All Students"],
            recipientCount: 500,
            createdAt: "2024-06-17T11:30:00Z",
            scheduledAt: "2024-06-22T08:00:00Z",
            status: "scheduled",
            readCount: 0,
            authorName: "Sports Coordinator",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data");
      // Set fallback data on error
      if (activeTab === "announcements") {
        setAnnouncements([]);
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mock API call - replace with actual implementation
      toast.success(
        editingMessage
          ? "Message updated successfully"
          : "Message created successfully"
      );
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save message");
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setFormData({
      title: message.title,
      content: message.content,
      type: message.type,
      priority: message.priority,
      targetAudience: message.recipients,
      scheduledAt: message.scheduledAt || "",
      expiresAt: "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (messageId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      // Mock API call - replace with actual implementation
      toast.success("Message deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handlePublish = async (announcementId: string) => {
    try {
      // Mock API call - replace with actual implementation
      toast.success("Announcement published successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to publish announcement");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "",
      priority: "medium",
      targetAudience: [],
      scheduledAt: "",
      expiresAt: "",
    });
    setEditingMessage(null);
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorityLevels.find((p) => p.value === priority);
    return priorityObj?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const statusObj = messageStatuses.find((s) => s.value === status);
    return statusObj?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "draft":
        return <Edit className="h-4 w-4 text-gray-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Messages & Communications
            </h1>
            <p className="text-gray-600">
              Manage announcements, send notifications, and communicate with the
              school community
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === "announcements"
                  ? "New Announcement"
                  : "Send Message"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMessage
                    ? `Edit ${
                        activeTab === "announcements"
                          ? "Announcement"
                          : "Message"
                      }`
                    : `Create New ${
                        activeTab === "announcements"
                          ? "Announcement"
                          : "Message"
                      }`}
                </DialogTitle>
                <DialogDescription>
                  {activeTab === "announcements"
                    ? "Create announcements to share important information with the school community"
                    : "Send targeted messages to specific groups or individuals"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter message title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter message content"
                    rows={6}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Message Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {messageTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityLevels.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Select
                    value={formData.targetAudience[0] || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetAudience: [value] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceTypes.map((audience) => (
                        <SelectItem key={audience} value={audience}>
                          {audience}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === "messages" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">
                      Schedule Send (Optional)
                    </Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledAt: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {activeTab === "announcements" && (
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMessage
                      ? "Update"
                      : activeTab === "announcements"
                      ? "Create Announcement"
                      : "Send Message"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Announcements
              </CardTitle>
              <Megaphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8</div>
              <p className="text-xs text-gray-500">Currently published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <p className="text-xs text-gray-500">Pending delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Read Rate
              </CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">87%</div>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "announcements"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Megaphone className="h-4 w-4 mr-2 inline" />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "messages"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Send className="h-4 w-4 mr-2 inline" />
            Messages
          </button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {messageTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorityLevels.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "announcements"
                ? "School Announcements"
                : "Message History"}
            </CardTitle>
            <CardDescription>
              {activeTab === "announcements"
                ? `${announcements.length} announcements found`
                : `${messages.length} messages found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === "announcements" ? (
                      <>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Read Rate</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTab === "announcements"
                    ? announcements.map((announcement) => (
                        <TableRow key={announcement.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {announcement.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[300px]">
                                {announcement.content}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{announcement.type}</TableCell>
                          <TableCell>
                            <Badge
                              className={getPriorityColor(
                                announcement.priority
                              )}
                            >
                              {announcement.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {announcement.targetAudience.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                announcement.isPublished
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {announcement.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <span>{announcement.viewCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {announcement.publishedAt
                              ? new Date(
                                  announcement.publishedAt
                                ).toLocaleDateString()
                              : "Not published"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {!announcement.isPublished && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handlePublish(announcement.id)
                                    }
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDelete(
                                      announcement.id,
                                      announcement.title
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    : messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{message.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-[300px]">
                                {message.content}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{message.type}</TableCell>
                          <TableCell>
                            <Badge
                              className={getPriorityColor(message.priority)}
                            >
                              {message.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{message.recipients.join(", ")}</div>
                              <div className="text-gray-500">
                                {message.recipientCount} recipients
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(message.status)}
                              <Badge className={getStatusColor(message.status)}>
                                {message.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {message.readCount}/{message.recipientCount}
                              </div>
                              <div className="text-gray-500">
                                {Math.round(
                                  (message.readCount / message.recipientCount) *
                                    100
                                )}
                                %
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {message.scheduledAt &&
                            message.status === "scheduled"
                              ? new Date(
                                  message.scheduledAt
                                ).toLocaleDateString()
                              : new Date(
                                  message.createdAt
                                ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(message)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDelete(message.id, message.title)
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
