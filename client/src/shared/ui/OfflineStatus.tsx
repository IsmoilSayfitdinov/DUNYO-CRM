"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCcw } from "lucide-react";
import { Button } from "./button";

export function OfflineStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 dark:bg-slate-50/95 backdrop-blur-md p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="mb-8 p-6 rounded-full bg-red-50 dark:bg-red-500/10"
            >
              <WifiOff className="size-16 text-red-500 animate-pulse" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-4 tracking-tight"
            >
              Internet aloqasi uzildi
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 dark:text-slate-400 max-w-sm mb-8 leading-relaxed"
            >
              Havotir olmang! Tizim tiklangandan so'ng avtomatik tarzda qaytadan ulanadi. Hozircha esa internetingizni tekshirib ko'ring.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={handleRetry}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-medium shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                <RefreshCcw className="size-4" />
                Qayta yuklash
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 text-xs text-slate-400"
            >
              Antigravity v1.0 • Offline Monitoring
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {onlineNotification(showNotification)}
      </AnimatePresence>
    </>
  );
}

function onlineNotification(show: boolean) {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 20, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-full bg-green-500 text-white shadow-xl flex items-center gap-2 font-medium text-sm"
    >
      <div className="size-2 rounded-full bg-white animate-ping" />
      Aloqa tiklandi
    </motion.div>
  );
}
