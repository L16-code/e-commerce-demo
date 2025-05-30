"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

interface OrderDetails {
  productId: string;
  name: string;
  price: number;
  image: string;
  colorId?: string;
  colorName?: string;
  sizeId?: string;
  sizeName?: string;
  quantity: number;
  subtotal: number;
  total: number;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  useEffect(() => {
    // Get order details from session storage
    const storedOrderDetails = sessionStorage.getItem("orderDetails");
    if (storedOrderDetails) {
      setOrderDetails(JSON.parse(storedOrderDetails));
    } else {
      // Redirect to home if no order details
      router.push("/");
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    // Validate all fields
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.state.trim()) {
      errors.state = "State is required";
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      errors.zipCode = "Invalid ZIP code format";
    }

    if (!formData.cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\D/g, ""))) {
      errors.cardNumber = "Card number must be 16 digits";
    }

    if (!formData.expiryDate.trim()) {
      errors.expiryDate = "Expiry date is required";
    } else {
      // Validate expiry date is in future
      const [month, year] = formData.expiryDate.split("/");
      const expiryDate = new Date();
      expiryDate.setFullYear(
        2000 + parseInt(year || "0"),
        parseInt(month || "0") - 1,
        1
      );

      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        errors.expiryDate = "Expiry date must be in the future";
      }
    }

    if (!formData.cvv.trim()) {
      errors.cvv = "CVV is required";
    } else if (!/^\d{3}$/.test(formData.cvv)) {
      errors.cvv = "CVV must be 3 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate a transaction with our API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          payment: {
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
          },
          order: orderDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Store order info including status in session storage for thank you page
      sessionStorage.setItem(
        "orderConfirmation",
        JSON.stringify({
          orderNumber: data.orderNumber,
          status: data.status,
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          order: orderDetails,
        })
      );

      // Navigate to thank you page
      router.push("/thank-you");
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  if (!orderDetails) {
    return (
      <div className="min-h-screen">
        <header className="header bg-white shadow">
          <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              eCommerce Store
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Products
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="p-8 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="header bg-white shadow">
          <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              eCommerce Store
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Products
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${
                        formErrors.fullName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.phone
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="(123) 456-7890"
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Shipping Address</h2>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.state
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="zipCode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.zipCode
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    For testing: Enter card numbers starting with 1 (approved),
                    2 (declined), or 3 (gateway error)
                  </p>

                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${
                        formErrors.cardNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="1111222233334444"
                      maxLength={16}
                    />
                    {formErrors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiryDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.expiryDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {formErrors.expiryDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="cvv"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${
                          formErrors.cvv ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="123"
                        maxLength={3}
                      />
                      {formErrors.cvv && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-blue-300"
                >
                  {loading ? "Processing..." : "Complete Purchase"}
                </button>
              </form>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded relative overflow-hidden">
                    <Image
                      src={orderDetails.image}
                      alt={orderDetails.name}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium">{orderDetails.name}</h3>
                    <div className="text-sm text-gray-500">
                      {orderDetails.colorName && (
                        <div>Color: {orderDetails.colorName}</div>
                      )}
                      {orderDetails.sizeName && (
                        <div>Size: {orderDetails.sizeName}</div>
                      )}
                      <div>Quantity: {orderDetails.quantity}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
