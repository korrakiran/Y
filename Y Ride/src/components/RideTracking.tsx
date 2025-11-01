import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import SimpleTrackingMapComponent from './SimpleTrackingMapComponent';
import { BookingData } from '../App';

interface RideTrackingProps {
  bookingData: BookingData;
  onComplete: () => void;
}

export default function RideTracking({ bookingData, onComplete }: RideTrackingProps) {
  const [eta, setEta] = useState(3);
  const [progress, setProgress] = useState(0);
  
  // Mock coordinates - in real app, these would come from booking data
  const pickupCoords: [number, number] = [12.9716, 77.5946];
  const [driverCoords, setDriverCoords] = useState<[number, number]>([12.9616, 77.5846]);

  useEffect(() => {
    // Simulate driver movement toward pickup
    const interval = setInterval(() => {
      setDriverCoords(prev => {
        const latDiff = (pickupCoords[0] - prev[0]) * 0.1;
        const lngDiff = (pickupCoords[1] - prev[1]) * 0.1;
        return [
          prev[0] + latDiff,
          prev[1] + lngDiff
        ];
      });
      setProgress(prev => Math.min(prev + 3.33, 100));
      setEta(prev => Math.max(prev - 0.1, 0));
    }, 1000);

    // Auto complete after 30 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gray-100">
      {/* Real-time Tracking Map */}
      <SimpleTrackingMapComponent
        pickupCoords={pickupCoords}
        driverCoords={driverCoords}
      />

      {/* ETA Card */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-xl p-4 z-10"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Driver arriving in</p>
            <p className="text-2xl">{Math.ceil(eta)} min</p>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="rounded-full">
              <Phone className="w-5 h-5 text-green-600" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-gray-500 mt-2">
          {progress < 33 ? 'Driver is on the way' : 
           progress < 66 ? 'Driver is nearby' : 
           'Driver is arriving'}
        </p>
      </motion.div>

      {/* Trip Info */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-10"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <div className="flex-1">
              <p className="text-xs text-gray-600">Pickup</p>
              <p className="text-sm">{bookingData.pickupLocation}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="ml-1.5">
              <div className="w-px h-8 bg-gray-300" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-3 h-3 text-red-600 fill-red-600" />
            <div className="flex-1">
              <p className="text-xs text-gray-600">Drop</p>
              <p className="text-sm">{bookingData.dropLocation}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Fare</p>
            <p className="text-xl text-green-600">₹{bookingData.fare}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{bookingData.vehicleType}</p>
            <p className="text-sm">{bookingData.distance} km</p>
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full mt-6 bg-gray-100 text-gray-700 hover:bg-gray-200 h-12"
          variant="outline"
        >
          Complete Ride (Demo)
        </Button>
      </motion.div>
    </div>
  );
}
