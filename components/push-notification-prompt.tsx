'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X } from 'lucide-react';

export function PushNotificationPrompt({ userId }: { userId?: number }) {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    setPermission(Notification.permission);
    if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('push-dismissed');
      if (!dismissed) setTimeout(() => setShow(true), 3000);
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  }

  async function subscribe() {
    try {
      const registration = await registerServiceWorker();
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, userId }),
      });
      setPermission('granted');
      setShow(false);
    } catch (err) {
      console.error('Subscribe error:', err);
    }
  }

  function dismiss() {
    localStorage.setItem('push-dismissed', '1');
    setShow(false);
  }

  if (!show || permission !== 'default') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-5 z-50">
      <button onClick={dismiss} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600">
        <X size={18} />
      </button>
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-emerald-100 dark:bg-emerald-900 rounded-full p-2">
          <Bell className="text-emerald-600" size={20} />
        </div>
        <div>
          <p className="font-semibold text-sm">Primajte obavijesti o novim poslovima</p>
          <p className="text-xs text-zinc-500">Budite prvi koji prihvate novi posao</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={subscribe} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
          <Bell size={14} className="mr-1" /> Da, želim
        </Button>
        <Button onClick={dismiss} variant="outline" className="flex-1 text-sm">
          <BellOff size={14} className="mr-1" /> Ne hvala
        </Button>
      </div>
    </div>
  );
}
