"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
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
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                NutriAI
              </span>
            </Link>
            <p className="text-sm text-gray-400">Tu plataforma para descubrir alimentación saludable y sostenible.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/restaurants" className="text-gray-400 hover:text-green-400 transition-colors">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-green-400 transition-colors">
                  Mi Perfil
                </Link>
              </li>
              <li>
                <Link href="/profile/settings" className="text-gray-400 hover:text-green-400 transition-colors">
                  Configuración
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href="mailto:info@NutriAI.com" className="text-gray-400 hover:text-green-400 transition-colors">
                  info@NutriAI.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-green-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="text-gray-400">123 Calle Saludable, Ciudad Verde, País Sano</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center space-y-4">
          <Image src="/images/NutriAI-logo.jpeg" alt="NutriAI" width={48} height={48} className="mx-auto rounded-full" />
          <div className="space-y-1">
            <p className="text-sm text-gray-600 font-medium">Maná Fruit & Healthy food, ABC & CÍA. LTDA.</p>
            <p className="text-sm text-gray-500">© 2025 [CHO]; Labs Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
