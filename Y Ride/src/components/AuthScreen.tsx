import { motion } from 'motion/react';
import { Car, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';

interface AuthScreenProps {
  onAuth: () => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-white flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="bg-green-600 rounded-full p-3">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl text-gray-900">RideMate</h1>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-8">Sign in to continue</p>

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Button
                onClick={onAuth}
                className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 h-12"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
              <p className="text-xs text-gray-500 text-center">
                OAuth 2.0 Google Sign-In Integration
              </p>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="bg-gray-100 rounded-lg px-4 flex items-center">
                    <span className="text-gray-700">+91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 h-12"
                  />
                </div>
                <Button
                  onClick={onAuth}
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  disabled={phoneNumber.length < 10}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Send OTP
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to RideMate's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
