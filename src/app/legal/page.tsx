import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import React from "react";

const lastUpdated = "October 26, 2024";

const LegalPage = () => {
    return (
        <><div className="max-w-3xl mx-auto py-10 px-4">
            <Navbar />
            <h1 className="text-3xl font-bold mb-2 mt-20">Privacy Policy & Terms of Service</h1>
            <div className="text-muted-foreground mb-8 text-sm">
                Last updated: {lastUpdated}
            </div>

            <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
            <ul className="mb-8 space-y-2">
                <li className="flex justify-between">
                    <a href="#privacy-policy" className="hover:underline">Privacy Policy</a>
                    <a href="#privacy-policy" className="text-muted-foreground text-sm hover:underline">Go to section</a>
                </li>
                <li className="flex justify-between">
                    <a href="#terms-of-service" className="hover:underline">Terms of Service</a>
                    <a href="#terms-of-service" className="text-muted-foreground text-sm hover:underline">Go to section</a>
                </li>
            </ul>

            <h2 id="privacy-policy" className="text-2xl font-bold mb-2 mt-10">Privacy Policy</h2>
            <p className="mb-10">
                At Homestay, your privacy is our priority. We collect personal information such as your name, contact details, and payment information when you create an account, book a stay, or communicate with us. We also gather technical data like your IP address and device information to enhance your experience and improve our services.<br /><br />
                Your information is used to process bookings, facilitate payments, provide customer support, and send you important updates or promotional offers. We may share your details with hosts, payment processors, and service providers who help us operate Homestay, but only as necessary and in accordance with the law. We take reasonable steps to protect your data, but please note that no online system is completely secure.<br /><br />
                You have the right to access, update, or delete your personal information at any time. We may update this Privacy Policy periodically and will notify you of significant changes. For questions or concerns, contact us at privacy@Homestay.com.
            </p>

            <h2 id="terms-of-service" className="text-2xl font-bold mb-2 mt-10">Terms of Service</h2>
            <p>
                Welcome to Homestay! By using our platform, you agree to these Terms of Service. Homestay connects travelers with homestay hosts in Nepal. You must be at least 18 years old to use our services and are responsible for keeping your account information accurate and secure.<br /><br />
                You agree to use Homestay for lawful purposes only. Any fraudulent, harmful, or discriminatory activity is strictly prohibited. When you book a stay, you agree to pay all applicable fees and taxes, and to follow the host&apos;s rules and cancellation policy. Payments are processed securely through our trusted partners.<br /><br />
                Homestay is not responsible for the conduct of hosts or guests, or for the quality of accommodations. We may update these terms from time to time and will notify you of major changes. If you have questions or need support, please contact us at support@Homestay.com.
            </p>
        </div>
           
           <Footer />
           
           </>
    );
};

export default LegalPage;
