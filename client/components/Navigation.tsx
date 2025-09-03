import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings,
  LogOut,
  User,
  Menu,
  LogIn,
  Users,
  Building2,
  LayoutDashboard,
  Database,
} from "lucide-react";

export default function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");

    setIsAuthenticated(!!auth);
    setUserRole(role || "");
    setCurrentUser(user || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setUserRole("");
    setCurrentUser("");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleViewUsers = () => {
    // Navigate to admin dashboard and scroll to users section
    if (location.pathname === "/admin") {
      const usersSection = document.getElementById("users-section");
      if (usersSection) {
        usersSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/admin");
    }
  };

  const handleHRDashboard = () => {
    navigate("/hr");
  };

  const handleMainDashboard = () => {
    navigate("/deshbord");
  };

  const handleMasterAdmin = () => {
    navigate("/master-admin");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-blue-400 hover:scale-110">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-white">
                {isAuthenticated
                  ? userRole === "admin"
                    ? "Admin Dashboard"
                    : `Welcome, ${currentUser}`
                  : "User Management System"}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Admin Options */}
                {userRole === "admin" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewUsers}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Users
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMainDashboard}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      IT Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHRDashboard}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      HR Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMasterAdmin}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Master Admin
                    </Button>
                  </>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {currentUser}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-slate-800 border-slate-700 text-white"
                    align="end"
                  >
                    <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="focus:bg-red-600 cursor-pointer text-red-400 focus:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Login Button for non-authenticated users */
              <Button
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900 border-slate-700 text-white">
                <SheetHeader>
                  <SheetTitle className="text-white">
                    {isAuthenticated ? `${currentUser}` : "Menu"}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {isAuthenticated ? (
                    <>
                      {/* Admin Mobile Options */}
                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleViewUsers();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View Users
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleMainDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            IT Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleHRDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            HR Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleMasterAdmin();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Master Admin
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
