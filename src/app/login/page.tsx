'use client';

import Image from 'next/image';
import tmsLogo from '@/assets/text.png';
import Logo from '@/assets/logo.jpg';
import bgImage from '@/assets/bg.jpeg';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { useLoginMutation, useBarcodeLoginMutation } from '@/store/services/authApi';
import { useAppDispatch, RootState } from '@/store';
import { setCredentials } from '@/store/features/authSlice';
import { Button } from '@/components/ui/button';
import LogoLg from '@/assets/logo-2.png';
import { Shield, Mail, Scan, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const [barcodeLogin, { isLoading: isBarcodeLoading }] = useBarcodeLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [loginMode, setLoginMode] = useState<'password' | 'barcode'>('password');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [isValidBarcode, setIsValidBarcode] = useState(false);

  // Redirect to appropriate dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.toString().toLowerCase();
      if (userRole === 'admin') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      
      // Call the API
      const response = await login({
        ...data,
      }).unwrap();
      
      // Check if login was successful
      if (response.success && response.data) {
        // Dispatch credentials with the correct data structure
        dispatch(setCredentials({
          user: response.data.user,
          tokens: response.data.tokens,
        }));
        
        // Redirect based on user role
        const userRole = response.data.user.role?.toString().toLowerCase();
        if (userRole === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      // Extract error message from different possible error formats
      let errorMessage = 'Login failed. Please try again.';
      
      // Log detailed error information for debugging
      console.error('Login error - Full error object:', err);
      console.error('Login error - Error keys:', Object.keys(err || {}));
      
      if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.status) {
        // Handle network errors with status codes
        if (err.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (err.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error (${err.status}): ${err.statusText || 'Unknown error'}`;
        }
      }
      
      console.error('Login error - Final message:', errorMessage);
      setError(errorMessage);
    }
  };

  const processBarcodeLogin = async (barcodeText: string) => {
    setIsProcessingBarcode(true);
    setError(null);

    try {
      // Extract user ID from barcode (format: GMS000001)
      const userIdMatch = barcodeText.match(/^GMS(\d+)$/);
      if (!userIdMatch) {
        setError('Invalid barcode format. Please scan a valid admin barcode.');
        return;
      }

      const userId = parseInt(userIdMatch[1], 10);

      // Call the barcode login API
      const response = await barcodeLogin({
        userId,
      }).unwrap();

      // Check if login was successful
      if (response.success && response.data) {
        // Dispatch credentials with the correct data structure
        dispatch(setCredentials({
          user: response.data.user,
          tokens: response.data.tokens,
        }));

        toast.success(`Successfully logged in as ${response.data.user.first_name} ${response.data.user.last_name}`);
        router.push('/dashboard/admin');
      } else {
        setError(response.message || 'Barcode login failed. Please try again.');
      }

    } catch (err: any) {
      // Extract error message from different possible error formats
      let errorMessage = 'Barcode login failed. Please try again.';

      console.error('Barcode login error - Full error object:', err);
      console.error('Barcode login error - Error keys:', Object.keys(err || {}));

      if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.status) {
        // Handle network errors with status codes
        if (err.status === 400) {
          errorMessage = 'Invalid barcode format.';
        } else if (err.status === 403) {
          errorMessage = 'Access denied. Only admin users can login via barcode.';
        } else if (err.status === 404) {
          errorMessage = 'User not found.';
        } else if (err.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error (${err.status}): ${err.statusText || 'Unknown error'}`;
        }
      }

      console.error('Barcode login error - Final message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessingBarcode(false);
      setBarcodeInput('');
      // Reset scanned barcode state after processing
      setScannedBarcode(null);
      setIsValidBarcode(false);
    }
  };

  const handleBarcodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);

    // Detect when barcode is complete (barcode readers usually add Enter at the end)
    if (value.includes('\n') || value.includes('\r')) {
      const cleanBarcode = value.replace(/[\n\r]/g, '').trim();
      if (cleanBarcode) {
        // Validate barcode format
        const userIdMatch = cleanBarcode.match(/^GMS(\d+)$/);
        if (userIdMatch) {
          setScannedBarcode(cleanBarcode);
          setIsValidBarcode(true);
          setError(null);
          toast.success('Barcode scanned successfully! Click Login to proceed.');
        } else {
          setScannedBarcode(null);
          setIsValidBarcode(false);
          setError('Invalid barcode format. Please scan a valid admin barcode.');
        }
        // Clear the input after processing
        setBarcodeInput('');
      }
    }
  };

  const handleBarcodeLogin = async () => {
    if (!scannedBarcode) return;
    await processBarcodeLogin(scannedBarcode);
  };

  const switchToBarcodeMode = () => {
    setLoginMode('barcode');
    setError(null);
    setScannedBarcode(null);
    setIsValidBarcode(false);
    setBarcodeInput('');
    // Focus the barcode input after a short delay
    setTimeout(() => {
      const barcodeInput = document.getElementById('barcode-input');
      barcodeInput?.focus();
    }, 100);
  };

  const switchToPasswordMode = () => {
    setLoginMode('password');
    setError(null);
    setBarcodeInput('');
    setScannedBarcode(null);
    setIsValidBarcode(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md shadow-xl backdrop-blur-md bg-white/20 border border-white/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src={LogoLg}
              alt="GMS Portal Logo"
              width={1000}
              height={100}
              priority
              className="w-auto h-auto"
            />
          </div>
                   
          <CardTitle className="text-2xl font-bold">
            {loginMode === 'password' ? 'Sign In' : 'Barcode Login'}
          </CardTitle>
          <CardDescription className="text-base">
            {loginMode === 'password' 
              ? 'Enter your credentials to access your account' 
              : 'Scan your admin barcode to login'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginMode === 'password' ? (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>

              {/* Barcode Login Option */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={switchToBarcodeMode}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Scan className="w-4 h-4" />
                  Admin Barcode Login
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  For admin users with barcode access cards
                </p>
              </div>
            </>
          ) : (
            /* Barcode Login Mode */
            <div className="space-y-4">
              <div className="text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Admin Barcode Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your barcode reader and scan your admin card
                </p>
              </div>

              {/* Hidden barcode input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Barcode Input</label>
                <Input
                  id="barcode-input"
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeInputChange}
                  placeholder="Scan your barcode here..."
                  className="text-center text-lg font-mono"
                  autoComplete="off"
                  disabled={isProcessingBarcode}
                />
                {scannedBarcode && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Barcode Scanned Successfully</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1 font-mono">{scannedBarcode}</p>
                  </div>
                )}
              </div>

              {/* Login Button - only show when valid barcode is scanned */}
              {isValidBarcode && scannedBarcode && (
                <Button
                  onClick={handleBarcodeLogin}
                  disabled={isProcessingBarcode}
                  className="w-full gap-2"
                >
                  {isProcessingBarcode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Login with Barcode
                    </>
                  )}
                </Button>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {isProcessingBarcode && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-primary">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Processing barcode...
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure your barcode reader is connected</li>
                  <li>• Click in the input field above</li>
                  <li>• Scan your admin barcode card</li>
                  <li>• Review the scanned barcode and click "Login with Barcode"</li>
                </ul>
              </div>

              {/* Back to password login */}
              <Button
                onClick={switchToPasswordMode}
                variant="ghost"
                className="w-full gap-2"
              >
                <Mail className="w-4 h-4" />
                Back to Password Login
              </Button>
            </div>
          )}        </CardContent>
      </Card>
    </div>
  );
}
