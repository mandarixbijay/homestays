import React from 'react'

import { Mail, Phone } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

const ContactSupport = () => {
    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center min-h-screen bg-background px-2">
                <Card className="w-full max-w-2xl p-6 sm:p-10 my-10 mt-20 mx:overflow-hidden">
                    <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
                    <p className="text-muted-foreground mb-6">
                        We&apos;re here to help! Please fill out the form below or use the alternative contact methods provided.
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
                            <Input placeholder="Enter the subject of your inquiry" />
                        </div>
                        <div>
                            <label className="font-semibold">Message</label>
                            <Textarea placeholder="Enter your message" rows={4} />
                        </div>
                        <Button type="submit" className="bg-primary hover:bg-primary w-full sm:w-auto">
                            Submit
                        </Button>
                    </form>

                    <h2 className="text-xl font-bold mb-2">Alternative Contact Methods</h2>
                    <p className="mb-4">
                        If you prefer, you can also reach us via email or phone:
                    </p>
                    <div className="space-y-3">
                        <Card className="flex items-center gap-4 p-4">
                            <Mail className="w-5 h-5" />
                            <div>
                                <div className="font-semibold">Email</div>
                                <div className="text-muted-foreground text-sm">support@homestay.com</div>
                            </div>
                        </Card>
                        <Card className="flex items-center gap-4 p-4">
                            <Phone className="w-5 h-5" />
                            <div>
                                <div className="font-semibold">Phone</div>
                                <div className="text-muted-foreground text-sm">+977-9841-234567</div>
                            </div>
                        </Card>
                    </div>
                </Card>
            </div>
           <Footer />
        </>
    )
}

export default ContactSupport
