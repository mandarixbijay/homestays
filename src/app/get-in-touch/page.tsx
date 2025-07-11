import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Phone, Share2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

const contactMethods = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Email',
    desc: 'For general inquiries, support, or feedback, please email us at support@trekstay.com. We aim to respond within 24 hours.',
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: 'Phone',
    desc: 'Call us at +977-9841-123-456 during our business hours, Monday to Friday, 9 AM to 5 PM (Nepal Time).',
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    title: 'Social Media',
    desc: 'Stay connected with us on social media for updates, travel inspiration, and community engagement.',
    arrow: <ArrowRight className="w-5 h-5 ml-auto" />,
  },
];

const GetInTouch = () => {
  return (
    <><Navbar /><div className="max-w-6xl mx-auto py-10 px-4 mt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Form */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Get in Touch</h1>
          <p className="text-muted-foreground mb-8">
            We&apos;re here to help! Reach out to us with any questions, feedback, or requests you may have. We aim to respond within 24 hours.
          </p>
          <form className="space-y-4 mb-10">
            <div>
              <label className="font-semibold">Your Name</label>
              <Input placeholder="Enter your name" />
            </div>
            <div>
              <label className="font-semibold">Your Email</label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div>
              <label className="font-semibold">Subject</label>
              <Input placeholder="Enter the subject" />
            </div>
            <div>
              <label className="font-semibold">Your Message</label>
              <Textarea placeholder="Enter your message" rows={4} />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary w-fit">
              Submit
            </Button>
          </form>

          <h2 className="text-xl font-bold mb-4 mt-8">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, i) => (
              <Card
                key={i}
                className="flex items-start gap-4 p-4 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                <div className="mt-1">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold">{method.title}</div>
                  <div className="text-muted-foreground text-sm">{method.desc}</div>
                </div>
                {method.arrow && method.arrow}
              </Card>
            ))}
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="overflow-hidden h-full rounded-xl">
            <img
              src="/images/carousel/carousel-02.jpg"
              alt="Contact Illustration"
              className="w-full h-full object-cover min-h-[400px]" />
          </Card>
        </div>
      </div>
    </div>
      <footer className="w-full text-center text-gray-400 text-sm py-8 ">
        ©2025 Nepal Homestays
      </footer>
    </>
  );
};

export default GetInTouch;
