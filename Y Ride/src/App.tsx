import { useState } from 'react';
import { Toaster } from 'sonner@2.0.3';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import MapScreen from './components/MapScreen';
import BookingConfirmation from './components/BookingConfirmation';
import RideTracking from './components/RideTracking';
import RideHistory from './components/RideHistory';

type Screen = 'splash' | 'auth' | 'map' | 'confirmation' | 'tracking' | 'history';

export interface BookingData {
  pickupLocation: string;
  dropLocation: string;
  distance: number;
  duration: number;
  vehicleType: 'Bike' | 'Auto' | 'Cab';
  fare: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  // Auto-transition from splash to auth after 2 seconds
  useState(() => {
    if (currentScreen === 'splash') {
      setTimeout(() => {
        setCurrentScreen('auth');
      }, 2000);
    }
  });

  const handleAuth = () => {
    setIsAuthenticated(true);
    setCurrentScreen('map');
  };

  const handleBookRide = (data: BookingData) => {
    setBookingData(data);
    setCurrentScreen('confirmation');
  };

  const handleConfirmBooking = () => {
    setCurrentScreen('tracking');
  };

  const handleCompleteRide = () => {
    setCurrentScreen('map');
  };

  const handleViewHistory = () => {
    setCurrentScreen('history');
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-white">
        {currentScreen === 'splash' && <SplashScreen />}
        {currentScreen === 'auth' && <AuthScreen onAuth={handleAuth} />}
        {currentScreen === 'map' && (
          <MapScreen 
            onBookRide={handleBookRide} 
            onViewHistory={handleViewHistory}
          />
        )}
        {currentScreen === 'confirmation' && bookingData && (
          <BookingConfirmation 
            bookingData={bookingData}
            onConfirm={handleConfirmBooking}
            onCancel={handleBackToMap}
          />
        )}
        {currentScreen === 'tracking' && bookingData && (
          <RideTracking 
            bookingData={bookingData}
          onComplete={handleCompleteRide}
        />
      )}
        {currentScreen === 'history' && (
          <RideHistory onBack={handleBackToMap} />
        )}
      </div>
    </>
  );
}
