import { motion } from 'motion/react';
import { Car } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="bg-white rounded-full p-6">
          <Car className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-white text-4xl">RideMate</h1>
        <p className="text-green-100 text-lg">Your Ride. Smarter.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-12"
      >
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100" />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200" />
        </div>
      </motion.div>
    </div>
  );
}
