import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Home, Settings, Menu, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_BG = "bg-[#101226]";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [headerBg, setHeaderBg] = useState(DEFAULT_BG);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [showInvites, setShowInvites] = useState(false);
  const lastScrollY = useRef(window.scrollY);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/teams/invites", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setInvites(data));
  }, [isAuthenticated]);

  const acceptInvite = async (inviteId: number) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/teams/invites/${inviteId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    setInvites(invites.filter(i => i.id !== inviteId));
  };

  const declineInvite = async (inviteId: number) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/teams/invites/${inviteId}/decline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    setInvites(invites.filter(i => i.id !== inviteId));
  };

  // Intersection Observer для секцій
  useEffect(() => {
    const headerHeight = 80; // h-20 = 80px
    const sections = Array.from(document.querySelectorAll("[data-header-bg]"));
    if (!sections.length) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const bg = visible[0].target.getAttribute("data-header-bg") || DEFAULT_BG;
          setHeaderBg(bg);
        }
      },
      {
        root: null,
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0
      }
    );
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  // Скрол хедер
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (window.scrollY > lastScrollY.current && window.scrollY > 60) {
        setShowNavbar(false); // вниз — сховати
      } else {
        setShowNavbar(true); // вгору — показати
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { path: "/tournaments", label: "Tournaments", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { path: "/teams", label: "Teams", icon: <Users className="h-4 w-4 mr-2" /> },
  ];
  const role = localStorage.getItem("role");
  if (isAuthenticated && role === "2") {
    navLinks.push({
      path: "/admin",
      label: "Admin Panel",
      icon: <Settings className="h-4 w-4 mr-2" />
    });
  }
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername("");
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out px-0 py-0",
        isScrolled ? "bg-esports-dark/80 backdrop-blur-md shadow-md" : "bg-transparent",
        showNavbar ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className={cn("w-full border-b-2 border-black h-20 flex items-center justify-between", headerBg)}>
        {/* Лого */}
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-transform hover:scale-105 ml-4"
        >
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-esports-purple to-esports-blue flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">EsportsMaster</span>
        </Link>

        {/* Меню по центру */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-primary",
                isActive(link.path) 
                  ? "text-primary relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-esports-purple after:to-esports-blue" 
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden flex items-center mr-4"
          onClick={() => setMobileMenu((v) => !v)}
        >
          <Menu className="w-8 h-8 text-white" />
        </button>

        {/* Правий блок */}
        <div className="hidden md:flex items-center gap-6 ml-auto mr-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="font-bold text-lg hover:underline transition-colors">
                {username}
              </Link>
              {/* Notification bell */}
              <div className="relative">
                <button onClick={() => setShowInvites(v => !v)}>
                  <Bell className="w-6 h-6 text-white" />
                  {invites.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full px-1 text-white">{invites.length}</span>
                  )}
                </button>
                {showInvites && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#23263a] rounded shadow-lg z-50 p-4">
                    <div className="font-bold text-white mb-2">Запрошення в команди</div>
                    {invites.length === 0 && <div className="text-[#bfc9e0]">Немає нових запрошень</div>}
                    {invites.map(invite => (
                      <div key={invite.id} className="flex justify-between items-center mb-2">
                        <div>
                          <div className="text-white">{invite.team_name}</div>
                          <div className="text-xs text-[#bfc9e0]">від {invite.from_username}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() => acceptInvite(invite.id)}
                          >Прийняти</button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() => declineInvite(invite.id)}
                          >Відхилити</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" className="text-sm" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="text-sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button
                className="text-sm bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity"
                onClick={() => navigate("/login?register=1")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className={cn(
            "fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-8 md:hidden"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-2xl text-white font-bold"
                onClick={() => setMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-4">
                <Link
                  to="/profile"
                  className="font-bold text-xl text-white hover:underline transition-colors"
                  onClick={() => setMobileMenu(false)}
                >
                  {username}
                </Link>
                <Button variant="outline" className="text-lg" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" className="text-lg" onClick={() => { setMobileMenu(false); navigate("/login"); }}>
                  Sign In
                </Button>
                <Button
                  className="text-lg bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("/login?register=1");
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;