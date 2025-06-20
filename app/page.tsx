"use client";
import { useState } from "react";
import CalculatePrice from "./pricingEngine";
// Business Info
const business = {
  id: "biz_123",
  name: "Bella's Hair Studio",
  industry: "beauty",
  timezone: "America/New_York",
  pricingRules: {
    peakHours: { start: 12, end: 15, multiplier: 1.15 },
    weekendDays: { days: [5, 6, 0], multiplier: 1.5 },
    urgencyThreshold: { hours: 5, multiplier: 1.1 },
    discounts: {
      cancellation: { thresholdHours: 36, discount: 0.1 },
      lastMinute: { thresholdHours: 4, discount: 0.15 },
    },
  },
};

// Service Info
const service = {
  id: "svc_456",
  name: "Haircut & Style",
  duration: 60, // minutes
  basePrice: 85,
  minPrice: 65,
  maxPrice: 110,
};

export default function Home() {
  const [apptDate, setApptDate] = useState<Date | null>(null);
  const [bookDate, setBookDate] = useState<Date | null>(null);
  const [wasCancelled, setWasCancelled] = useState(false);
  const [cancellationDate, setCancellationDate] = useState<Date | null>(null);

  const context = {
    apptDate,
    bookDate,
    wasCancelled,
    cancellationDate,
  };

  return (
    <>
      <div className="text-3xl p-5 text-center font-">
        Dynamic Pricing Engine
      </div>
      <div className="pt-2 text-center">
        <label className="font-semibold">Date/Time of Appointment: </label>
        <input
          type="datetime-local"
          onChange={(e) => {
            setApptDate(e.target.value ? new Date(e.target.value) : null);
          }}
        ></input>
      </div>
      <div className="pt-2 text-center">
        <label className="font-semibold">Date/Time of Booking: </label>
        <input
          type="datetime-local"
          onChange={(e) => {
            setBookDate(e.target.value ? new Date(e.target.value) : null);
          }}
        ></input>
      </div>
      <div className="text-center">
        <div className="pt-2">
          <label className="mr-2 font-semibold">Was Cancelled?</label>
          <select
            value={wasCancelled ? "true" : "false"}
            onChange={(e) => setWasCancelled(e.target.value === "true")}
            className="mr-4"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          <label className="mr-2 font-semibold">Cancellation Date/Time:</label>
          <input
            type="datetime-local"
            onChange={(e) => {
              setCancellationDate(
                e.target.value ? new Date(e.target.value) : null
              );
            }}
            disabled={!wasCancelled}
          />
        </div>
      </div>
      <div className="text-center text-2xl mt-60 font-bold">
        Final Price:{" "}
        <CalculatePrice
          business={business}
          service={service}
          context={context}
        ></CalculatePrice>
      </div>
    </>
  );
}
