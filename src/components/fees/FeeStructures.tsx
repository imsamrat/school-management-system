"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Users, Search, Settings } from "lucide-react";
import { toast } from "sonner";

interface FeeStructure {
  id: string;
  classId: string;
  feeTypeId: string;
  amount: number;
  frequency: string;
  academicYear: string;
  isActive: boolean;
  description?: string;
  class: {
    id: string;
    name: string;
    section: string;
  };
  feeType: {
    id: string;
    name: string;
    code: string;
    category: string;
    isRecurring: boolean;
  };
  _count: {
    studentFees: number;
  };
}

interface FeeType {
  id: string;
  name: string;
  code: string;
  category: string;
  isRecurring: boolean;
}

interface Class {
  id: string;
  name: string;
  section: string;
  academicYear: string;
}

interface FeeStructuresProps {
  onRefresh?: () => void;
}

export default function FeeStructures({ onRefresh }: FeeStructuresProps) {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    classId: "",
    feeTypeId: "",
    amount: "",
    frequency: "MONTHLY",
    academicYear: "2024-25",
    description: "",
  });

  useEffect(() => {
    fetchData();
    fetchFeeTypes();
    fetchClasses();
  }, [filterClass, filterType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        academicYear: "2024-25",
      });

      if (filterClass !== "all") params.append("classId", filterClass);
      if (filterType !== "all") params.append("feeTypeId", filterType);

      const response = await fetch(`/api/fees/structures?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStructures(data);
      } else {
        toast.error("Failed to fetch fee structures");
      }
    } catch (error) {
      console.error("Error fetching structures:", error);
      toast.error("Failed to fetch fee structures");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const response = await fetch("/api/fees/types");
      if (response.ok) {
        const data = await response.json();
        setFeeTypes(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch fee types:", response.statusText);
        setFeeTypes([]);
      }
    } catch (error) {
      console.error("Error fetching fee types:", error);
      setFeeTypes([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes?limit=100"); // Get all classes
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []); // Extract classes array from response
      } else {
        console.error("Failed to fetch classes:", response.statusText);
        setClasses([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.classId || !formData.feeTypeId || !formData.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const url = editingStructure
        ? "/api/fees/structures"
        : "/api/fees/structures";

      const method = editingStructure ? "PUT" : "POST";

      const body = editingStructure
        ? { id: editingStructure.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          editingStructure
            ? "Fee structure updated successfully"
            : "Fee structure created successfully"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchData();
        onRefresh?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save fee structure");
      }
    } catch (error) {
      console.error("Error saving structure:", error);
      toast.error("Failed to save fee structure");
    }
  };

  const handleEdit = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setFormData({
      classId: structure.classId,
      feeTypeId: structure.feeTypeId,
      amount: structure.amount.toString(),
      frequency: structure.frequency,
      academicYear: structure.academicYear,
      description: structure.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (structure: FeeStructure) => {
    if (structure._count.studentFees > 0) {
      toast.error(
        `Cannot delete: ${structure._count.studentFees} students are assigned this fee`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete this fee structure?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/fees/structures?id=${structure.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Fee structure deleted successfully");
        fetchData();
        onRefresh?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete fee structure");
      }
    } catch (error) {
      console.error("Error deleting structure:", error);
      toast.error("Failed to delete fee structure");
    }
  };

  const handleAssignToClass = async (structure: FeeStructure) => {
    if (
      !confirm(
        `Assign ${structure.feeType.name} to all students in ${structure.class.name} - ${structure.class.section}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/fees/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: structure.classId,
          feeStructureId: structure.id,
          academicYear: structure.academicYear,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Assigned to ${result.summary.assigned} students (${result.summary.skipped} already assigned)`
        );
        fetchData();
        onRefresh?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to assign fees");
      }
    } catch (error) {
      console.error("Error assigning fees:", error);
      toast.error("Failed to assign fees");
    }
  };

  const resetForm = () => {
    setFormData({
      classId: "",
      feeTypeId: "",
      amount: "",
      frequency: "MONTHLY",
      academicYear: "2024-25",
      description: "",
    });
    setEditingStructure(null);
  };

  const filteredStructures = structures.filter(
    (structure) =>
      structure.feeType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.class.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fee Structures</CardTitle>
              <CardDescription>
                Manage fee structures for different classes
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search fee structures..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {Array.isArray(classes) &&
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Array.isArray(feeTypes) &&
                  feeTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStructures.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No fee structures found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStructures.map((structure) => (
                      <TableRow key={structure.id}>
                        <TableCell className="font-medium">
                          {structure.class.name} - {structure.class.section}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{structure.feeType.name}</div>
                            <div className="text-xs text-gray-500">
                              {structure.feeType.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ৳{structure.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {structure.frequency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-blue-600 font-medium">
                              {structure._count.studentFees}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignToClass(structure)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(structure)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(structure)}
                              disabled={structure._count.studentFees > 0}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingStructure ? "Edit Fee Structure" : "Add Fee Structure"}
            </DialogTitle>
            <DialogDescription>
              {editingStructure
                ? "Update fee structure information"
                : "Create a new fee structure for a class"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classId">Class *</Label>
              <Select
                value={formData.classId}
                onValueChange={(value) =>
                  setFormData({ ...formData, classId: value })
                }
                disabled={!!editingStructure}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(classes) &&
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeTypeId">Fee Type *</Label>
              <Select
                value={formData.feeTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, feeTypeId: value })
                }
                disabled={!!editingStructure}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(feeTypes) &&
                    feeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.category})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (৳) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="HALF_YEARLY">Half Yearly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingStructure ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
