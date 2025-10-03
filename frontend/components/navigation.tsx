"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, MapPin, Utensils, Menu, X } from "lucide-react" // Added Menu and X icons
import { UserMenu } from "./user-menu"
import { NotificationBell } from "./notification-bell"

interface NavigationProps {
  currentPage?: string
}

export function Navigation({ currentPage }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State for mobile menu

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-white/20"
          : "bg-white shadow-lg border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/NutriAI-logo.jpeg"
                  alt="NutriAI"
                  width={40}
                  height={40}
                  className="rounded-full transition-transform group-hover:scale-110 shadow-md"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                NutriAI
              </span>
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`font-semibold transition-all duration-300 px-3 py-2 rounded-lg ${
                  currentPage === "home"
                    ? "text-green-600 bg-green-50 shadow-sm"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                Inicio
              </Link>

              <div className="relative">
                <button
                  className={`font-semibold flex items-center space-x-1 transition-all duration-300 px-3 py-2 rounded-lg ${
                    currentPage === "explore"
                      ? "text-green-600 bg-green-50 shadow-sm"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  }`}
                  onMouseEnter={() => setIsExploreOpen(true)}
                  onMouseLeave={() => setIsExploreOpen(false)}
                >
                  <span>Explorar</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${isExploreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300 ${
                    isExploreOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                  }`}
                  onMouseEnter={() => setIsExploreOpen(true)}
                  onMouseLeave={() => setIsExploreOpen(false)}
                >
                  <div className="p-6">
                    <div className="space-y-4">
                      <Link
                        href="/restaurants"
                        className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group border border-transparent hover:border-green-100 hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Utensils className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                            Restaurantes
                          </h3>
                          <p className="text-sm text-gray-600">Gastronomía sostenible con productos locales</p>
                        </div>
                      </Link>

                      <Link
                        href="/maps" // Changed href to /maps
                        className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group border border-transparent hover:border-green-100 hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                            Rutas
                          </h3>
                          <p className="text-sm text-gray-600">Descubre rutas gastronómicas y turísticas</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Removed the disabled "Mapa" span */}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="hidden md:flex items-center">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white/95 backdrop-blur-lg shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 sm:px-6 space-y-4">
          <Link
            href="/"
            className={`block font-semibold transition-all duration-300 px-3 py-2 rounded-lg ${
              currentPage === "home"
                ? "text-green-600 bg-green-50 shadow-sm"
                : "text-gray-700 hover:text-green-600 hover:bg-green-50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2 px-3">Explorar</h3>
            <Link
              href="/restaurants"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Utensils className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Restaurantes</span>
            </Link>
            <Link
              href="/maps" // Changed href to /maps
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Rutas</span>
            </Link>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
