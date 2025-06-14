"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Github, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Shield,
  LogIn
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks/redux';
import { login, clearError } from '../../../store/slices/authSlice';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading: authLoading, error, token, user } = useAppSelector((state) => state.auth);
  console.log("user data in page", user);
  console.log("Token from selector", token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'testuser@gmail.com',
      password: 'testpass123',
    },
  });

  useEffect(() => {
    if(token) {
      router.push('/dashboard');
    } 
  }, [token, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    dispatch(clearError());
    
    try {
      // Using unwrap to throw an error if login is rejected
      const result = await dispatch(login({ email: data.email, password: data.password })).unwrap();
      console.log("Result Action in Page", JSON.stringify(result));
      console.log("Page navigate to dashboard");
      router.push('/dashboard');
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (token) {
    router.push('/dashboard');
    return null;
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 bg-zinc-900 text-zinc-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 mb-3 rounded-xl bg-indigo-950/50 backdrop-blur-sm">
            <Shield size={32} className="text-indigo-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Axiom
          </h1>
          <p className="text-zinc-400 text-sm">Your complete management solution</p>
        </div>
        
        <div className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shadow-xl">
          <div className="px-6 pt-6 pb-4 sm:px-7">
            <div className="space-y-1 mb-5">
              <h2 className="text-xl font-bold text-zinc-100">Welcome back</h2>
              <p className="text-zinc-400 text-sm">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-3 bg-red-950/60 text-red-300 px-3 py-2 rounded-lg border border-red-800/60 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-zinc-500 group-hover:text-indigo-400 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-zinc-900/80 border ${
                      errors.email ? 'border-red-600 focus:ring-red-500 focus:border-red-500' : 'border-zinc-700 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-lg shadow-sm placeholder:text-zinc-500 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 text-sm`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle size={16} className="text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-zinc-500 group-hover:text-indigo-400 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    className={`block w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border ${
                      errors.password ? 'border-red-600 focus:ring-red-500 focus:border-red-500' : 'border-zinc-700 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-lg shadow-sm placeholder:text-zinc-500 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200 text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-zinc-500 hover:text-indigo-400 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="transition-transform duration-200 hover:scale-110" />
                    ) : (
                      <Eye size={16} className="transition-transform duration-200 hover:scale-110" />
                    )}
                  </button>
                  {errors.password && (
                    <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                      <AlertCircle size={16} className="text-red-500" />
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-zinc-900 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-300 cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={authLoading || isLoggingIn}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {(authLoading || isLoggingIn) ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={15} className="mr-2" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-zinc-800 text-zinc-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                  className="w-full inline-flex justify-center items-center py-2 px-3 border border-zinc-700 rounded-lg shadow-sm bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
                >
                  <Github size={15} className="mr-2 text-zinc-300" />
                  <span>GitHub</span>
                </button>
                <button 
                  className="w-full inline-flex justify-center items-center py-2 px-3 border border-zinc-700 rounded-lg shadow-sm bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-zinc-900/70 border-t border-zinc-700 sm:px-7">
            <p className="text-center text-xs text-zinc-400">
              Dont have an account?{' '}
              <Link 
                href="/register" 
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-4 text-xs text-zinc-500">
          © 2025 Axiom. All rights reserved.
        </p>
      </div>
    </div>
  );
}
