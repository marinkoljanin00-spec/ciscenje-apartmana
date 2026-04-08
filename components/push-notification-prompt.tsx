'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X, Share, Plus, MoreHorizontal, ChevronDown } from 'lucide-react';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return ('standalone' in window.navigator) && (window.navigator as any).standalone;
}

export function PushNotificationPrompt({ userId }: { userId?: number }) {
  const [show, setShow] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const timer = setTimeout(() => {
      if (isIOS()) {
        if (!isInStandaloneMode()) {
          setShowIOSGuide(true);
        } else {
          if ('Notification' in window && Notification.permission === 'default') {
            setShow(true);
          }
        }
      } else {
        if ('Notification' in window) {
          setPermission(Notification.permission);
          if (Notification.permission === 'default') {
            setShow(true);
          }
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  async function subscribe() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
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
    setShow(false);
    setShowIOSGuide(false);
  }

  // iOS uputa — dodaj na početni zaslon
  if (showIOSGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-5 z-40">
        <button onClick={dismiss} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 rounded-full p-2">
            <Bell className="text-emerald-600" size={20} />
          </div>
          <div>
            <p className="font-bold text-base text-black">Primajte obavijesti o novim poslovima</p>
            <p className="text-xs text-zinc-500">Instalirajte app za primanje obavijesti</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-3">
            <div className="bg-blue-100 rounded-full p-1.5 shrink-0">
              <MoreHorizontal size={14} className="text-blue-600" />
            </div>
            <p className="text-xs text-black">
              <span className="font-bold">Korak 1:</span> Kliknite <span className="font-bold">tri točkice</span> (···) u donjem desnom kutu Safarija
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-3">
            <div className="bg-blue-100 rounded-full p-1.5 shrink-0">
              <Share size={14} className="text-blue-600" />
            </div>
            <p className="text-xs text-black">
              <span className="font-bold">Korak 2:</span> Kliknite <span className="font-bold">Podijeli</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-3">
            <div className="bg-zinc-200 rounded-full p-1.5 shrink-0">
              <ChevronDown size={14} className="text-zinc-600" />
            </div>
            <p className="text-xs text-black">
              <span className="font-bold">Korak 3:</span> Skrolajte dolje i kliknite <span className="font-bold">Prikaži više</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3">
            <div className="bg-emerald-100 rounded-full p-1.5 shrink-0">
              <Plus size={14} className="text-emerald-600" />
            </div>
            <p className="text-xs text-black">
              <span className="font-bold">Korak 4:</span> Kliknite <span className="font-bold">"Dodaj na početni zaslon"</span> → Dodaj
            </p>
          </div>

          <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
            <div className="bg-purple-100 rounded-full p-1.5 shrink-0">
              <Bell size={14} className="text-purple-600" />
            </div>
            <p className="text-xs text-black">
              <span className="font-bold">Korak 5:</span> Otvorite app s početnog zaslona i primajte obavijesti ✅
            </p>
          </div>
        </div>

        <Button onClick={dismiss} variant="outline" className="w-full text-sm">
          Zatvori
        </Button>
      </div>
    );
  }

  // Android / Desktop popup
  if (!show || permission !== 'default') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-5 z-40">
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
