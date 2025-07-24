"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, LoaderPinwheel, Users, Bed, Star, Wifi, Car, Phone, Info, Home, Shield } from "lucide-react";
import SignInCard from "@/components/homestay/components/sign-in-card";
import React, { Suspense, useEffect, useState } from "react";
import BookingForm from "@/components/homestay/components/checkout/BookingForm";
import PaymentMethods from "@/components/homestay/components/checkout/PaymentMethods";
import PoliciesAndSummary from "@/components/homestay/components/checkout/PoliciesAndSummary";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, differenceInDays } from "date-fns";
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
    searchParams.get("paymentMethod")?.toLowerCase() || "credit-debit"
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
  };

  const [errors, setErrors] = useState<Errors>({});

  const homestayName = searchParams.get("homestayName") || "Homestay";
  const homestayId = parseInt(searchParams.get("homestayId") || "0");
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");
  const checkIn = searchParams.get("checkIn") || format(new Date(), "yyyy-MM-dd");
  const checkOut = searchParams.get("checkOut") || format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  const guests = searchParams.get("guests") || "";
  const rooms = searchParams.get("rooms") || "";
  const selectedRooms = searchParams.get("selectedRooms")
    ? JSON.parse(searchParams.get("selectedRooms") || "[]").map((room: any) => {
        if (!room.roomId) {
          throw new Error(`Room ID missing for selected room: ${room.roomTitle}`);
        }
        return room;
      })
    : [];

  useEffect(() => {
    console.log("Initial selectedPaymentMethod:", selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.accessToken) {
        try {
          const response = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch user details: ${response.status}`);
          }

          const { data } = await response.json();
          const [firstName, ...lastNameParts] = data.name.split(" ");
          setFirstName(firstName || "");
          setLastName(lastNameParts.join(" ") || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phoneNumber || "");
          setCountryRegion(data.countryRegion || "Nepal +977");
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to load user details. Please enter manually.");
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhoneNumber("");
          setCountryRegion("Nepal +977");
        }
      } else {
        console.log("No authenticated user, using guest form");
      }
    };

    if (status === "authenticated") {
      fetchUserDetails();
    }
  }, [session, status]);

  useEffect(() => {
    const fetchHomestayDetails = async () => {
      try {
        const response = await fetch(`/api/homestays/profile/${homestayId}`, {
          method: "GET",
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch homestay details: ${response.status}`);
        }
        const data = await response.json();
        setHomestayDetails({
          name: data.name || homestayName,
          address: data.address || "Unknown Location",
          rating: data.rating || 4.5,
          facilities: data.facilities || ["WiFi", "Parking"],
          images: data.images || [{ id: 1, url: "/images/homimages/placeholder-homestay.jpg", isMain: true }],
          rooms: data.rooms || [],
          checkInTime: data.checkInTime || "02:00 PM",
          checkOutTime: data.checkOutTime || "11:00 AM",
          description: data.description || "A cozy homestay offering a comfortable stay.",
          contactNumber: data.contactNumber || "Not available",
          features: data.features || ["Attached Bathroom"],
          reviews: data.reviews || 0,
        });
      } catch (error) {
        console.error("Error fetching homestay details:", error);
        toast.error("Failed to load homestay details. Showing default values.");
        setHomestayDetails({
          name: homestayName,
          address: "Unknown Location",
          rating: 4.5,
          facilities: ["WiFi", "Parking"],
          images: [{ id: 1, url: "/images/homimages/placeholder-homestay.jpg", isMain: true }],
          rooms: [],
          checkInTime: "02:00 PM",
          checkOutTime: "11:00 AM",
          description: "A cozy homestay offering a comfortable stay.",
          contactNumber: "Not available",
          features: ["Attached Bathroom"],
          reviews: 0,
        });
      }
    };

    if (homestayId) {
      fetchHomestayDetails();
    }
  }, [homestayId, homestayName]);

  let checkInDate = "Today";
  let checkOutDate = "Tomorrow";
  let nightStay = "1-night stay";
  try {
    checkInDate = format(new Date(checkIn), "EEE, MMM d");
    checkOutDate = format(new Date(checkOut), "EEE, MMM d");
    const numNights = differenceInDays(new Date(checkOut), new Date(checkIn));
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

      const validPaymentMethods = ["STRIPE", "PAY_AT_PROPERTY", "KHALTI"];
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
        body.guestName = `${firstName} ${lastName}`.trim();
        body.guestEmail = email;
        body.guestPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      }

      const url = `/api${endpoint}`;
      console.log("Sending booking request to:", url);
      console.log("Request body:", JSON.stringify(body, null, 2));

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
      toast.success(
        paymentMethod === "PAY_AT_PROPERTY"
          ? "Booking confirmed successfully!"
          : "Temporary booking created! Please complete payment within 10 minutes."
      );
      return { bookingId: responseData.bookingId, expiresAt: responseData.expiresAt };
    } catch (error: any) {
      console.error("Error creating booking:", error.message);
      toast.error(error.message || "Failed to create booking. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeCheckout = async (bookingId: string) => {
    if (!bookingId) {
      throw new Error("Missing bookingId");
    }

    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.");

      console.log("Stripe Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

      const amountInPaisa = convertToPaisa(totalPrice);
      if (!Number.isInteger(amountInPaisa) || amountInPaisa < 1000) {
        throw new Error("Amount must be an integer and at least 1000 paisa (10 NPR)");
      }

      // Convert NPR to USD (approximate rate: 1 USD = 137 NPR)
      const NPR_TO_USD_RATE = 137;
      const amountInUSDCents = Math.round((amountInPaisa / 100) / NPR_TO_USD_RATE * 100);
      if (amountInUSDCents < 50) {
        throw new Error("Amount in USD must be at least 50 cents");
      }

      const payload = {
        amount: amountInUSDCents,
        currency: "usd",
        description: `Booking for ${homestayName} (Booking ID: ${bookingId})`,
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

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to initiate Stripe payment");
      }

      const { sessionId } = responseData;
      if (!sessionId) {
        throw new Error("Missing sessionId from Stripe response");
      }

      console.log("Stripe sessionId:", sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message || "Failed to redirect to Stripe checkout");
      }
    } catch (error: any) {
      console.error("Error initiating Stripe checkout:", error.message);
      toast.error(error.message || "Failed to initiate Stripe payment. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleKhaltiCheckout = async (bookingId: string) => {
    if (!bookingId) {
      throw new Error("Missing bookingId");
    }

    setIsLoading(true);
    try {
      const amountInPaisa = convertToPaisa(totalPrice);
      if (!Number.isInteger(amountInPaisa) || amountInPaisa < 1000) {
        throw new Error("Amount must be an integer and at least 1000 paisa (10 NPR)");
      }

      const payload = {
        return_url: `https://www.nepalhomestays.com/payment-callback?bookingId=${bookingId}&homestayName=${encodeURIComponent(homestayName)}&totalPrice=${totalPrice}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&selectedRooms=${encodeURIComponent(JSON.stringify(selectedRooms))}`,
        website_url: "https://www.nepalhomestays.com",
        amount: amountInPaisa,
        purchase_order_id: bookingId,
        purchase_order_name: `Booking for ${homestayName}`,
        customer_info: session?.user
          ? {
              name: `${firstName} ${lastName}`.trim(),
              email: email,
              phone: phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`,
            }
          : {
              name: `${firstName} ${lastName}`.trim(),
              email: email,
              phone: phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`,
            },
        amount_breakdown: [
          {
            label: "Base Price",
            amount: amountInPaisa,
          },
        ],
        product_details: selectedRooms.map((room: any, index: number) => ({
          identity: room.roomId.toString(),
          name: room.roomTitle,
          total_price: convertToPaisa(room.totalPrice),
          quantity: 1,
          unit_price: convertToPaisa(room.nightlyPrice),
        })),
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
        },
      };

      console.log("Khalti checkout payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("/api/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Khalti API response:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to initiate Khalti payment");
      }

      const { pidx, payment_url } = responseData;
      if (!pidx || !payment_url) {
        throw new Error("Missing pidx or payment_url from Khalti response");
      }

      console.log("Redirecting to Khalti payment URL:", payment_url);
      window.location.href = payment_url;
    } catch (error: any) {
      console.error("Error initiating Khalti checkout:", error.message);
      toast.error(error.message || "Failed to initiate Khalti payment. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form with selectedPaymentMethod:", selectedPaymentMethod);

    const newErrors: Errors = {};
    if (!session?.user) {
      if (!firstName) newErrors.firstName = "First name is required.";
      if (!lastName) newErrors.lastName = "Last name is required.";
      if (!email) newErrors.email = "Email address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address.";
      if (!countryRegion) newErrors.countryRegion = "Country/region is required.";
      if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
        newErrors.phoneNumber = "Phone number must include country code (e.g., +9771234567890).";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((error) => toast.error(error));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (selectedRooms.length === 0) {
      toast.error("No rooms selected. Please select at least one room.");
      return;
    }

    try {
      const { bookingId, expiresAt } = await handleCreateBooking();

      if (!bookingId) {
        throw new Error("Booking ID not returned from booking creation");
      }

      if (selectedPaymentMethod === "pay-at-property") {
        console.log("Confirming Pay at Property booking, bookingId:", bookingId);
        const confirmResponse = await fetch("/api/bookings/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupBookingId: bookingId,
            transactionId: `PAY_AT_PROPERTY_${bookingId}`,
            metadata: {
              homestayName,
              checkIn,
              checkOut,
              guests,
              rooms,
              selectedRooms: JSON.stringify(selectedRooms),
              totalPriceNPR: totalPrice.toString(),
              payment_timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || "Failed to confirm Pay at Property booking");
        }

        toast.success("Booking confirmed! You will pay at the property.");
        router.push(
          `/payment-success?bookingId=${bookingId}&homestayName=${encodeURIComponent(homestayName)}&totalPrice=${totalPrice}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&selectedRooms=${encodeURIComponent(JSON.stringify(selectedRooms))}&status=CONFIRMED&transactionId=PAY_AT_PROPERTY_${bookingId}`
        );
      } else if (selectedPaymentMethod === "credit-debit") {
        const expiresAtDate = new Date(expiresAt);
        const now = new Date();
        const timeLeft = (expiresAtDate.getTime() - now.getTime()) / 1000 / 60;
        if (timeLeft <= 0) {
          toast.error("Temporary booking has expired. Please try again.");
          return;
        }
        await handleStripeCheckout(bookingId);
      } else if (selectedPaymentMethod === "khalti") {
        const expiresAtDate = new Date(expiresAt);
        const now = new Date();
        const timeLeft = (expiresAtDate.getTime() - now.getTime()) / 1000 / 60;
        if (timeLeft <= 0) {
          toast.error("Temporary booking has expired. Please try again.");
          return;
        }
        await handleKhaltiCheckout(bookingId);
      } else {
        throw new Error(`Unsupported payment method: ${selectedPaymentMethod}`);
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message);
      toast.error(error.message || "Failed to process booking. Please try again.");
    }
  };

  const getImageUrl = (url: string, fallback: string = "/images/homimages/placeholder-homestay.jpg") => {
    if (!url || url === "/images/homimages/placeholder-homestay.jpg") return fallback;
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
        </header>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6 flex items-start gap-3">
          <Shield className="text-primary h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-600">
              Fully refundable before 24 hours prior to check-in
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Change or cancel your stay for a full refund if plans change.
            </p>
          </div>
        </div>

        <div className="lg:hidden space-y-6 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Booking Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  <strong>Check-in:</strong> {checkInDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  <strong>Check-out:</strong> {checkOutDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong>Guests:</strong> {totalGuests.adults} Adult{totalGuests.adults !== 1 ? "s" : ""}, {totalGuests.children} Child{totalGuests.children !== 1 ? "ren" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary" />
                <span>
                  <strong>Rooms:</strong> {rooms}
                </span>
              </div>
              {selectedRooms.map((room: any, index: number) => (
                <div key={index} className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-800">
                    Room {index + 1}: {room.roomTitle}
                  </p>
                  <p className="text-xs text-gray-600">
                    {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                  </p>
                  <p className="text-xs text-gray-600">
                    Nightly Price: NPR {room.nightlyPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Total: NPR {room.totalPrice.toFixed(2)} for {nightStay}
                  </p>
                </div>
              ))}
              <div className="mt-4 bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                <p className="text-base font-semibold text-primary">
                  Grand Total: NPR {totalPrice.toFixed(2)}
                </p>
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
                src={getImageUrl(homestayDetails.images.find((img) => img.isMain)?.url || "/images/homimages/placeholder-homestay.jpg")}
                alt={homestayDetails.name}
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error(`Failed to load image: ${e.currentTarget.src}`);
                  e.currentTarget.src = "/images/homimages/placeholder-homestay.jpg";
                }}
              />
              <p className="text-sm text-gray-600 mb-2">{homestayDetails.address}</p>
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">
                  {homestayDetails.rating ? homestayDetails.rating.toFixed(1) : "No rating"} ({homestayDetails.reviews || 0} reviews)
                </span>
              </div>
              {homestayDetails.description && (
                <p className="text-sm text-gray-600 mb-2">{homestayDetails.description}</p>
              )}
              {homestayDetails.contactNumber && homestayDetails.contactNumber !== "Not available" && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{homestayDetails.contactNumber}</span>
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
                  const imageUrl = getImageUrl(roomDetails?.imageUrls[0] || "/images/homimages/placeholder-homestay.jpg");
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <Image
                        src={imageUrl}
                        alt={room.roomTitle}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          console.error(`Failed to load room image: ${e.currentTarget.src}`);
                          e.currentTarget.src = "/images/homimages/placeholder-homestay.jpg";
                        }}
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
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Check-in:</strong> {checkInDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Check-out:</strong> {checkOutDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary/army" />
                  <span>
                    <strong>Guests:</strong> {totalGuests.adults} Adult{totalGuests.adults !== 1 ? "s" : ""}, {totalGuests.children} Child{totalGuests.children !== 1 ? "ren" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Rooms:</strong> {rooms}
                  </span>
                </div>
                {selectedRooms.map((room: any, index: number) => (
                  <div key={index} className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm font-medium text-gray-800">
                      Room {index + 1}: {room.roomTitle}
                    </p>
                    <p className="text-xs text-gray-600">
                      {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                    </p>
                    <p className="text-xs text-gray-600">
                      Nightly Price: NPR {room.nightlyPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Total: NPR {room.totalPrice.toFixed(2)} for {nightStay}
                    </p>
                  </div>
                ))}
                <div className="mt-4 bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                  <p className="text-base font-semibold text-primary">
                    Grand Total: NPR {totalPrice.toFixed(2)}
                  </p>
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
                  src={getImageUrl(homestayDetails.images.find((img) => img.isMain)?.url || "/images/homimages/placeholder-homestay.jpg")}
                  alt={homestayDetails.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    console.error(`Failed to load image: ${e.currentTarget.src}`);
                    e.currentTarget.src = "/images/homimages/placeholder-homestay.jpg";
                  }}
                />
                <p className="text-sm text-gray-600 mb-2">{homestayDetails.address}</p>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {homestayDetails.rating ? homestayDetails.rating.toFixed(1) : "No rating"} ({homestayDetails.reviews || 0} reviews)
                  </span>
                </div>
                {homestayDetails.description && (
                  <p className="text-sm text-gray-600 mb-2">{homestayDetails.description}</p>
                )}
                {homestayDetails.contactNumber && homestayDetails.contactNumber !== "Not available" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{homestayDetails.contactNumber}</span>
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
                    const imageUrl = getImageUrl(roomDetails?.imageUrls[0] || "/images/homimages/placeholder-homestay.jpg");
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <Image
                          src={imageUrl}
                          alt={room.roomTitle}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                          onError={(e) => {
                            console.error(`Failed to load room image: ${e.currentTarget.src}`);
                            e.currentTarget.src = "/images/homimages/placeholder-homestay.jpg";
                          }}
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
            <VisuallyHidden>
              <DialogTitle>Processing Payment</DialogTitle>
            </VisuallyHidden>
            <LoaderPinwheel className="animate-spin h-6 w-6 text-primary" />
            <p className="ml-3 text-sm text-gray-800">Processing payment...</p>
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