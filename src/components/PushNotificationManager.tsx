'use client'
 
import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
 
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
 
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
 
export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
 
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])
 
  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }
 
  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    setSubscription(sub)
    // Needs type assertion because web-push types and DOM types mismatch slightly
    const serializedSub = JSON.parse(JSON.stringify(sub))
    await subscribeUser(serializedSub)
    
    // Send immediate test
    await sendNotification("Welcome to MechanicFinder! You will now receive updates.")
  }
 
  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
    await unsubscribeUser()
  }
 
  if (!isSupported) {
    return null 
  }
 
  return (
    <div className="flex items-center justify-center p-4">
      {subscription ? (
        <Button variant="outline" size="sm" onClick={unsubscribeFromPush} className="gap-2 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
          <BellOff size={16} /> Disable Alerts
        </Button>
      ) : (
        <Button size="sm" onClick={subscribeToPush} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
          <Bell size={16} /> Enable Notifications
        </Button>
      )}
    </div>
  )
}
