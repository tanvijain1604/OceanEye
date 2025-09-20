import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <motion.footer className="bg-primary-navy text-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <motion.div className="flex items-center space-x-2 mb-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌊</span>
              </div>
              <span className="text-xl font-bold">OceanEye</span>
            </motion.div>
            <p className="text-primary-seafoam mb-4 max-w-md">
              OceanEye is a comprehensive ocean safety and emergency management platform 
              designed to protect coastal communities through real-time monitoring, 
              early warning systems, and coordinated response efforts.
            </p>
            <div className="flex space-x-4">
              <motion.a href="#" className="text-primary-seafoam hover:text-white transition-colors" whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="text-xl">📧</span>
              </motion.a>
              <motion.a href="#" className="text-primary-seafoam hover:text-white transition-colors" whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="text-xl">📱</span>
              </motion.a>
              <motion.a href="#" className="text-primary-seafoam hover:text-white transition-colors" whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <span className="text-xl">🐦</span>
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.h3 className="text-lg font-semibold mb-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>Quick Links</motion.h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-seafoam hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/precautions" className="text-primary-seafoam hover:text-white transition-colors">
                  {t('nav.precautions')}
                </Link>
              </li>
              <li>
                <Link to="/local-ngos" className="text-primary-seafoam hover:text-white transition-colors">
                  {t('nav.local_ngos')}
                </Link>
              </li>
              <li>
                <Link to="/evacuation-support" className="text-primary-seafoam hover:text-white transition-colors">
                  {t('nav.evacuation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <motion.h3 className="text-lg font-semibold mb-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>Emergency Contacts</motion.h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span>🚨</span>
                <span>Emergency: 100</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🏥</span>
                <span>Medical: 108</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🔥</span>
                <span>Fire: 101</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>👮</span>
                <span>Police: 100</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-ocean/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-seafoam text-sm">
              © 2024 OceanEye. All rights reserved. Built with ❤️ for coastal communities.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-seafoam hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-seafoam hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-primary-seafoam hover:text-white text-sm transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}


