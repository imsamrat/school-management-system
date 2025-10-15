"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeeStructures from "@/components/fees/FeeStructures";
import PaymentCollections from "@/components/fees/PaymentCollections";
import DuesManagement from "@/components/fees/DuesManagement";

export default function AdminFeees() {
  const stats = {
    totalRevenue: 5845000,
    monthlyRevenue: 487000,
    totalDues: 156000,
    overdueAmount: 23500,
    paidCount: 234,
    pendingCount: 45,
    overdueCount: 12,
    totalStudents: 291,
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fee Management System
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive fee management with payment collection and dues
              tracking
            </p>
          </div>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Guide
          </Button>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">
              New Fee Management System
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p className="mb-3">
              The fee management system has been redesigned. Check{" "}
              <strong>FEE_MANAGEMENT_GUIDE.md</strong> for details.
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  Regenerate Prisma client:{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    npx prisma generate
                  </code>
                </li>
                <li>
                  Seed fee types:{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    npx tsx scripts/seed-fee-types.ts
                  </code>
                </li>
                <li>
                  Create UI components (FeeStructures, PaymentCollections,
                  DuesManagement)
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalRevenue / 100000).toFixed(2)}L
              </div>
              <p className="text-xs text-gray-500">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Dues
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalDues / 1000).toFixed(0)}k
              </div>
              <p className="text-xs text-gray-500">Outstanding payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid Fees
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.paidCount}
              </div>
              <p className="text-xs text-gray-500">Completed payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending/Overdue
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingCount + stats.overdueCount}
              </div>
              <p className="text-xs text-gray-500">
                {stats.pendingCount} pending, {stats.overdueCount} overdue
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="structures" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="collections">Payment Collections</TabsTrigger>
            <TabsTrigger value="dues">Dues Management</TabsTrigger>
          </TabsList>

          <TabsContent value="structures">
            <FeeStructures />
          </TabsContent>

          <TabsContent value="collections">
            <PaymentCollections />
          </TabsContent>

          <TabsContent value="dues">
            <DuesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
