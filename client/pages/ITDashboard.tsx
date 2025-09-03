import AppNav from "@/components/Navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ServerCog,
  User,
  Building2,
  Plus,
  ArrowRight,
  Monitor,
  Shield,
  Wifi,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Bell,
  Settings,
  Eye,
  Pencil,
} from "lucide-react";

interface ITRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: { email: string; password: string }[];
  vitelGlobal: {
    id?: string;
    provider?: "vitel" | "vonage";
    type?: string;
    extNumber?: string;
    password?: string;
  };
  lmPlayer: { id: string; password: string; license: string };
  notes?: string;
  createdAt: string;
}

interface Employee {
  id: string;
  fullName: string;
  department: string;
  status: "active" | "inactive";
}
interface Department {
  id: string;
  name: string;
}

interface PendingITNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  tableNumber: string;
  email: string;
  createdAt: string;
  processed: boolean;
}

export default function ITDashboard() {
  const [records, setRecords] = useState<ITRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [pendingNotifications, setPendingNotifications] = useState<
    PendingITNotification[]
  >([]);
  const [previewSecrets, setPreviewSecrets] = useState(false);
  const [previewFull, setPreviewFull] = useState(false);
  const requirePreviewPasscode = () => {
    const code = prompt("Enter passcode to show passwords");
    if (code === "1111") setPreviewSecrets(true);
    else if (code !== null) alert("Incorrect passcode");
  };

  useEffect(() => {
    const its = localStorage.getItem("itAccounts");
    const emps = localStorage.getItem("hrEmployees");
    const depts = localStorage.getItem("departments");
    const pending = localStorage.getItem("pendingITNotifications");
    if (its) setRecords(JSON.parse(its));
    if (emps) setEmployees(JSON.parse(emps));
    if (depts) setDepartments(JSON.parse(depts));
    if (pending) {
      const notifications = JSON.parse(pending);
      // Only show unprocessed notifications
      setPendingNotifications(
        notifications.filter((n: PendingITNotification) => !n.processed),
      );
    }
  }, []);

  const handleProcessEmployee = (notification: PendingITNotification) => {
    // Do NOT mark processed here. Keep notification until IT record is created.
    const urlParams = new URLSearchParams({
      employeeId: notification.employeeId,
      employeeName: notification.employeeName,
      department: notification.department,
      tableNumber: notification.tableNumber,
    });
    window.location.href = `/it?${urlParams.toString()}`;
  };

  const stats = useMemo(() => {
    const uniqueEmpIds = new Set(records.map((r) => r.employeeId));
    const activeWithIT = employees.filter(
      (e) => e.status === "active" && uniqueEmpIds.has(e.id),
    ).length;
    return {
      totalRecords: records.length,
      employeesWithIT: uniqueEmpIds.size,
      activeWithIT,
    };
  }, [records, employees]);

  const filtered = records.filter((r) => {
    const matchDept = deptFilter === "all" || r.department === deptFilter;
    const providerLabel =
      (r as any).vitelGlobal?.provider === "vonage"
        ? "vonage"
        : (r as any).vitelGlobal?.provider
          ? "vitel"
          : "vitel";
    const text =
      `${r.employeeName} ${r.systemId} ${r.emails.map((e) => e.email).join(" ")} ${r.vitelGlobal?.id || ""} ${providerLabel}`.toLowerCase();
    const matchQuery = !query || text.includes(query.toLowerCase());
    return matchDept && matchQuery;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ServerCog className="h-7 w-7 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">IT Dashboard</h1>
              <p className="text-slate-400">
                Overview of IT accounts and systems
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 relative"
                >
                  <Bell className="h-4 w-4" />
                  {pendingNotifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      {pendingNotifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-slate-800 border-slate-700 text-white w-80"
                align="end"
              >
                {pendingNotifications.length === 0 ? (
                  <DropdownMenuItem className="focus:bg-slate-700 cursor-default">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="h-4 w-4" />
                      No pending IT setups
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm font-semibold text-slate-300 border-b border-slate-700">
                      Pending IT Setups ({pendingNotifications.length})
                    </div>
                    {pendingNotifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="focus:bg-slate-700 cursor-pointer p-3"
                        onClick={() => handleProcessEmployee(notification)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {notification.employeeName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-orange-500/20 text-orange-400 text-xs"
                            >
                              New
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400">
                            {notification.department} • Table{" "}
                            {notification.tableNumber}
                          </div>
                          <div className="text-xs text-slate-500">
                            Created{" "}
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString()}
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white mt-2 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcessEmployee(notification);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Process IT Setup
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => (window.location.href = "/it")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Add Credentials <Plus className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total IT Records</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.totalRecords}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ServerCog className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Employees with IT</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.employeesWithIT}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active with IT</p>
                <p className="text-2xl font-semibold text-white">
                  {stats.activeWithIT}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Status</p>
                <p className="text-2xl font-semibold text-green-400">Online</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Hardware Assets</p>
                <p className="text-2xl font-semibold text-white">127</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Monitor className="h-6 w-6 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Security Alerts</p>
                <p className="text-2xl font-semibold text-red-400">3</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Network Health</p>
                <p className="text-2xl font-semibold text-green-400">99.8%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wifi className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Storage Used</p>
                <p className="text-2xl font-semibold text-white">73%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Open Tickets</p>
                <p className="text-2xl font-semibold text-white">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Server Load</p>
                <p className="text-2xl font-semibold text-white">45%</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Critical Issues</p>
                <p className="text-2xl font-semibold text-red-400">2</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Software Licenses</p>
                <p className="text-2xl font-semibold text-white">89</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <ServerCog className="h-6 w-6 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">IT Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-300"
                >
                  {filtered.length}
                </Badge>
                <span className="text-slate-400">results</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, system, email"
                  className="bg-slate-800/50 border-slate-700 text-white w-64"
                />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                  onClick={() => {
                    setQuery("");
                    setDeptFilter("all");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>System ID</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Emails</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Provider ID</TableHead>
                    <TableHead>LM Player</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.employeeName}
                      </TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{r.systemId}</TableCell>
                      <TableCell>{r.tableNumber}</TableCell>
                      <TableCell>
                        {r.emails.map((e) => e.email).join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        {r.vitelGlobal?.id
                          ? (r as any).vitelGlobal?.provider === "vonage"
                            ? "Vonage"
                            : "Vitel Global"
                          : "-"}
                      </TableCell>
                      <TableCell>{r.vitelGlobal?.id || "-"}</TableCell>
                      <TableCell>{r.lmPlayer.id || "-"}</TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Preview
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="bg-slate-900 border-slate-700 text-white w-screen max-w-none h-screen overflow-y-auto"
                          >
                            <SheetHeader>
                              <SheetTitle className="text-white">
                                IT Account Preview
                              </SheetTitle>
                            </SheetHeader>
                            <div className="mt-3 flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300"
                                onClick={() => setPreviewFull((v) => !v)}
                              >
                                {previewFull
                                  ? "Hide Details"
                                  : "View Full Details"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300"
                                onClick={() =>
                                  previewSecrets
                                    ? setPreviewSecrets(false)
                                    : requirePreviewPasscode()
                                }
                              >
                                {previewSecrets
                                  ? "Hide Passwords"
                                  : "Show Passwords"}
                              </Button>
                            </div>
                            <div className="mt-4 space-y-4 text-sm text-slate-300">
                              {(() => {
                                const emp =
                                  (employees as any[]).find(
                                    (e: any) => e.id === r.employeeId,
                                  ) || null;
                                const initials = (r.employeeName || "?")
                                  .split(" ")
                                  .map((x) => x[0])
                                  .slice(0, 2)
                                  .join("");
                                return (
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                      <AvatarImage
                                        src={
                                          (emp && emp.photo) ||
                                          "/placeholder.svg"
                                        }
                                        alt={r.employeeName}
                                      />
                                      <AvatarFallback>
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-lg font-semibold text-white">
                                        {r.employeeName}
                                      </div>
                                      <div className="text-slate-400 text-xs">
                                        Emp ID:{" "}
                                        {emp?.employeeId || r.employeeId}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                  <div className="text-slate-400">
                                    Department
                                  </div>
                                  <div className="text-white/90">
                                    {r.department}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">
                                    System ID
                                  </div>
                                  <div className="text-white/90">
                                    {r.systemId}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">Table</div>
                                  <div className="text-white/90">
                                    {r.tableNumber}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">Provider</div>
                                  <div className="text-white/90">
                                    {r.vitelGlobal?.id
                                      ? (r as any).vitelGlobal?.provider ===
                                        "vonage"
                                        ? "Vonage"
                                        : "Vitel Global"
                                      : "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">
                                    Provider ID
                                  </div>
                                  <div className="text-white/90">
                                    {r.vitelGlobal?.id || "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">
                                    LM Player
                                  </div>
                                  <div className="text-white/90">
                                    {r.lmPlayer?.id || "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">License</div>
                                  <div className="text-white/90">
                                    {r.lmPlayer?.license || "-"}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-slate-400 mb-1">
                                  Emails
                                </div>
                                {(r.emails || []).length ? (
                                  <div className="rounded border border-slate-700 bg-slate-800/30 divide-y divide-slate-700">
                                    {(r.emails as any[]).map(
                                      (e: any, i: number) => (
                                        <div
                                          key={i}
                                          className="p-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs"
                                        >
                                          <div>
                                            <div className="text-slate-500">
                                              Provider
                                            </div>
                                            <div>
                                              {e.providerCustom ||
                                                e.provider ||
                                                "-"}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-slate-500">
                                              Email
                                            </div>
                                            <div>{e.email || "-"}</div>
                                          </div>
                                          <div>
                                            <div className="text-slate-500">
                                              Password
                                            </div>
                                            <div>
                                              {e.password
                                                ? previewSecrets
                                                  ? e.password
                                                  : "••••••"
                                                : "-"}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <div className="rounded border border-slate-700 bg-slate-800/30 p-2 text-xs">
                                    -
                                  </div>
                                )}
                              </div>

                              {(() => {
                                if (!previewFull) return null;
                                const assetsRaw =
                                  localStorage.getItem("systemAssets");
                                const assets = assetsRaw
                                  ? JSON.parse(assetsRaw)
                                  : [];
                                let providerAsset: any = null;
                                if (
                                  (r as any).vitelGlobal?.provider === "vonage"
                                ) {
                                  providerAsset = assets.find(
                                    (a: any) =>
                                      a.category === "vonage" &&
                                      (a.id === r.vitelGlobal?.id ||
                                        a.vonageExtCode === r.vitelGlobal?.id ||
                                        a.vonageNumber === r.vitelGlobal?.id),
                                  );
                                } else {
                                  providerAsset = assets.find(
                                    (a: any) =>
                                      (a.category === "vitel" ||
                                        a.category === "vitel-global") &&
                                      a.id === r.vitelGlobal?.id,
                                  );
                                }
                                return (
                                  <div className="rounded border border-slate-700 bg-slate-800/30 p-3">
                                    <div className="font-medium text-white mb-2">
                                      Provider Details
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                      <div>
                                        Category:{" "}
                                        {providerAsset?.category ||
                                          (r as any).vitelGlobal?.provider ||
                                          "-"}
                                      </div>
                                      <div>ID: {r.vitelGlobal?.id || "-"}</div>
                                      <div>
                                        Vendor:{" "}
                                        {providerAsset?.vendorName || "-"}
                                      </div>
                                      <div>
                                        Company:{" "}
                                        {providerAsset?.companyName || "-"}
                                      </div>
                                      <div>
                                        Ext:{" "}
                                        {providerAsset?.vonageExtCode || "-"}
                                      </div>
                                      <div>
                                        Number:{" "}
                                        {providerAsset?.vonageNumber || "-"}
                                      </div>
                                      <div>
                                        Password:{" "}
                                        {providerAsset?.vonagePassword
                                          ? previewSecrets
                                            ? providerAsset.vonagePassword
                                            : "••••••"
                                          : "-"}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {(() => {
                                if (!previewFull) return null;
                                const pcRaw =
                                  localStorage.getItem("pcLaptopAssets");
                                const pcs = pcRaw ? JSON.parse(pcRaw) : [];
                                const pc =
                                  pcs.find((x: any) => x.id === r.systemId) ||
                                  {};
                                const assetsRaw2 =
                                  localStorage.getItem("systemAssets");
                                const assets2 = assetsRaw2
                                  ? JSON.parse(assetsRaw2)
                                  : [];
                                const nameFor = (id: string) => {
                                  if (!id) return "-";
                                  const a = assets2.find(
                                    (t: any) => t.id === id,
                                  );
                                  return a
                                    ? `${a.companyName || a.vendorName || "-"} (${a.id})`
                                    : id;
                                };
                                const rows = [
                                  {
                                    label: "Mouse",
                                    v: nameFor((pc as any).mouseId),
                                  },
                                  {
                                    label: "Keyboard",
                                    v: nameFor((pc as any).keyboardId),
                                  },
                                  {
                                    label: "Motherboard",
                                    v: nameFor((pc as any).motherboardId),
                                  },
                                  {
                                    label: "Camera",
                                    v: nameFor((pc as any).cameraId),
                                  },
                                  {
                                    label: "Headphone",
                                    v: nameFor((pc as any).headphoneId),
                                  },
                                  {
                                    label: "Power Supply",
                                    v: nameFor((pc as any).powerSupplyId),
                                  },
                                  {
                                    label: "RAM",
                                    v: nameFor((pc as any).ramId),
                                  },
                                  {
                                    label: "Monitor",
                                    v: nameFor((pc as any).monitorId),
                                  },
                                ];
                                return (
                                  <div className="rounded border border-slate-700 bg-slate-800/30 p-3">
                                    <div className="font-medium text-white mb-2">
                                      System Details
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                      {rows.map((row) => (
                                        <div key={row.label}>
                                          <div className="text-slate-500">
                                            {row.label}
                                          </div>
                                          <div>{row.v}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {r.notes && (
                                <div>
                                  <div className="text-slate-400 mb-1">
                                    Notes
                                  </div>
                                  <div className="rounded border border-slate-700 bg-slate-800/30 p-2 text-xs whitespace-pre-wrap">
                                    {r.notes}
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-slate-500">
                                Created:{" "}
                                {new Date(r.createdAt).toLocaleString()}
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  className="bg-blue-500 hover:bg-blue-600 text-white"
                                  onClick={() => {
                                    const params = new URLSearchParams({
                                      itId: r.id,
                                    });
                                    window.location.href = `/it?${params.toString()}`;
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-1" /> Edit IT
                                </Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => (window.location.href = "/it")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go to IT Form <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
