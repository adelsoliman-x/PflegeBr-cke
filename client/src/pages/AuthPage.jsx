import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, LogIn, Globe } from 'lucide-react';
// import { Link } from 'react-router-dom';

const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  if (user && user.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && user.role === 'viewer') {
    return <Navigate to="/jobs" replace />;
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { user: signedInUser, error } = await signIn(formData.email, formData.password);
console.log('🔍 signedInUser:', signedInUser);
console.log('🔐 role from signedInUser:', signedInUser?.role);

if (error) {
  toast({
    title: 'Error',
    description: error,
    variant: 'destructive'
  });
} else {
  toast({
    title: 'Success',
    description: 'Signed in successfully!'
  });
 const role = signedInUser?.role; 
  setTimeout(() => {
    if (signedInUser?.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/jobs');
    }
  }, 500);
}

    
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: t('passwordMismatch'),
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.name);
    
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
      setLoading(false);
    } else {
      toast({
        title: 'Success',
        description: t('accountCreatedRedirect')
      });
      setTimeout(() => navigate('/subscription'), 1000);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('jobBoard')} - Authentication</title>
        <meta name="description" content="Sign in or create an account to access the job board platform" />
      </Helmet>
      
      <div className="h-full flex items-center justify-center p-4 ">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center space-x-2 text-white"
          >
            <Globe className="h-4 w-4" />
            <span>{language.toUpperCase()}</span>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">{t('jobBoard')}</CardTitle>
              <CardDescription className="text-gray-300">
                Access the professional job posting platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>{t('signIn')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>{t('signUp')}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">{t('email')}</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">{t('password')}</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="password"
                        required
                      />
                      {/* <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600 hover:underline ml-auto block mb-4"
                      >
                        {t('forgotPassword')}
                      </Link> */}

                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : t('signIn')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('name')}</Label>
                      <Input id="signup-name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('email')}</Label>
                      <Input id="signup-email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('password')}</Label>
                      <Input id="signup-password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">{t('confirmPassword')}</Label>
                      <Input id="signup-confirm-password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : t('signUp')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;


