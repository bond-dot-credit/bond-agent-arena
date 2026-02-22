'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRight } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useAppStore } from '../../hooks/useStore';
import { Button } from '../../components/ui/Button';

export function ConnectModal() {
  const { modal, closeModal } = useAppStore();
  const { connect } = useWallet();

  const handleConnect = () => {
    connect();
    closeModal();
  };

  const isOpen = modal.isOpen && modal.type === 'connect';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 m-auto z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-black/5 rounded-2xl shadow-card w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-black/5">
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Connect Wallet</span>
                </div>
                <div className="w-10" />
              </div>

              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative w-24 h-24 mx-auto mb-6"
                >
                  <div className="absolute inset-0 bg-[#1172e1]/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-[#1172e1]/30 rounded-full" />
                  <div className="relative w-full h-full bg-[#1172e1] rounded-full flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-black mb-2"
                >
                  Waiting for Wallet
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 mb-6"
                >
                  For best experience, connect only one wallet at a time.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleConnect}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Connect Wallet
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
