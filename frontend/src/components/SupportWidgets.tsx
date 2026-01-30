'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import WhatsAppButton from './WhatsAppButton'

const SupportWidgets = () => {
  const pathname = usePathname()
  
  // Admin sayfalarında gösterme
  if (pathname?.startsWith('/admin')) {
    return null
  }

  // Tawk.to script'i
  useEffect(() => {
    const Tawk_API = (window as any).Tawk_API || {}
    const Tawk_LoadStart = new Date()
    
    const s1 = document.createElement("script")
    const s0 = document.getElementsByTagName("script")[0]
    s1.async = true
    s1.src = 'https://embed.tawk.to/697c6867dba1a41c36d9ce70/1jg6vfltq'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    s0.parentNode?.insertBefore(s1, s0)
    
    return () => {
      // Cleanup if needed
      const tawkScript = document.querySelector('script[src*="tawk.to"]')
      if (tawkScript) {
        tawkScript.remove()
      }
    }
  }, [])

  return <WhatsAppButton />
}

export default SupportWidgets
