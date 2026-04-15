"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  AlertCircle,
  CheckCircle,
  Award,
  Eye,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OffenseColorBadge, MultiOffenseIndicator, getOffenseColor } from "./offense-color-badge";
import { OffenseHistoryModal } from "./offense-history-modal";
import { OffenseEncodingForm } from "./offense-encoding-form";
import { ClearOffensesModal } from "./clear-offenses-modal";
import { OffenseCategory } from "@prisma/client";

interface DisciplinaryRecord {
  id: string;
  studentNumber: string;
  studentName: string;
  college: string | null;
  course: string | null;
  yearLevel: string | null;
  minorCount: number;
  majorCount: number;
  lateFacultyCount: number;
  lateRogCount: number;
  latePaymentCount: number;
  otherCount: number;
  hasActiveOffenses: boolean;
  isEndorsed: boolean;
  createdAt: string;
  updatedAt: string;
  offenses: any[];
  endorsements: any[];
  clearances: any[];
  colors?: Record<string, string>;
}

interface DisciplinaryRecordListProps {
  onRefresh?: () => void;
}

export function DisciplinaryRecordList({ onRefresh }: DisciplinaryRecordListProps) {
  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "endorsed">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddOffense, setShowAddOffense] = useState(false);
  const [showClearOffenses, setShowClearOffenses] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      if (filter === "active") params.append("hasActiveOffenses", "true");

      const response = await fetch(`/api/disciplinary?${params.toString()}`);
      const data = await response.json();

      if (data.data) {
        setRecords(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to fetch disciplinary records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, filter]);

  const handleSearch = () => {
    setPage(1);
    fetchRecords();
  };

  const handleViewHistory = (record: DisciplinaryRecord) => {
    setSelectedRecord(record);
    setShowHistory(true);
  };

  const handleAddOffense = (record?: DisciplinaryRecord) => {
    setSelectedRecord(record || null);
    setShowAddOffense(true);
  };

  const handleClearOffenses = (record: DisciplinaryRecord) => {
    setSelectedRecord(record);
    setShowClearOffenses(true);
  };

  const handleRefresh = () => {
    fetchRecords();
    onRefresh?.();
  };

  const getRowBackgroundColor = (record: DisciplinaryRecord): string => {
    if (!record.hasActiveOffenses) return "";
    
    // Find the most severe active offense
    const counts = [
      { category: OffenseCategory.MAJOR, count: record.majorCount },
      { category: OffenseCategory.MINOR, count: record.minorCount },
      { category: OffenseCategory.LATE_FACULTY_EVALUATION, count: record.lateFacultyCount },
      { category: OffenseCategory.LATE_ACCESS_ROG, count: record.lateRogCount },
      { category: OffenseCategory.LATE_PAYMENT, count: record.latePaymentCount },
    ];

    // Find highest count
    const highest = counts.reduce((prev, curr) => 
      curr.count > prev.count ? curr : prev
    );

    if (highest.count === 0) return "";

    const color = getOffenseColor(highest.category, highest.count);
    return `${color}10`; // Add transparency
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Disciplinary Records</CardTitle>
            <CardDescription>
              {total} student{total !== 1 ? "s" : ""} with offense records
            </CardDescription>
          </div>
          <Button onClick={() => handleAddOffense()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Offense
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as "all" | "active" | "endorsed")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Records</SelectItem>
              <SelectItem value="active">Active Offenses</SelectItem>
              <SelectItem value="endorsed">Endorsed Only</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No disciplinary records found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleAddOffense()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Offense
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Offenses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow
                    key={record.id}
                    style={{
                      backgroundColor: getRowBackgroundColor(record),
                    }}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewHistory(record)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.studentName}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {record.studentNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{record.college || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <MultiOffenseIndicator
                        counts={{
                          minorCount: record.minorCount,
                          majorCount: record.majorCount,
                          lateFacultyCount: record.lateFacultyCount,
                          lateRogCount: record.lateRogCount,
                          latePaymentCount: record.latePaymentCount,
                          otherCount: record.otherCount,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {record.hasActiveOffenses ? (
                          <Badge className="bg-red-500 text-white w-fit">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Clear
                          </Badge>
                        )}
                        {record.isEndorsed && (
                          <Badge className="bg-purple-500 text-white w-fit">
                            <Award className="h-3 w-3 mr-1" />
                            Endorsed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {record.hasActiveOffenses && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleClearOffenses(record)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Offense History Modal */}
      <OffenseHistoryModal
        open={showHistory}
        onOpenChange={setShowHistory}
        record={selectedRecord}
        onAddOffense={() => {
          setShowHistory(false);
          setShowAddOffense(true);
        }}
        onClearOffenses={() => {
          setShowHistory(false);
          setShowClearOffenses(true);
        }}
      />

      {/* Add Offense Modal */}
      <OffenseEncodingForm
        open={showAddOffense}
        onOpenChange={setShowAddOffense}
        onSuccess={handleRefresh}
        initialData={
          selectedRecord
            ? {
                studentNumber: selectedRecord.studentNumber,
                studentName: selectedRecord.studentName,
                college: selectedRecord.college || undefined,
              }
            : undefined
        }
        existingCounts={
          selectedRecord
            ? {
                MINOR: selectedRecord.minorCount,
                MAJOR: selectedRecord.majorCount,
                LATE_FACULTY_EVALUATION: selectedRecord.lateFacultyCount,
                LATE_ACCESS_ROG: selectedRecord.lateRogCount,
                LATE_PAYMENT: selectedRecord.latePaymentCount,
                OTHER: selectedRecord.otherCount,
              }
            : undefined
        }
      />

      {/* Clear Offenses Modal */}
      <ClearOffensesModal
        open={showClearOffenses}
        onOpenChange={setShowClearOffenses}
        record={selectedRecord}
        onSuccess={handleRefresh}
      />
    </Card>
  );
}
