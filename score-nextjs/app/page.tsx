'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import AgentCarousel from './components/AgentCarousel';
import ChartWithData from './components/ChartWithData';
import InfoTabs from './components/InfoTabs';
import Footer from './components/Footer';
import { Card } from './components/ui/Card';
import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';
import { getAllAgents } from '@/lib/services/agentService';

const easeOut = [0.4, 0, 0.2, 1] as const;

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easeOut }
  },
};

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div 
      className="relative min-h-screen bg-white text-black overflow-x-hidden flex flex-col"
      initial="initial"
      animate="enter"
      variants={pageVariants}
    >
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />

        <motion.div
          variants={itemVariants}
          className="flex-1 px-4 md:px-6 lg:px-8"
        >
          <AgentCarousel />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-5 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <ChartWithData agents={agents} />
              </div>
              <div className="lg:col-span-2">
                <InfoTabs agents={agents} />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </motion.div>
  );
}
