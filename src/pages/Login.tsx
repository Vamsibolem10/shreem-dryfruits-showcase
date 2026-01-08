import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Mail, Shield, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [activeTab, setActiveTab] = useState('customer');
  const [isLogin, setIsLogin] = useState(true);
  
  // Customer login states (phone-only)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  
  // Admin/Employee login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const { login, adminLogin, employeeLogin, register, user } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset all form states when switching tabs
    setPhoneNumber('');
    setName('');
    setPassword('');
    setEmail('');
    setIsLogin(true);
  };

  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectPath(user.role);
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const getRedirectPath = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'employee':
        return '/employee';
      default:
        return '/';
    }
  };

  // Forgot / reset password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;

      if (activeTab === 'customer') {
        if (isLogin) {
          // Phone-only login
          if (!phoneNumber.trim()) {
            toast.error('Please enter your phone number');
            setIsLoading(false);
            return;
          }

          success = await login(phoneNumber);
          if (success) {
            toast.success('Login successful!');
          } else {
            toast.error('Login failed');
          }
        } else {
          // Registration
          if (!phoneNumber.trim()) {
            toast.error('Please enter your phone number');
            setIsLoading(false);
            return;
          }

          if (!name.trim()) {
            toast.error('Please enter your name');
            setIsLoading(false);
            return;
          }

          if (!password.trim()) {
            toast.error('Please enter a password');
            setIsLoading(false);
            return;
          }

          success = await register(phoneNumber, password, name);
          if (success) {
            toast.success('Registration successful!');
          } else {
            toast.error('Phone number already exists');
          }
        }
      } else if (activeTab === 'admin') {
        if (!email.trim() || !password.trim()) {
          toast.error('Please enter email and password');
          setIsLoading(false);
          return;
        }

        success = await adminLogin(email, password);
        if (success) {
          toast.success('Admin login successful!');
        } else {
          toast.error('Invalid admin credentials');
        }
      } else if (activeTab === 'employee') {
        if (!email.trim() || !password.trim()) {
          toast.error('Please enter email and password');
          setIsLoading(false);
          return;
        }

        success = await employeeLogin(email, password);
        if (success) {
          toast.success('Employee login successful!');
        } else {
          toast.error('Invalid employee credentials');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // no-op for now
  }, []);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Shreem Nuts N Fruits
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-200">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employee
                </TabsTrigger>
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="admin-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Admin Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter admin email"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter admin password"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Admin Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="employee" className="space-y-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="employee-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Employee Email
                    </Label>
                    <Input
                      id="employee-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter employee email"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="employee-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="employee-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter employee password"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Employee Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="customer" className="space-y-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Enter your full name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Choose a password"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  </Button>
                </form>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-orange-600 hover:text-orange-500"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                  {isLogin && (
                    <button
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {showForgot && (
                  <div className="mt-4 bg-gray-50 p-4 rounded">
                    <Label className="text-sm">Enter phone to generate reset token</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={forgotPhone} onChange={(e)=>setForgotPhone(e.target.value)} placeholder="Phone number" />
                      <Button onClick={async ()=>{ setIsLoading(true); try{ const res=await fetch('http://localhost:5002/api/auth/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phoneNumber:forgotPhone})}); const data=await res.json(); if(data.success){ toast.success('Reset token generated (check server logs)'); } else { toast.error(data.message||'Failed'); } }catch(e){toast.error('Error');} finally{setIsLoading(false);} }} className="bg-yellow-500">Generate</Button>
                    </div>
                    <div className="mt-3">
                      <Label className="text-sm">Reset token</Label>
                      <Input value={resetToken} onChange={(e)=>setResetToken(e.target.value)} placeholder="Enter token" />
                      <Label className="text-sm mt-2">New password</Label>
                      <Input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="New password" />
                      <div className="mt-2">
                        <Button onClick={async ()=>{ setIsLoading(true); try{ const res=await fetch('http://localhost:5002/api/auth/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phoneNumber:forgotPhone, token:resetToken, newPassword})}); const data=await res.json(); if(data.success){ toast.success('Password reset successful'); setShowForgot(false); } else { toast.error(data.message||'Failed to reset'); } }catch(e){toast.error('Error');} finally{setIsLoading(false);} }} className="bg-green-600 mt-2">Reset Password</Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
