"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, LoaderPinwheel, Users, Bed, Star, Wifi, Car, Phone, Info, Home, Shield, Clock } from "lucide-react";
import SignInCard from "@/components/homestay/components/sign-in-card";
import React, { Suspense, useEffect, useState } from "react";
import BookingForm from "@/components/homestay/components/checkout/BookingForm";
import PaymentMethods from "@/components/homestay/components/checkout/PaymentMethods";
import PoliciesAndSummary from "@/components/homestay/components/checkout/PoliciesAndSummary";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, differenceInDays, isToday, isTomorrow } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function HomestayCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryRegion, setCountryRegion] = useState("Nepal +977");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    searchParams.get("paymentMethod")?.toLowerCase() || "pay-at-property"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [homestayDetails, setHomestayDetails] = useState<{
    name: string;
    address: string;
    rating: number | null;
    facilities: string[];
    images: { id: number; url: string; isMain: boolean }[];
    rooms: {
      id: number;
      name: string;
      price: number;
      currency: string;
      imageUrls: string[];
      beds: { quantity: number; bedTypeId: number }[];
      maxOccupancy: number;
      refundable: boolean;
    }[];
    checkInTime: string;
    checkOutTime: string;
    description: string | null;
    contactNumber: string;
    features: string[];
    reviews?: number;
  } | null>(null);

  type Errors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    countryRegion?: string;
    phoneNumber?: string;
    paymentMethod?: string;
  };

  const [errors, setErrors] = useState<Errors>({});

  const homestayName = searchParams.get("homestayName") || "Homestay";
  const homestayId = parseInt(searchParams.get("homestayId") || "0");
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");
  const checkIn = searchParams.get("checkIn") || format(new Date(), "yyyy-MM-dd");
  const checkOut = searchParams.get("checkOut") || format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  const guests = searchParams.get("guests") || "0A0C";
  const rooms = searchParams.get("rooms") || "0";
  const selectedRooms = searchParams.get("selectedRooms")
    ? JSON.parse(searchParams.get("selectedRooms") || "[]").map((room: any) => {
      if (!room.roomId) {
        throw new Error(`Room ID missing for selected room: ${room.roomTitle}`);
      }
      return room;
    })
    : [];

  // Enhanced date handling for same-day bookings
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const isSameDayBooking = isToday(checkInDate);
  const isNextDayCheckout = isTomorrow(checkOutDate);

  useEffect(() => {
    console.log("Initial selectedPaymentMethod:", selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.accessToken) {
        try {
          console.log("Fetching user details with token:", session.user.accessToken.substring(0, 20) + "...");

          const response = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          });

          console.log("User API response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("User API error response:", errorText);
            throw new Error(`Failed to fetch user: ${response.status} - ${errorText}`);
          }

          const responseData = await response.json();
          console.log("User API response data:", responseData);

          // Fix: Access the correct data structure
          // Backend returns: { status: 'success', message: '...', data: UserResponseDto }
          const userData = responseData.data;

          if (!userData) {
            throw new Error("No user data returned from API");
          }

          // Parse name into first and last name
          const nameParts = (userData.name || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Set the form fields
          setFirstName(firstName);
          setLastName(lastName);
          setEmail(userData.email || "");

          // Handle phone number - backend returns mobileNumber, not phone
          if (userData.mobileNumber) {
            // Extract country code and phone number
            const mobileNumber = userData.mobileNumber;

            // Try to parse country code from mobile number
            let countryCode = "+977"; // Default to Nepal
            let phoneOnly = mobileNumber;

            // Common country code patterns
            if (mobileNumber.startsWith("+977")) {
              countryCode = "+977";
              phoneOnly = mobileNumber.substring(4);
            } else if (mobileNumber.startsWith("+1")) {
              countryCode = "+1";
              phoneOnly = mobileNumber.substring(2);
            } else if (mobileNumber.startsWith("+44")) {
              countryCode = "+44";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+91")) {
              countryCode = "+91";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+61")) {
              countryCode = "+61";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+81")) {
              countryCode = "+81";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+86")) {
              countryCode = "+86";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+65")) {
              countryCode = "+65";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+971")) {
              countryCode = "+971";
              phoneOnly = mobileNumber.substring(4);
            }
            // Add more country codes as needed

            setPhoneNumber(phoneOnly);

            // Set country based on detected country code
            const countryNames: Record<
              "+977" | "+1" | "+44" | "+91" | "+61" | "+81" | "+86" | "+65" | "+971",
              string
            > = {
              "+977": "Nepal +977",
              "+1": "United States +1",
              "+44": "United Kingdom +44",
              "+91": "India +91",
              "+61": "Australia +61",
              "+81": "Japan +81",
              "+86": "China +86",
              "+65": "Singapore +65",
              "+971": "UAE +971",
            };

            setCountryRegion(
              countryNames[countryCode as keyof typeof countryNames] || "Nepal +977"
            );
          } else {
            // No mobile number, keep defaults
            setPhoneNumber("");
            setCountryRegion("Nepal +977");
          }

          console.log("User details loaded successfully:", {
            firstName,
            lastName,
            email: userData.email,
            mobileNumber: userData.mobileNumber,
          });

        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("Failed to load user details. Please enter them manually.");
        }
      }
    };

    if (status === "authenticated") {
      fetchUserDetails();
    }
  }, [session, status]);

  // Also add this helper function to detect if you need to create the API route
  const testApiRoute = async () => {
    try {
      const response = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer test`, // This will fail auth but should reach the endpoint
        },
      });
      console.log("API route test - Status:", response.status);
    } catch (error) {
      console.error("API route test failed:", error);
    }
  };

  useEffect(() => {
    const fetchHomestayDetails = async () => {
      try {
        const response = await fetch(`/api/homestays/profile/${homestayId}`, {
          method: "GET",
          headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Failed to fetch homestay: ${response.status}`);
        const data = await response.json();
        setHomestayDetails({
          name: data.name || homestayName,
          address: data.address || "Unknown Location",
          rating: data.rating || 4.5,
          facilities: data.facilities || ["WiFi", "Parking"],
          images: data.images || [{ id: 1, url: "/images/placeholder-homestay.jpg", isMain: true }],
          rooms: data.rooms || [],
          checkInTime: data.checkInTime || "02:00 PM",
          checkOutTime: data.checkOutTime || "11:00 AM",
          description: data.description || "A cozy homestay.",
          contactNumber: data.contactNumber || "N/A",
          features: data.features || ["Attached Bathroom"],
          reviews: data.reviews || 0,
        });
      } catch (error) {
        console.error("Error fetching homestay:", error);
        toast.error("Failed to load homestay details.");
        setHomestayDetails({
          name: homestayName,
          address: "Unknown Location",
          rating: 4.5,
          facilities: ["WiFi", "Parking"],
          images: [{ id: 1, url: "/images/placeholder-homestay.jpg", isMain: true }],
          rooms: [],
          checkInTime: "02:00 PM",
          checkOutTime: "11:00 AM",
          description: "A cozy homestay.",
          contactNumber: "N/A",
          features: ["Attached Bathroom"],
          reviews: 0,
        });
      }
    };

    if (homestayId) {
      fetchHomestayDetails();
    }
  }, [homestayId, homestayName]);

  // Enhanced date formatting with same-day awareness
  let displayCheckInDate = "Today";
  let displayCheckOutDate = "Tomorrow";
  let nightStay = "1-night stay";

  try {
    if (isSameDayBooking) {
      displayCheckInDate = "Today";
    } else {
      displayCheckInDate = format(checkInDate, "EEE, MMM d");
    }

    if (isNextDayCheckout && isSameDayBooking) {
      displayCheckOutDate = "Tomorrow";
    } else {
      displayCheckOutDate = format(checkOutDate, "EEE, MMM d");
    }

    const numNights = differenceInDays(checkOutDate, checkInDate);
    if (numNights > 0) {
      nightStay = `${numNights}-night stay`;
    }
  } catch (error) {
    console.error("Error formatting dates:", error);
  }

  const totalGuests = guests
    ?.split(",")
    .reduce(
      (acc, guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults: acc.adults + adults, children: acc.children + children };
      },
      { adults: 0, children: 0 }
    ) || { adults: 0, children: 0 };

  const convertToPaisa = (npr: number): number => Math.round(npr * 100);

  const handleCreateBooking = async () => {
    setIsLoading(true);
    try {
      const endpoint = session?.user ? "/bookings" : "/bookings/guest";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        accept: "application/json",
      };
      if (session?.user?.accessToken) {
        headers["Authorization"] = `Bearer ${session.user.accessToken}`;
      }

      const validPaymentMethods = ["STRIPE", "PAY_AT_PROPERTY", "KHALTI", "ESEWA", "CARD"];
      let paymentMethod: string;
      switch (selectedPaymentMethod) {
        case "credit-debit":
          paymentMethod = "STRIPE";
          break;
        case "pay-at-property":
          paymentMethod = "PAY_AT_PROPERTY";
          break;
        case "khalti":
          paymentMethod = "KHALTI";
          break;
        case "esewa":
          paymentMethod = "ESEWA";
          break;
        default:
          throw new Error(`Invalid payment method: ${selectedPaymentMethod}`);
      }

      if (!validPaymentMethods.includes(paymentMethod)) {
        throw new Error(`Payment method ${paymentMethod} is not supported`);
      }

      const body: any = {
        homestayId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        rooms: selectedRooms.map((room: any) => {
          if (!room.roomId) {
            throw new Error(`Room ID missing for selected room: ${room.roomTitle}`);
          }
          return {
            roomId: room.roomId,
            adults: room.adults,
            children: room.children || 0,
          };
        }),
        paymentMethod,
      };

      if (!session?.user) {
        // Extract country code from countryRegion selection
        const countryCode = countryRegion.match(/\+\d+/)?.[0] || "+977";

        body.guestName = `${firstName} ${lastName}`.trim();
        body.guestEmail = email;
        // Format phone number with country code for backend
        // Remove any spaces/dashes and add country code
        const cleanPhoneNumber = phoneNumber.replace(/[\s-]/g, '');
        body.guestPhone = `${countryCode}${cleanPhoneNumber}`;

        console.log(`Formatted phone number: ${body.guestPhone} (${countryCode} + ${cleanPhoneNumber})`);
      }

      const url = `/api${endpoint}`;
      console.log("Sending booking request to:", url);
      console.log("Request body:", JSON.stringify(body, null, 2));

      // Log same-day booking attempt
      if (isSameDayBooking) {
        console.log("Creating same-day booking for:", checkIn);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseData = await response.json();
      console.log("Booking API response:", JSON.stringify(responseData, null, 2));
      if (!response.ok) {
        throw new Error(`Failed to create booking: ${responseData.message || responseData.error || "Unknown error"}`);
      }

      if (!responseData.bookingId) {
        throw new Error("Booking ID not returned from API");
      }

      console.log("Booking created successfully:", responseData);

      // Enhanced success message for same-day bookings
      const successMessage = isSameDayBooking
        ? paymentMethod === "PAY_AT_PROPERTY"
          ? "Same-day booking confirmed successfully! Please contact the property for check-in details."
          : "Same-day booking created! Please complete payment within 10 minutes to secure your room."
        : paymentMethod === "PAY_AT_PROPERTY"
          ? "Booking confirmed successfully!"
          : "Temporary booking created! Please complete payment within 10 minutes.";

      toast.success(successMessage);
      return responseData;
    } catch (error: any) {
      console.error("Error creating booking:", error.message);

      // Enhanced error message for same-day bookings
      const errorMessage = isSameDayBooking && error.message.includes("not available")
        ? "This room is no longer available for today. Please try selecting different dates or contact the property directly."
        : error.message || "Failed to create booking.";

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const handleStripeCheckout = async (bookingId: string) => {
    if (!bookingId) throw new Error("Missing bookingId");

    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize.");

      const amountInPaisa = convertToPaisa(totalPrice);
      const NPR_TO_USD_RATE = 137;
      const amountInUSDCents = Math.round((amountInPaisa / 100) / NPR_TO_USD_RATE * 100);
      if (amountInUSDCents < 50) throw new Error("Amount in USD must be at least 50 cents");

      const payload = {
        amount: amountInUSDCents,
        currency: "usd",
        description: `Booking for ${homestayName} (Booking ID: ${bookingId})${isSameDayBooking ? " - SAME DAY" : ""}`,
        metadata: {
          homestayName,
          checkIn,
          checkOut,
          guests,
          rooms,
          selectedRooms: JSON.stringify(selectedRooms),
          bookingId,
          totalPriceNPR: totalPrice.toString(),
          payment_timestamp: new Date().toISOString(),
          is_same_day: isSameDayBooking.toString(),
        },
      };

      console.log("Stripe checkout payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Stripe API response:", JSON.stringify(responseData, null, 2));

      if (!response.ok) throw new Error(responseData.error || "Failed to initiate Stripe payment");

      const { sessionId } = responseData;
      if (!sessionId) throw new Error("Missing sessionId from Stripe response");

      console.log("Stripe sessionId:", sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) throw new Error(error.message || "Failed to redirect to Stripe checkout");
    } catch (error: any) {
      console.error("Error initiating Stripe:", error.message);
      toast.error(error.message || "Failed to initiate Stripe payment.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleKhaltiCheckout = async (bookingId: string) => {
    if (!bookingId) throw new Error("Missing bookingId");

    setIsLoading(true);
    try {
      const amountInPaisa = convertToPaisa(totalPrice);
      if (!Number.isInteger(amountInPaisa) || amountInPaisa < 1000)
        throw new Error("Amount must be ≥ 1000 paisa");

      // Store non-essential data in sessionStorage
      sessionStorage.setItem(
        `booking_${bookingId}`,
        JSON.stringify({
          homestayName,
          totalPrice,
          checkIn,
          checkOut,
          guests: guests || "0A0C",
          rooms: rooms.toString(),
          selectedRooms: selectedRooms || [],
          paymentMethod: "KHALTI",
          is_same_day: isSameDayBooking,
        })
      );

      const baseUrl = "https://www.nepalhomestays.com";
      const queryParams = new URLSearchParams({
        bookingId,
        paymentMethod: "KHALTI",
      });

      const return_url = `${baseUrl}/payment-callback?${queryParams.toString()}`;
      if (return_url.length > 255) {
        throw new Error(`Return URL too long: ${return_url.length} characters`);
      }

      const payload = {
        return_url,
        website_url: baseUrl,
        amount: amountInPaisa,
        purchase_order_id: bookingId,
        purchase_order_name: `Booking for ${homestayName}${isSameDayBooking ? " (Same Day)" : ""}`,
      };

      console.log("Khalti payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("/api/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Khalti response:", JSON.stringify(responseData, null, 2));

      if (!response.ok) throw new Error(responseData.error || "Failed to initiate Khalti payment");

      const { pidx, payment_url } = responseData;
      if (!pidx || !payment_url) throw new Error("Missing pidx or payment_url");

      console.log("Redirecting to:", payment_url);
      window.location.href = payment_url;
    } catch (error: any) {
      console.error("Khalti checkout error:", error.message);
      toast.error(
        error.message || "Failed to initiate Khalti payment. Please try 'Pay at Property' or contact support."
      );
      setSelectedPaymentMethod("pay-at-property"); // Fallback to PAY_AT_PROPERTY
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEsewaCheckout = async (bookingId: string) => {
    if (!bookingId) throw new Error("Missing bookingId");

    setIsLoading(true);
    try {
      throw new Error("eSewa payment method is not yet implemented");
    } catch (error: any) {
      console.error("eSewa checkout error:", error.message);
      toast.error(error.message || "Failed to initiate eSewa payment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with paymentMethod:", selectedPaymentMethod);

    const newErrors: Errors = {};
    if (!session?.user) {
      if (!firstName) newErrors.firstName = "First name is required.";
      if (!lastName) newErrors.lastName = "Last name is required.";
      if (!email) newErrors.email = "Email address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address.";
      if (!countryRegion) newErrors.countryRegion = "Country/region is required.";

      // UPDATED PHONE VALIDATION - No longer requires country code
      if (!phoneNumber) {
        newErrors.phoneNumber = "Phone number is required.";
      } else {
        // Remove spaces and dashes for validation
        const cleanNumber = phoneNumber.replace(/[\s-]/g, '');

        // Get selected country code
        const selectedCountry = countryRegion.match(/\+\d+/)?.[0];

        // Validate based on country-specific rules
        let isValidPhone = false;
        let countryName = countryRegion.split(' ')[0];

        switch (selectedCountry) {
          case "+977": // Nepal
            isValidPhone = /^9[678]\d{8}$/.test(cleanNumber); // Mobile: 98xxxxxxxx
            if (!isValidPhone) {
              newErrors.phoneNumber = "Nepal mobile numbers should start with 98, 97, or 96 (10 digits total)";
            }
            break;
          case "+1": // US/Canada
            isValidPhone = /^\d{10}$/.test(cleanNumber); // 10 digits
            if (!isValidPhone) {
              newErrors.phoneNumber = "US/Canada phone numbers should be 10 digits";
            }
            break;
          case "+44": // UK
            isValidPhone = /^[1-9]\d{6,9}$/.test(cleanNumber); // 7-10 digits
            if (!isValidPhone) {
              newErrors.phoneNumber = "UK phone numbers should be 7-10 digits";
            }
            break;
          case "+91": // India
            isValidPhone = /^[6-9]\d{9}$/.test(cleanNumber); // 10 digits starting with 6-9
            if (!isValidPhone) {
              newErrors.phoneNumber = "India mobile numbers should start with 6-9 (10 digits total)";
            }
            break;
          case "+61": // Australia
            isValidPhone = /^[24578]\d{8}$/.test(cleanNumber); // 9 digits
            if (!isValidPhone) {
              newErrors.phoneNumber = "Australia mobile numbers should be 9 digits starting with 2,4,5,7,8";
            }
            break;
          case "+81": // Japan
            isValidPhone = /^[1-9]\d{9,10}$/.test(cleanNumber); // 10-11 digits
            if (!isValidPhone) {
              newErrors.phoneNumber = "Japan phone numbers should be 10-11 digits";
            }
            break;
          case "+86": // China
            isValidPhone = /^1[3-9]\d{9}$/.test(cleanNumber); // 11 digits starting with 1
            if (!isValidPhone) {
              newErrors.phoneNumber = "China mobile numbers should start with 1 (11 digits total)";
            }
            break;
          case "+65": // Singapore
            isValidPhone = /^[3689]\d{7}$/.test(cleanNumber); // 8 digits
            if (!isValidPhone) {
              newErrors.phoneNumber = "Singapore numbers should be 8 digits starting with 3,6,8,9";
            }
            break;
          case "+60": // Malaysia
            isValidPhone = /^1[0-9]\d{7,8}$/.test(cleanNumber); // 9-10 digits starting with 1
            if (!isValidPhone) {
              newErrors.phoneNumber = "Malaysia mobile numbers should start with 1 (9-10 digits total)";
            }
            break;
          case "+66": // Thailand
            isValidPhone = /^[689]\d{8}$/.test(cleanNumber); // 9 digits starting with 6,8,9
            if (!isValidPhone) {
              newErrors.phoneNumber = "Thailand mobile numbers should start with 6,8,9 (9 digits total)";
            }
            break;
          case "+971": // UAE
            isValidPhone = /^5[0-9]\d{7}$/.test(cleanNumber); // 9 digits starting with 5
            if (!isValidPhone) {
              newErrors.phoneNumber = "UAE mobile numbers should start with 5 (9 digits total)";
            }
            break;
          default:
            // Generic validation for other countries (6-15 digits)
            isValidPhone = /^\d{6,15}$/.test(cleanNumber);
            if (!isValidPhone) {
              newErrors.phoneNumber = `Phone number should be 6-15 digits for ${countryName}`;
            }
        }
      }
    }
    if (!selectedPaymentMethod) newErrors.paymentMethod = "Payment method is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((error) => toast.error(error));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (selectedRooms.length === 0) {
      toast.error("No rooms selected.");
      return;
    }

    try {
      const bookingData = await handleCreateBooking();

      if (selectedPaymentMethod === "pay-at-property") {
        console.log("Redirecting to payment-success for PAY_AT_PROPERTY, bookingId:", bookingData.bookingId);
        const queryParams = new URLSearchParams({
          bookingId: bookingData.bookingId,
          homestayName: encodeURIComponent(bookingData.homestayName),
          totalPrice: bookingData.totalPrice.toString(),
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          guests: guests || "0A0C",
          rooms: bookingData.rooms?.length.toString() || "0",
          selectedRooms: JSON.stringify(bookingData.rooms || []),
          transactionId: bookingData.transactionId || "N/A",
          status: bookingData.status,
          paymentMethod: bookingData.paymentMethod,
          is_same_day: isSameDayBooking.toString(),
        });
        router.push(`/payment-success?${queryParams.toString()}`);
      } else if (selectedPaymentMethod === "credit-debit") {
        const expiresAtDate = new Date(bookingData.expiresAt);
        const now = new Date();
        const timeLeft = (expiresAtDate.getTime() - now.getTime()) / 1000 / 60;
        if (timeLeft <= 0) {
          toast.error("Temporary booking expired.");
          return;
        }
        await handleStripeCheckout(bookingData.bookingId);
      } else if (selectedPaymentMethod === "khalti") {
        const expiresAtDate = new Date(bookingData.expiresAt);
        const now = new Date();
        const timeLeft = (expiresAtDate.getTime() - now.getTime()) / 1000 / 60;
        if (timeLeft <= 0) {
          toast.error("Temporary booking expired.");
          return;
        }
        await handleKhaltiCheckout(bookingData.bookingId);
      } else if (selectedPaymentMethod === "esewa") {
        const expiresAtDate = new Date(bookingData.expiresAt);
        const now = new Date();
        const timeLeft = (expiresAtDate.getTime() - now.getTime()) / 1000 / 60;
        if (timeLeft <= 0) {
          toast.error("Temporary booking expired.");
          return;
        }
        await handleEsewaCheckout(bookingData.bookingId);
      } else {
        throw new Error(`Unsupported payment method: ${selectedPaymentMethod}`);
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message);
      toast.error(error.message || "Failed to process booking.");
    }
  };
  const getImageUrl = (url: string, fallback: string = "/images/placeholder-homestay.jpg") => {
    if (!url || url === "/images/placeholder-homestay.jpg") return fallback;
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12 font-manrope">
      <Toaster position="top-right" richColors />
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Secure Reservation</h1>
          <p className="text-sm text-gray-600">Complete your booking at {homestayDetails?.name || homestayName}</p>
          {isSameDayBooking && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Same-day booking available</span>
            </div>
          )}
        </header>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6 flex items-start gap-3">
          <Shield className="text-primary h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-600">
              {isSameDayBooking
                ? "Fully refundable before check-in today"
                : "Fully refundable before 24 Hours prior to check-in"
              }
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {isSameDayBooking
                ? "For same-day bookings, contact the property directly for changes or cancellations."
                : "Change or cancel your stay for a full refund if plans change."
              }
            </p>
          </div>
        </div>

        <div className="lg:hidden space-y-6 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Booking Summary
              {isSameDayBooking && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full ml-2">
                  Same Day
                </span>
              )}
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span><strong>Check-in:</strong> {displayCheckInDate}</span>
                {isSameDayBooking && <span className="text-xs text-amber-600">(Today)</span>}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span><strong>Check-out:</strong> {displayCheckOutDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong>Guests:</strong> {totalGuests.adults} Adult{totalGuests.adults !== 1 ? "s" : ""}, {totalGuests.children} Child{totalGuests.children !== 1 ? "ren" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary" />
                <span><strong>Rooms:</strong> {rooms}</span>
              </div>
              {selectedRooms.map((room: any, index: number) => (
                <div key={index} className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-800">Room {index + 1}: {room.roomTitle}</p>
                  <p className="text-xs text-gray-600">
                    {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                  </p>
                  <p className="text-xs text-gray-600">Nightly Price: NPR {room.nightlyPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">Total: NPR {room.totalPrice.toFixed(2)} for {nightStay}</p>
                </div>
              ))}
              <div className="mt-4 bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                <p className="text-base font-semibold text-primary">Grand Total: NPR {totalPrice.toFixed(2)}</p>
                <p className="text-xs text-primary">{nightStay}</p>
              </div>
            </div>
          </div>

          {homestayDetails && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                {homestayDetails.name}
              </h2>
              <Image
                src={getImageUrl(homestayDetails.images.find((img) => img.isMain)?.url || "/images/placeholder-homestay.jpg")}
                alt={homestayDetails.name}
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded-lg mb-4"
                onError={(e) => (e.currentTarget.src = "/images/placeholder-homestay.jpg")}
              />
              <p className="text-sm text-gray-600 mb-2">{homestayDetails.address}</p>
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">
                  {homestayDetails.rating ? homestayDetails.rating.toFixed(1) : "No rating"} ({homestayDetails.reviews || 0} reviews)
                </span>
              </div>
              {homestayDetails.description && <p className="text-sm text-gray-600 mb-2">{homestayDetails.description}</p>}
              {homestayDetails.contactNumber !== "N/A" && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{homestayDetails.contactNumber}</span>
                  {isSameDayBooking && (
                    <span className="text-xs text-amber-600 font-medium">(Call for same-day check-in)</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {homestayDetails.features.map((feature, index) => (
                  <span key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {feature === "WiFi" ? <Wifi className="h-4 w-4 mr-1 text-primary" /> : feature === "Parking" ? <Car className="h-4 w-4 mr-1 text-primary" /> : null}
                    {feature}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Check-in Time:</strong> {homestayDetails.checkInTime}</p>
                <p><strong>Check-out Time:</strong> {homestayDetails.checkOutTime}</p>
                {isSameDayBooking && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    Please call the property for same-day check-in arrangements
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedRooms.length > 0 && homestayDetails?.rooms && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Selected Rooms
              </h2>
              <div className="space-y-4">
                {selectedRooms.map((room: any, index: number) => {
                  const roomDetails = homestayDetails.rooms.find((r) => r.id === room.roomId);
                  const imageUrl = getImageUrl(roomDetails?.imageUrls[0] || "/images/placeholder-homestay.jpg");
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <Image
                        src={imageUrl}
                        alt={room.roomTitle}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                        onError={(e) => (e.currentTarget.src = "/images/placeholder-homestay.jpg")}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{room.roomTitle}</p>
                        <p className="text-xs text-gray-600">
                          {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                        </p>
                        <p className="text-xs text-gray-600">Max Occupancy: {roomDetails?.maxOccupancy || "N/A"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {!session?.user && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 w-full">
                <SignInCard />
              </div>
            )}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 w-full">
              <BookingForm
                bedType={selectedRooms[0]?.bedType || "1 Double Bed"}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                countryRegion={countryRegion}
                setCountryRegion={setCountryRegion}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                errors={errors}
                selectedRooms={selectedRooms}
                isAuthenticated={!!session?.user}
              />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 w-full">
              <PaymentMethods
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={(value) => {
                  console.log("PaymentMethods setSelectedPaymentMethod:", value);
                  setSelectedPaymentMethod(value);
                }}
              />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 w-full">
              <PoliciesAndSummary handleSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          <div className="hidden lg:block lg:w-96 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Booking Summary
                {isSameDayBooking && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full ml-2">
                    Same Day
                  </span>
                )}
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span><strong>Check-in:</strong> {displayCheckInDate}</span>
                  {isSameDayBooking && <span className="text-xs text-amber-600">(Today)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span><strong>Check-out:</strong> {displayCheckOutDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Guests:</strong> {totalGuests.adults} Adult{totalGuests.adults !== 1 ? "s" : ""}, {totalGuests.children} Child{totalGuests.children !== 1 ? "ren" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-primary" />
                  <span><strong>Rooms:</strong> {rooms}</span>
                </div>
                {selectedRooms.map((room: any, index: number) => (
                  <div key={index} className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm font-medium text-gray-800">Room {index + 1}: {room.roomTitle}</p>
                    <p className="text-xs text-gray-600">
                      {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                    </p>
                    <p className="text-xs text-gray-600">Nightly Price: NPR {room.nightlyPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">Total: NPR {room.totalPrice.toFixed(2)} for {nightStay}</p>
                  </div>
                ))}
                <div className="mt-4 bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                  <p className="text-base font-semibold text-primary">Grand Total: NPR {totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-primary">{nightStay}</p>
                </div>
              </div>
            </div>

            {homestayDetails && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  {homestayDetails.name}
                </h2>
                <Image
                  src={getImageUrl(homestayDetails.images.find((img) => img.isMain)?.url || "/images/placeholder-homestay.jpg")}
                  alt={homestayDetails.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => (e.currentTarget.src = "/images/placeholder-homestay.jpg")}
                />
                <p className="text-sm text-gray-600 mb-2">{homestayDetails.address}</p>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {homestayDetails.rating ? homestayDetails.rating.toFixed(1) : "No rating"} ({homestayDetails.reviews || 0} reviews)
                  </span>
                </div>
                {homestayDetails.description && <p className="text-sm text-gray-600 mb-2">{homestayDetails.description}</p>}
                {homestayDetails.contactNumber !== "N/A" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{homestayDetails.contactNumber}</span>
                    {isSameDayBooking && (
                      <span className="text-xs text-amber-600 font-medium">(Call for same-day check-in)</span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {homestayDetails.features.map((feature, index) => (
                    <span key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      {feature === "WiFi" ? <Wifi className="h-4 w-4 mr-1 text-primary" /> : feature === "Parking" ? <Car className="h-4 w-4 mr-1 text-primary" /> : null}
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Check-in Time:</strong> {homestayDetails.checkInTime}</p>
                  <p><strong>Check-out Time:</strong> {homestayDetails.checkOutTime}</p>
                  {isSameDayBooking && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      Please call the property for same-day check-in arrangements
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedRooms.length > 0 && homestayDetails?.rooms && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  Selected Rooms
                </h2>
                <div className="space-y-4">
                  {selectedRooms.map((room: any, index: number) => {
                    const roomDetails = homestayDetails.rooms.find((r) => r.id === room.roomId);
                    const imageUrl = getImageUrl(roomDetails?.imageUrls[0] || "/images/placeholder-homestay.jpg");
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <Image
                          src={imageUrl}
                          alt={room.roomTitle}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                          onError={(e) => (e.currentTarget.src = "/images/placeholder-homestay.jpg")}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{room.roomTitle}</p>
                          <p className="text-xs text-gray-600">
                            {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                          </p>
                          <p className="text-xs text-gray-600">Max Occupancy: {roomDetails?.maxOccupancy || "N/A"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isLoading}>
          <DialogContent className="flex justify-center items-center bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <VisuallyHidden><DialogTitle>Processing</DialogTitle></VisuallyHidden>
            <LoaderPinwheel className="animate-spin h-6 w-6 text-primary" />
            <p className="ml-3 text-sm text-gray-800">Processing...</p>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
        </div>
      }
    >
      <HomestayCheckoutContent />
    </Suspense>
  );
}