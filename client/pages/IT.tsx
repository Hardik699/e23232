import AppNav from "@/components/Navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORAGE_KEY } from "@/lib/systemAssets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, Save, Shield, ServerCog, RefreshCw } from "lucide-react";

interface Employee {
  id: string;
  fullName: string;
  department: string;
  tableNumber: string;
  email: string;
  status: "active" | "inactive";
}

interface Department {
  id: string;
  name: string;
}

type EmailCred = {
  provider: string;
  providerCustom?: string;
  email: string;
  password: string;
};

interface ITRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: EmailCred[];
  vitelGlobal: {
    id: string;
    provider: "vitel" | "vonage";
  };
  lmPlayer: { id: string; password: string; license: string };
  notes?: string;
  createdAt: string;
}

export default function ITPage() {
  const [userRole, setUserRole] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [records, setRecords] = useState<ITRecord[]>([]);

  // Load local data
  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "");
    const emps = localStorage.getItem("hrEmployees");
    const depts = localStorage.getItem("departments");
    const its = localStorage.getItem("itAccounts");
    if (emps) setEmployees(JSON.parse(emps));
    if (depts) setDepartments(JSON.parse(depts));
    if (its) setRecords(JSON.parse(its));

    // Load available PC/Laptop IDs
    loadAvailableSystemIds();
  }, []);

  // Handle URL parameters after employees are loaded
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const preItId = urlParams.get("itId") || "";

    // If editing an existing IT record by id, load everything
    if (preItId) {
      const itsRaw = localStorage.getItem("itAccounts");
      const all: ITRecord[] = itsRaw ? JSON.parse(itsRaw) : [];
      const rec = all.find((x) => x.id === preItId);
      if (rec) {
        setEmployeeId(rec.employeeId);
        setDepartment(rec.department);
        setTableNumber(rec.tableNumber);
        setSystemId(rec.systemId);
        setPreSelectedSystemId(rec.systemId);
        setEmails(
          rec.emails && rec.emails.length
            ? rec.emails
            : [
                {
                  provider: "CUSTOM",
                  providerCustom: "",
                  email: "",
                  password: "",
                },
              ],
        );
        setProvider((rec.vitelGlobal?.provider as any) || "vitel");
        setVitel({ id: rec.vitelGlobal?.id || "" });
        setPreSelectedProviderId(rec.vitelGlobal?.id || "");
        setLm({
          id: rec.lmPlayer?.id || "",
          password: rec.lmPlayer?.password || "",
          license: rec.lmPlayer?.license || "standard",
        });
        setNotes(rec.notes || "");
        setIsPreFilled(true);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return;
      }
    }

    // Otherwise, fall back to param-based prefill (HR notification / partial edit)
    const preEmployeeId = urlParams.get("employeeId") || "";
    const preDepartment = urlParams.get("department") || "";
    const preTableNumber = urlParams.get("tableNumber") || "";
    const preSystemId = urlParams.get("systemId") || "";
    const preProvider = urlParams.get("provider") || "";
    const preProviderId = urlParams.get("providerId") || "";
    const preLmId = urlParams.get("lmId") || "";
    const preLmPassword = urlParams.get("lmPassword") || "";

    if (preEmployeeId) setEmployeeId(preEmployeeId);
    if (preDepartment) setDepartment(preDepartment);
    if (preTableNumber) setTableNumber(preTableNumber);

    if (preEmployeeId && employees.length > 0) {
      const foundEmployee = employees.find((emp) => emp.id === preEmployeeId);
      if (foundEmployee) {
        if (!preDepartment) setDepartment(foundEmployee.department || "");
        if (!preTableNumber && foundEmployee.tableNumber)
          setTableNumber(String(foundEmployee.tableNumber));
      }
    }

    if (preSystemId) {
      setSystemId(preSystemId);
      setPreSelectedSystemId(preSystemId);
    }

    if (preProvider === "vonage" || preProvider === "vitel") {
      setProvider(preProvider as any);
    } else if (preProviderId) {
      const raw = localStorage.getItem(STORAGE_KEY);
      const assets = raw ? (JSON.parse(raw) as any[]) : [];
      const isVonage = assets.some(
        (a) =>
          a.category === "vonage" &&
          (a.vonageExtCode === preProviderId ||
            a.vonageNumber === preProviderId ||
            a.id === preProviderId),
      );
      setProvider(isVonage ? ("vonage" as any) : ("vitel" as any));
    }

    if (preProviderId) {
      setVitel({ id: preProviderId });
      setPreSelectedProviderId(preProviderId);
    }

    if (preLmId) setLm((s) => ({ ...s, id: preLmId }));
    if (preLmPassword) setLm((s) => ({ ...s, password: preLmPassword }));

    if (
      preEmployeeId ||
      preSystemId ||
      preProvider ||
      preProviderId ||
      preLmId ||
      preLmPassword
    ) {
      setIsPreFilled(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [employees]);

  // Load and filter available PC/Laptop IDs
  const loadAvailableSystemIds = () => {
    const pcLaptopData = localStorage.getItem("pcLaptopAssets");
    const itRecords = localStorage.getItem("itAccounts");

    if (pcLaptopData) {
      const pcLaptops = JSON.parse(pcLaptopData);
      const pcLaptopIds = pcLaptops.map((item: any) => item.id);

      // Get currently assigned system IDs
      const assignedIds = itRecords
        ? JSON.parse(itRecords).map((record: ITRecord) => record.systemId)
        : [];

      // Filter out assigned IDs to show only available ones
      let available = pcLaptopIds.filter(
        (id: string) => !assignedIds.includes(id),
      );
      if (
        preSelectedSystemId &&
        !available.includes(preSelectedSystemId) &&
        pcLaptopIds.includes(preSelectedSystemId)
      ) {
        available = [preSelectedSystemId, ...available];
      }
      setAvailableSystemIds(available);
    }
  };

  const saveRecords = (next: ITRecord[]) => {
    setRecords(next);
    localStorage.setItem("itAccounts", JSON.stringify(next));

    // Refresh available system IDs after saving
    loadAvailableSystemIds();
  };

  // Form state
  const [employeeId, setEmployeeId] = useState<string>("");
  const employee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId],
  );
  const [systemId, setSystemId] = useState("");
  const [preSelectedSystemId, setPreSelectedSystemId] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [emails, setEmails] = useState<EmailCred[]>([
    { provider: "CUSTOM", providerCustom: "", email: "", password: "" },
  ]);
  const [provider, setProvider] = useState<"vitel" | "vonage">("vitel");
  const [vitel, setVitel] = useState({ id: "" });
  const [lm, setLm] = useState({ id: "", password: "", license: "standard" });
  const [notes, setNotes] = useState("");
  const [secretsVisible, setSecretsVisible] = useState(false);
  const [availableSystemIds, setAvailableSystemIds] = useState<string[]>([]);
  const [providerIds, setProviderIds] = useState<string[]>([]);
  const [pcPreview, setPcPreview] = useState<any | null>(null);
  const [providerPreview, setProviderPreview] = useState<any | null>(null);
  const [preSelectedProviderId, setPreSelectedProviderId] =
    useState<string>("");
  const [isPreFilled, setIsPreFilled] = useState(false);

  useEffect(() => {
    if (employee) {
      setDepartment(employee.department || "");
      if (employee.tableNumber) setTableNumber(String(employee.tableNumber));
    }
  }, [employee]);

  // Load provider IDs from System Info assets
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const assets = raw ? (JSON.parse(raw) as any[]) : [];
    let ids = assets
      .filter((a) =>
        provider === "vonage"
          ? a.category === "vonage"
          : a.category === "vitel" || a.category === "vitel-global",
      )
      .map((a) => {
        if (provider === "vonage")
          return a.vonageExtCode || a.vonageNumber || a.id;
        return a.id;
      })
      .filter((x) => typeof x === "string" && x.trim());
    if (preSelectedProviderId && !ids.includes(preSelectedProviderId)) {
      ids = [preSelectedProviderId, ...ids];
    }
    setProviderIds(ids);
    setVitel((s) => ({
      id: ids.includes(s.id) ? s.id : preSelectedProviderId || "",
    }));
  }, [provider, preSelectedProviderId]);

  // Ensure the pre-selected System ID is present in options after URL parsing
  useEffect(() => {
    loadAvailableSystemIds();
  }, [preSelectedSystemId]);

  // Auto-load PC/Laptop details when System ID changes
  useEffect(() => {
    if (!systemId) {
      setPcPreview(null);
      return;
    }
    const raw = localStorage.getItem("pcLaptopAssets");
    const list = raw ? (JSON.parse(raw) as any[]) : [];
    const found = list.find((x) => x.id === systemId) || null;
    setPcPreview(found);
  }, [systemId]);

  // Auto-load provider details when provider ID changes
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const assets = raw ? (JSON.parse(raw) as any[]) : [];
    if (!vitel.id) {
      setProviderPreview(null);
      return;
    }
    if (provider === "vonage") {
      const match = assets.find(
        (a) =>
          a.category === "vonage" &&
          (a.vonageExtCode === vitel.id ||
            a.vonageNumber === vitel.id ||
            a.id === vitel.id),
      );
      setProviderPreview(match || null);
    } else {
      const match = assets.find(
        (a) =>
          (a.category === "vitel" || a.category === "vitel-global") &&
          a.id === vitel.id,
      );
      setProviderPreview(match || null);
    }
  }, [provider, vitel.id]);

  const availableTables = useMemo(
    () => Array.from({ length: 32 }, (_, i) => String(i + 1)),
    [],
  );

  const usedTables = useMemo(() => {
    return new Set(
      employees
        .filter((e) => e.status === "active" && e.tableNumber)
        .map((e) => String(e.tableNumber)),
    );
  }, [employees]);

  const filteredTables = useMemo(() => {
    const keep = String(employee?.tableNumber || "");
    return availableTables.filter(
      (n) => (keep && n === keep) || !usedTables.has(n),
    );
  }, [availableTables, usedTables, employee]);

  const hasAssignedTable = useMemo(
    () =>
      !!(
        (employee?.tableNumber && String(employee.tableNumber).trim()) ||
        (tableNumber && String(tableNumber).trim())
      ),
    [employee, tableNumber],
  );

  const addEmailRow = () =>
    setEmails((rows) => [
      ...rows,
      { provider: "CUSTOM", providerCustom: "", email: "", password: "" },
    ]);

  const requirePasscode = () => {
    const code = prompt("Enter passcode to view passwords");
    if (code === "1111") {
      setSecretsVisible(true);
    } else if (code !== null) {
      alert("Incorrect passcode");
    }
  };
  const removeEmailRow = (idx: number) =>
    setEmails((rows) => rows.filter((_, i) => i !== idx));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !systemId || !department || !tableNumber) {
      alert(
        "Please fill required fields (Employee, System ID, Department, Table)",
      );
      return;
    }
    const cleanEmails = emails.filter((r) => r.email.trim());
    const rec: ITRecord = {
      id: `${Date.now()}`,
      employeeId,
      employeeName: employee?.fullName || "",
      systemId: systemId.trim(),
      tableNumber,
      department,
      emails: cleanEmails,
      vitelGlobal: { id: vitel.id.trim(), provider },
      lmPlayer: { ...lm },
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    saveRecords([rec, ...records]);

    // Mark related pending IT notification as processed
    const allNotifications = JSON.parse(
      localStorage.getItem("pendingITNotifications") || "[]",
    );
    const updatedNotifications = allNotifications.map((n: any) =>
      n.employeeId === employeeId ? { ...n, processed: true } : n,
    );
    localStorage.setItem(
      "pendingITNotifications",
      JSON.stringify(updatedNotifications),
    );

    // reset minimal
    setSystemId("");
    setEmails([
      { provider: "CUSTOM", providerCustom: "", email: "", password: "" },
    ]);
    setProvider("vitel");
    setVitel({ id: "" });
    setLm({ id: "", password: "", license: "standard" });
    setNotes("");
    alert("Saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <ServerCog className="h-7 w-7 text-blue-400" /> IT Management
            </h1>
            <p className="text-slate-400">
              Create and store system credentials
            </p>
          </div>
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
            Role: {userRole || "guest"}
          </Badge>
        </header>

        {isPreFilled && (
          <Card className="bg-blue-900/30 border-blue-500/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-100 font-medium">
                    Form Pre-filled from HR Notification
                  </p>
                  <p className="text-blue-300 text-sm">
                    Employee Name, Department, and Table Number have been
                    automatically loaded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Add IT Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="space-y-2">
                <Label className="text-slate-300">Employee Name</Label>
                {isPreFilled && employeeId ? (
                  <>
                    <Input
                      value={employee?.fullName || ""}
                      disabled
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <input type="hidden" value={employeeId} />
                  </>
                ) : (
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">System ID</Label>
                    <Badge
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {availableSystemIds.length} available
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    onClick={loadAvailableSystemIds}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    title="Refresh available IDs"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <Select value={systemId} onValueChange={setSystemId}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue
                      placeholder={
                        availableSystemIds.length
                          ? "Select available PC/Laptop ID"
                          : "No PC/Laptop IDs available"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                    {availableSystemIds.length === 0 ? (
                      <div className="px-3 py-2 text-slate-400">
                        No available PC/Laptop IDs. Create some in PC/Laptop
                        Info first.
                      </div>
                    ) : (
                      availableSystemIds.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {pcPreview && (
                  <div className="mt-2 p-3 rounded border border-slate-700 bg-slate-800/30 text-slate-300 text-sm">
                    <div className="font-medium text-white mb-1">
                      PC/Laptop Preview: {pcPreview.id}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>Mouse: {pcPreview.mouseId || "-"}</div>
                      <div>Keyboard: {pcPreview.keyboardId || "-"}</div>
                      <div>Motherboard: {pcPreview.motherboardId || "-"}</div>
                      <div>Camera: {pcPreview.cameraId || "-"}</div>
                      <div>Headphone: {pcPreview.headphoneId || "-"}</div>
                      <div>Power Supply: {pcPreview.powerSupplyId || "-"}</div>
                      <div>RAM: {pcPreview.ramId || "-"}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Department</Label>
                {isPreFilled ? (
                  <Input
                    value={department}
                    disabled
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                ) : (
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {!hasAssignedTable && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Table Number</Label>
                  <Select value={tableNumber} onValueChange={setTableNumber}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select table (1-32)" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {filteredTables.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Emails */}
              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Emails and Passwords</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                      onClick={() =>
                        secretsVisible
                          ? setSecretsVisible(false)
                          : requirePasscode()
                      }
                    >
                      {secretsVisible ? "Hide Passwords" : "Show Passwords"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                      onClick={addEmailRow}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Email
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {emails.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                    >
                      <div className="space-y-2">
                        <Select
                          value={row.provider}
                          onValueChange={(v) =>
                            setEmails((r) =>
                              r.map((x, i) =>
                                i === idx ? { ...x, provider: v } : x,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                            {[
                              "WX",
                              "NSIT",
                              "LP",
                              "MS TEMS",
                              "OURVIN",
                              "MOSTER",
                              "CUSTOM",
                            ].map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.provider === "CUSTOM" && (
                          <Input
                            placeholder="Custom provider"
                            value={row.providerCustom || ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEmails((r) =>
                                r.map((x, i) =>
                                  i === idx ? { ...x, providerCustom: v } : x,
                                ),
                              );
                            }}
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        )}
                      </div>
                      <Input
                        placeholder="email@example.com"
                        value={row.email}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEmails((r) =>
                            r.map((x, i) =>
                              i === idx ? { ...x, email: v } : x,
                            ),
                          );
                        }}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                      <Input
                        placeholder="password"
                        value={row.password}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEmails((r) =>
                            r.map((x, i) =>
                              i === idx ? { ...x, password: v } : x,
                            ),
                          );
                        }}
                        className="bg-slate-800/50 border-slate-700 text-white"
                        type={secretsVisible ? "text" : "password"}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400"
                          onClick={() => removeEmailRow(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telephony Provider */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Provider</Label>
                  <Select
                    value={provider}
                    onValueChange={(v) => setProvider(v as any)}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="vitel">Vitel Global</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-300">
                    {provider === "vonage" ? "Vonage ID" : "Vitel Global ID"}
                  </Label>
                  <Select
                    value={vitel.id}
                    onValueChange={(v) => setVitel({ id: v })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          providerIds.length
                            ? "Select ID"
                            : "No IDs found in System Info"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {providerIds.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          Add{" "}
                          {provider === "vonage" ? "Vonage" : "Vitel Global"}{" "}
                          IDs in System Info
                        </div>
                      ) : (
                        providerIds.map((id) => (
                          <SelectItem key={id} value={id}>
                            {id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {providerPreview && (
                    <div className="mt-2 p-3 rounded border border-slate-700 bg-slate-800/30 text-slate-300 text-sm">
                      <div className="font-medium text-white mb-1">
                        {provider === "vonage" ? "Vonage" : "Vitel Global"}{" "}
                        Preview
                      </div>
                      {provider === "vonage" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div>
                            Ext: {providerPreview?.vonageExtCode || "-"}
                          </div>
                          <div>
                            Number: {providerPreview?.vonageNumber || "-"}
                          </div>
                          <div>
                            Password:{" "}
                            {providerPreview?.vonagePassword
                              ? secretsVisible
                                ? providerPreview.vonagePassword
                                : "••••••"
                              : "-"}
                          </div>
                          <div>ID: {providerPreview?.id || "-"}</div>
                        </div>
                      ) : (
                        <div>ID: {providerPreview?.id || "-"}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* LM Player */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">LM Player ID</Label>
                  <Input
                    value={lm.id}
                    onChange={(e) =>
                      setLm((s) => ({ ...s, id: e.target.value }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">LM Player Password</Label>
                  <Input
                    type={secretsVisible ? "text" : "password"}
                    value={lm.password}
                    onChange={(e) =>
                      setLm((s) => ({ ...s, password: e.target.value }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label className="text-slate-300">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  placeholder="Optional notes"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" /> Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Saved IT Records</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-slate-400">No IT records yet</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>System ID</TableHead>
                      <TableHead>Dept</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Emails</TableHead>
                      <TableHead>Telephony</TableHead>
                      <TableHead>LM Player</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.employeeName}
                        </TableCell>
                        <TableCell>{r.systemId}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.tableNumber}</TableCell>
                        <TableCell>
                          {r.emails.map((e) => e.email).join(", ")}
                        </TableCell>
                        <TableCell>
                          {r.vitelGlobal?.id
                            ? `${(r as any).vitelGlobal?.provider === "vonage" ? "Vonage" : (r as any).vitelGlobal?.provider ? "Vitel Global" : (r as any).vitelGlobal?.type || "Vitel Global"}: ${r.vitelGlobal.id}`
                            : "-"}
                        </TableCell>
                        <TableCell>{r.lmPlayer.id || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400"
                            onClick={() => {
                              saveRecords(records.filter((x) => x.id !== r.id));
                              // Refresh available IDs after deletion
                              setTimeout(loadAvailableSystemIds, 100);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
