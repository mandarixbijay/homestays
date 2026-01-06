'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

const RECAPTCHA_SITE_KEY = '6Ld9v0EsAAAAABWifrlE2Qd8G5IpZi6glJ6B8p2b';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void }) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const handleCaptchaChange = useCallback((token: string) => {
    console.log('[reCAPTCHA] Token received:', token?.substring(0, 20) + '...');
    setCaptchaToken(token);
  }, []);

  const handleCaptchaExpired = useCallback(() => {
    console.log('[reCAPTCHA] Token expired');
    setCaptchaToken(null);
  }, []);

  // Load reCAPTCHA script
  useEffect(() => {
    // Check if script is already loaded
    if (window.grecaptcha) {
      console.log('[reCAPTCHA] grecaptcha already exists');
      setRecaptchaReady(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      console.log('[reCAPTCHA] Script tag already exists, waiting for load');
      const checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          console.log('[reCAPTCHA] grecaptcha now available');
          setRecaptchaReady(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    console.log('[reCAPTCHA] Loading script...');
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('[reCAPTCHA] Script loaded successfully');
      // Wait for grecaptcha to be ready
      const checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          console.log('[reCAPTCHA] grecaptcha ready');
          setRecaptchaReady(true);
          clearInterval(checkInterval);
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error('[reCAPTCHA] Script failed to load:', error);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    console.log('[reCAPTCHA] Render effect - ready:', recaptchaReady, 'widgetId:', recaptchaWidgetId);
    if (recaptchaReady && recaptchaWidgetId === null) {
      const container = document.getElementById('recaptcha-container');
      console.log('[reCAPTCHA] Container found:', !!container, 'grecaptcha:', !!window.grecaptcha);
      if (container && window.grecaptcha) {
        try {
          console.log('[reCAPTCHA] Rendering widget with sitekey:', RECAPTCHA_SITE_KEY);
          const widgetId = window.grecaptcha.render('recaptcha-container', {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: handleCaptchaChange,
            'expired-callback': handleCaptchaExpired,
          });
          console.log('[reCAPTCHA] Widget rendered with id:', widgetId);
          setRecaptchaWidgetId(widgetId);
        } catch (error) {
          console.error('[reCAPTCHA] Error rendering:', error);
        }
      }
    }
  }, [recaptchaReady, recaptchaWidgetId, handleCaptchaChange, handleCaptchaExpired]);

  const resetCaptcha = () => {
    if (recaptchaWidgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(recaptchaWidgetId);
    }
    setCaptchaToken(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      subject: '',
      message: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      const errorMessages = Object.values(errors)
        .filter((error) => error)
        .join('; ');
      toast.error(errorMessages || 'Please correct the form errors');
      return;
    }

    // Only require CAPTCHA if the site key is configured
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      toast.error('Please complete the CAPTCHA verification');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email/contact-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(captchaToken ? { ...formData, captchaToken } : formData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({ name: '', email: '', subject: '', message: '' });
        resetCaptcha();
      } else {
        if (response.status === 400) {
          const errorDetails = result.errors
            ? result.errors
                .map((err: any) => {
                  const constraint = Object.values(err.constraints || {})[0] || err.message;
                  return `${err.property}: ${constraint}`;
                })
                .join('; ')
            : result.message;
          toast.error(`Validation error: ${errorDetails}`);
        } else if (response.status === 429) {
          toast.error(result.message || 'Too many requests. Please try again later.');
        } else {
          toast.error(result.message || 'An unexpected error occurred. Please try again.');
        }
        // Reset captcha on error
        resetCaptcha();
        setCaptchaToken(null);
      }
    } catch (error) {
      toast.error('Failed to connect to the server. Please try again later.');
      resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({ name: '', email: '', subject: '', message: '' });
    setCaptchaToken(null);
    resetCaptcha();
    toast.info('Form has been reset');
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-background px-4 pt-20">
        <Card className="w-full max-w-2xl p-6 sm:p-10 my-10 rounded-lg shadow-md overflow-visible">
          <h1 className="text-3xl font-bold mb-2 text-center">Contact Support</h1>
          <p className="text-muted-foreground mb-6 text-center">
            We&apos;re here to help! Please fill out the form below or use the alternative contact methods provided.
          </p>

          <form className="space-y-4 mb-10" onSubmit={handleSubmit}>
            <div>
              <label className="block font-semibold text-muted-foreground">Your Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground">Your Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full"
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground">Subject</label>
              <Input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter the subject of your inquiry"
                className="w-full"
                disabled={isLoading}
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground">Message</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                rows={4}
                className="w-full"
                disabled={isLoading}
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
            <div className="flex justify-center">
              <div id="recaptcha-container" className="min-h-[78px]">
                {!recaptchaReady && (
                  <p className="text-sm text-muted-foreground">Loading CAPTCHA...</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto rounded-md"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto rounded-md"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </form>

          <h2 className="text-xl font-bold mb-2 text-center text-muted-foreground">Alternative Contact Methods</h2>
          <p className="mb-4 text-muted-foreground text-center">
            If you prefer, you can also reach us via email or phone:
          </p>
          <div className="space-y-3">
            <a href="mailto:contact@nepalhomestays.com" className="block" style={{ textDecoration: 'none' }}>
              <Card className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer rounded-md">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-semibold text-muted-foreground">Email</div>
                  <div className="text-muted-foreground text-sm">contact@nepalhomestays.com</div>
                </div>
              </Card>
            </a>
            <a href="tel:+9779810261640" className="block" style={{ textDecoration: 'none' }}>
              <Card className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer rounded-md">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-semibold text-muted-foreground">Phone</div>
                  <div className="text-muted-foreground text-sm">+977 981-0261640</div>
                </div>
              </Card>
            </a>
          </div>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ContactSupport;