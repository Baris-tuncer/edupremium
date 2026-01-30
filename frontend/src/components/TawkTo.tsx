'use client'

import { useEffect } from 'react'

const TawkTo = () => {
  useEffect(() => {
    var Tawk_API = (window as any).Tawk_API || {}
    var Tawk_LoadStart = new Date()
    
    const s1 = document.createElement("script")
    const s0 = document.getElementsByTagName("script")[0]
    s1.async = true
    s1.src = 'https://embed.tawk.to/697c6867dba1a41c36d9ce70/1jg6vfltq'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    s0.parentNode?.insertBefore(s1, s0)
  }, [])

  return null
}

export default TawkTo
