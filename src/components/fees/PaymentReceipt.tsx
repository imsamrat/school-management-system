"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Printer,
  Receipt,
  School,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PaymentReceiptData {
  receiptNumber: string;
  paymentDate: string;
  student: {
    name: string;
    rollNo: string;
    class: {
      name: string;
      section: string;
    };
  };
  feeType: {
    name: string;
    category: string;
  };
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
  discountReason?: string;
}

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  data: PaymentReceiptData | null;
}

export default function PaymentReceipt({
  isOpen,
  onClose,
  data,
}: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      // Hide the action buttons during PDF generation
      const actionButtons = document.querySelector(
        ".receipt-actions"
      ) as HTMLElement;
      if (actionButtons) actionButtons.style.display = "none";

      const canvas = await html2canvas(receiptRef.current, {
        useCORS: true,
        allowTaint: false,
        background: "#ffffff",
      });

      // Restore the action buttons
      if (actionButtons) actionButtons.style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      // Add the first page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Receipt-${data.receiptNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const printReceipt = () => {
    if (!receiptRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHtml = receiptRef.current.outerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${data.receiptNumber}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .receipt-actions { display: none !important; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
            /* Copy Tailwind styles for print */
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-gray-600 { color: #6b7280; }
            .text-gray-800 { color: #1f2937; }
            .text-blue-600 { color: #2563eb; }
            .text-green-600 { color: #16a34a; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-blue-50 { background-color: #eff6ff; }
            .border { border: 1px solid #d1d5db; }
            .border-b { border-bottom: 1px solid #d1d5db; }
            .border-t { border-top: 1px solid #d1d5db; }
            .border-dashed { border-style: dashed; }
            .rounded { border-radius: 0.25rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-6 { margin-top: 1.5rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Small delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const netAmount = data.paidAmount + data.discountAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Payment Receipt</DialogTitle>
          <DialogDescription>
            Payment receipt for download or print
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="receipt-actions flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={printReceipt}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="bg-white p-6 space-y-6">
          {/* School Header */}
          <div className="text-center border-b-2 border-blue-600 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 pt-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-blue-600 p-2 rounded-full mr-3 shadow-lg">
                <School className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-wide">
                  YOUR SCHOOL NAME
                </h1>
                <p className="text-sm text-blue-600 font-medium">
                  Excellence in Education
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                <span>123 Education Street, Knowledge City, State 12345</span>
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-blue-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-blue-600" />
                  <span>info@yourschool.edu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Title & Number */}
          <div className="text-center">
            <div className="bg-green-600 text-white py-3 px-6 rounded-lg inline-block shadow-lg">
              <div className="flex items-center justify-center mb-1">
                <Receipt className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">FEE PAYMENT RECEIPT</h2>
              </div>
              <div className="bg-white bg-opacity-20 rounded px-3 py-1 inline-block">
                <span className="text-sm">Receipt No: </span>
                <span className="font-bold text-lg">{data.receiptNumber}</span>
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column - Student Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">
                  Student Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{data.student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roll No:</span>
                    <span className="font-medium">{data.student.rollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">
                      {data.student.class.name} - {data.student.class.section}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">
                  Fee Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee Type:</span>
                    <span className="font-medium">{data.feeType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{data.feeType.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      ৳{data.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">
                  Payment Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {format(new Date(data.paymentDate), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {format(new Date(data.paymentDate), "hh:mm a")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{data.paymentMethod}</span>
                  </div>
                  {data.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-xs">
                        {data.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="relative bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 shadow-inner">
            <div className="absolute top-0 right-0 text-green-100 text-6xl font-bold opacity-20 p-4">
              PAID
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center border-b pb-2">
              💰 Payment Breakdown
            </h3>
            <div className="space-y-3 text-sm relative z-10">
              <div className="flex justify-between items-center bg-white bg-opacity-50 p-2 rounded">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-bold text-green-600 text-lg">
                  ৳{data.paidAmount.toLocaleString()}
                </span>
              </div>
              {data.discountAmount > 0 && (
                <>
                  <div className="flex justify-between items-center bg-orange-50 p-2 rounded">
                    <span className="font-medium">Discount Applied:</span>
                    <span className="font-bold text-orange-600">
                      ৳{data.discountAmount.toLocaleString()}
                    </span>
                  </div>
                  {data.discountReason && (
                    <div className="bg-yellow-50 p-2 rounded text-xs">
                      <span className="text-gray-600">Discount Reason: </span>
                      <span className="text-gray-800 italic font-medium">
                        {data.discountReason}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t-2 border-dashed border-green-300 pt-3 mt-4">
                <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg">
                  <span className="font-bold text-lg">
                    Total Amount Settled:
                  </span>
                  <span className="font-bold text-2xl text-green-700">
                    ৳{netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {data.remarks && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-bold text-gray-800 mb-2">Remarks:</h4>
              <p className="text-sm text-gray-700">{data.remarks}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>
                This is a computer-generated receipt and does not require a
                signature.
              </p>
              <p>Please keep this receipt for your records.</p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs text-gray-500">
              <div>
                <p className="font-medium mb-1">Generated by:</p>
                <p>School Management System</p>
                <p>{format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
              </div>
              <div className="text-right">
                <p className="font-medium mb-1">For queries contact:</p>
                <p>Accounts Department</p>
                <p>accounts@greenwoodschool.edu</p>
              </div>
            </div>
          </div>

          {/* Security Elements */}
          <div className="text-center text-xs text-gray-400 border-t pt-2">
            <p>
              Receipt ID: {data.receiptNumber} | Verified ✓ | Digitally
              Generated
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
