import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/api/messages";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sparkles,
  LogOut,
  RefreshCw,
  MessageSquare,
  Building2,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import type { Message } from "@/types";

const ITEMS_PER_PAGE = 15;

type SortKey =
  | "id"
  | "date"
  | "username"
  | "phone"
  | "message"
  | "type"
  | "status";

interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  // Sort State
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "desc",
  });

  // Filter State
  const [filters, setFilters] = useState({
    id: "",
    username: "",
    phone: "",
    message: "",
    type: "",
    status: "",
  });

  const {
    data: messages = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: getMessages,
    staleTime: 30000,
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortValue = (msg: Message, key: SortKey): string | number => {
    switch (key) {
      case "id":
        return msg.id;
      case "date":
        return new Date(msg.timestamp).getTime();
      case "username":
        return (msg.username || "").toLowerCase();
      case "phone":
        return (msg.phone_number || "").replace(/\D/g, "");
      case "message":
        return (msg.content || "").toLowerCase();
      case "type":
        return (msg.type || "").toLowerCase();
      case "status":
        return (msg.listing_status || "").toLowerCase();
      default:
        return "";
    }
  };

  const processedData = useMemo(() => {
    if (!Array.isArray(messages)) return [];

    // 1. Filtering
    const result = messages.filter((msg: Message) => {
      const matchId = !filters.id || msg.id.toString().includes(filters.id);
      const matchUsername =
        !filters.username ||
        (msg.username || "")
          .toLowerCase()
          .includes(filters.username.toLowerCase());
      const matchPhone =
        !filters.phone || (msg.phone_number || "").includes(filters.phone);
      const matchMessage =
        !filters.message ||
        (msg.content || "")
          .toLowerCase()
          .includes(filters.message.toLowerCase());
      const matchType =
        !filters.type ||
        (msg.type || "").toLowerCase().includes(filters.type.toLowerCase());
      const matchStatus =
        !filters.status ||
        (msg.listing_status || "")
          .toLowerCase()
          .includes(filters.status.toLowerCase());
      return (
        matchId &&
        matchUsername &&
        matchPhone &&
        matchMessage &&
        matchType &&
        matchStatus
      );
    });

    // 2. Sorting
    result.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [messages, filters, sortConfig]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedMessages = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const handleExtract = (message: Message) => {
    navigate("/extraction", {
      state: {
        fullMessage: message,
        contextList: processedData,
      },
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey)
      return <ArrowUpDown className="w-3 h-3 ml-1 text-muted-foreground/50" />;
    return (
      <ArrowUpDown
        className={`w-3 h-3 ml-1 text-primary transition-transform ${
          sortConfig.direction === "desc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-fluid mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                SBS Gemini WAP
              </h1>
              <p className="text-xs text-muted-foreground">
                Data Extraction Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome,{" "}
              <span className="font-medium text-foreground">
                {user?.name || "User"}
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid mx-auto px-4 py-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">WhatsApp Messages</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {processedData.length} Total
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filter Row */}
            <div className="grid grid-cols-6 gap-3 mb-4">
              <Input
                placeholder="Filter ID..."
                value={filters.id}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, id: e.target.value }))
                }
                className="h-9 text-sm"
              />
              <Input
                placeholder="Filter Username..."
                value={filters.username}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, username: e.target.value }))
                }
                className="h-9 text-sm"
              />
              <Input
                placeholder="Filter Phone..."
                value={filters.phone}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, phone: e.target.value }))
                }
                className="h-9 text-sm"
              />
              <Input
                placeholder="Filter Message..."
                value={filters.message}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, message: e.target.value }))
                }
                className="h-9 text-sm "
              />
              <Input
                placeholder="Filter Status..."
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                className="h-9 text-sm"
              />
              <Input
                placeholder="Filter Type..."
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="min-h-[500px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead
                        className="w-[80px] cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center">
                          ID <SortIcon columnKey="id" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-[160px] cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Date <SortIcon columnKey="date" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-[180px] cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("username")}
                      >
                        <div className="flex items-center">
                          User <SortIcon columnKey="username" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("message")}
                      >
                        <div className="flex items-center">
                          Message <SortIcon columnKey="message" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-[100px] cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status <SortIcon columnKey="status" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-[100px] cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type <SortIcon columnKey="type" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px] text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading messages...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedMessages.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-muted-foreground"
                        >
                          No messages found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMessages.map((msg: Message) => (
                        <TableRow key={msg.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">
                            {msg.id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(msg.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {msg?.username || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {msg.phone_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[400px]">
                            <p className="text-sm truncate" title={msg.content}>
                              {msg.content}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                msg.listing_status === "not_listed"
                                  ? "destructive"
                                  : "default"
                              }
                              className="capitalize"
                            >
                              {msg.listing_status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                msg.type === "inventory"
                                  ? "default"
                                  : "secondary"
                              }
                              className="capitalize"
                            >
                              {msg.type || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExtract(msg)}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              {!isLoading && processedData.length > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-muted/20">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      processedData.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      processedData.length
                    )}{" "}
                    of {processedData.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="text-sm font-medium px-2">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
