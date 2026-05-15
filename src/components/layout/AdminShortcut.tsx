"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export function AdminShortcut() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Shift + Alt + A (Secret Shortcut)
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'a') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (data?.role === 'admin') {
            router.push('/admin')
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, supabase])

  return null
}
