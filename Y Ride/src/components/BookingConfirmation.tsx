import { motion } from 'motion/react';
import { CheckCircle2, MapPin, Navigation, Phone, Star, X } from 'lucide-react';
import { Button } from './ui/button';
import { BookingData } from '../App';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookingConfirmationProps {
  bookingData: BookingData;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BookingConfirmation({
  bookingData,
  onConfirm,
  onCancel
}: BookingConfirmationProps) {
  // Mock driver data
  const driver = {
    name: 'Suresh Kumar',
    rating: 4.8,
    vehicle: 'KA-01-AB-1234',
    vehicleModel: bookingData.vehicleType === 'Bike' ? 'Honda Activa' : 
                   bookingData.vehicleType === 'Auto' ? 'Bajaj Auto' : 
                   'Maruti Swift',
    eta: '3 min',
    phone: '+91 98765 43210'
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col">
      {/* Success Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-green-600 text-white p-6 pt-12"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h1 className="text-xl">Ride Confirmed!</h1>
              <p className="text-sm text-green-100">Driver is on the way</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-green-700"
            onClick={onCancel}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* ETA Badge */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
          <p className="text-sm text-green-100">Arriving in</p>
          <p className="text-3xl">{driver.eta}</p>
        </div>
      </motion.div>

      {/* Driver Info Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white m-4 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-green-600 text-white text-xl">
              {driver.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg">{driver.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{driver.rating}</span>
                </div>
              </div>
              <Button size="icon" variant="outline" className="rounded-full">
                <Phone className="w-5 h-5 text-green-600" />
              </Button>
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-600">{driver.vehicleModel}</p>
              <p className="text-sm font-mono">{driver.vehicle}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trip Details */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white mx-4 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-base mb-4">Trip Details</h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="pt-1">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Pickup</p>
              <p className="text-sm">{bookingData.pickupLocation}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-gray-300" />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="pt-1">
              <MapPin className="w-3 h-3 text-red-600 fill-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Drop</p>
              <p className="text-sm">{bookingData.dropLocation}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Fare</p>
            <p className="text-2xl text-green-600">₹{bookingData.fare}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{bookingData.distance} km</p>
            <p className="text-sm text-gray-600">{bookingData.duration} min</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-auto p-4 space-y-3">
        <Button
          onClick={onConfirm}
          className="w-full bg-green-600 hover:bg-green-700 h-12"
        >
          Track Driver
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full h-12"
        >
          Cancel Ride
        </Button>
      </div>
    </div>
  );
}
