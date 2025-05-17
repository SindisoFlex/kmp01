
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Membership", path: "/membership" },
  { name: "Contact", path: "/contact" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { playSound } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    playSound("click");
  };

  const handleNavClick = () => {
    setIsOpen(false);
    playSound("click");
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={() => playSound("click")}>
            <span className="text-xl font-bold tracking-tight">
              Studio<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="nav-link text-sm font-medium transition-colors"
                onClick={() => playSound("click")}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Menu, Admin/Staff Login, Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <UserMenu />
            
            {/* Admin/Staff Login Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => playSound("click")}>
                  <LogIn className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Employee Access</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild onClick={() => playSound("click")}>
                  <Link to="/admin/login" className="cursor-pointer">Admin Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onClick={() => playSound("click")}>
                  <Link to="/staff/login" className="cursor-pointer">Staff Login</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={handleMenuToggle}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background animate-fade-in">
          <div className="page-container py-4">
            <div className="flex justify-between items-center">
              <Link 
                to="/" 
                className="text-xl font-bold"
                onClick={handleNavClick}
              >
                Studio<span className="text-primary">X</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMenuToggle}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-8 space-y-6 flex flex-col items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-lg font-medium py-2 hover:text-primary transition-colors"
                  onClick={handleNavClick}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border w-full flex flex-col items-center space-y-4">
                <Link
                  to="/admin/login"
                  className="text-lg font-medium py-2 hover:text-primary transition-colors"
                  onClick={handleNavClick}
                >
                  Admin Login
                </Link>
                <Link
                  to="/staff/login"
                  className="text-lg font-medium py-2 hover:text-primary transition-colors"
                  onClick={handleNavClick}
                >
                  Staff Login
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
