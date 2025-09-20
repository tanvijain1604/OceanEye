import React, { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../i18n'

interface I18nContextType {
  currentLanguage: string
  changeLanguage: (lng: string) => void
  availableLanguages: { code: string; name: string; flag: string }[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
]

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('oceaneye-language')
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage)
      setCurrentLanguage(savedLanguage)
    }
  }, [i18n])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setCurrentLanguage(lng)
    localStorage.setItem('oceaneye-language', lng)
  }

  return (
    <I18nContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      availableLanguages 
    }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
