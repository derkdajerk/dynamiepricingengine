type PeakHours = {
  start: number;
  end: number;
  multiplier: number;
};

type WeekendDays = {
  days: number[];
  multiplier: number;
};

type UrgencyThreshold = {
  hours: number;
  multiplier: number;
};

type Discounts = {
  cancellation: { thresholdHours: number; discount: number };
  lastMinute: { thresholdHours: number; discount: number };
};

type PricingRules = {
  peakHours: PeakHours;
  weekendDays: WeekendDays;
  urgencyThreshold: UrgencyThreshold;
  discounts: Discounts;
};

type Business = {
  id: string;
  name: string;
  industry: string;
  timezone: string;
  pricingRules: PricingRules;
};

type Service = {
  id: string;
  name: string;
  basePrice: number;
  duration: number; // minutes
  minPrice: number;
  maxPrice: number;
};

type Context = {
  apptDate: Date | null;
  bookDate: Date | null;
  wasCancelled: boolean;
  cancellationDate: Date | null;
};

type CalculatePriceProps = {
  business: Business;
  service: Service;
  context: Context;
};

type PriceResult = {
  success: boolean;
  price?: number;
  error?: string;
};

const calculatePrice = (
  business: Business,
  service: Service,
  context: Context
): PriceResult => {
  // Date validation
  if (!context.apptDate || !context.bookDate) {
    return { success: false, error: "Missing required dates" };
  }

  if (context.bookDate > context.apptDate) {
    return {
      success: false,
      error: "Booking date cannot be after appointment date",
    };
  }

  if (context.cancellationDate && context.cancellationDate > context.apptDate) {
    return {
      success: false,
      error: "Cancellation date cannot be after appointment date",
    };
  }

  // Rest of existing calculation logic
  const basePrice = service.basePrice;
  let price = service.basePrice;

  // Check the day of the week, apply price increase if weekend
  if (
    business.pricingRules.weekendDays.days.includes(context.apptDate.getDay())
  ) {
    price *= business.pricingRules.weekendDays.multiplier;
  }

  // Check if its during peak times
  if (
    business.pricingRules.peakHours.start <= context.apptDate.getHours() &&
    context.apptDate.getHours() < business.pricingRules.peakHours.end
  ) {
    price *= business.pricingRules.peakHours.multiplier;
  }

  // Check if customer is booking within urgency threshold
  if (
    (context.apptDate.getTime() - context.bookDate.getTime()) / 36e5 <=
    business.pricingRules.discounts.lastMinute.thresholdHours
  ) {
    price *= 1 - business.pricingRules.discounts.lastMinute.discount;
  } else if (
    // If not then check if the appointment was previously cancelled
    context.wasCancelled &&
    context.cancellationDate &&
    (context.apptDate.getTime() - context.cancellationDate.getTime()) / 36e5 <=
      business.pricingRules.discounts.cancellation.thresholdHours
  ) {
    price *= 1 - business.pricingRules.discounts.cancellation.discount;
  }

  // Return success with calculated price
  price = Math.max(service.minPrice, Math.min(price, service.maxPrice));
  return { success: true, price: price };
};

const CalculatePrice: React.FC<CalculatePriceProps> = ({
  business,
  service,
  context,
}) => {
  const result = calculatePrice(business, service, context);

  return result.success ? (
    <span>${result.price?.toFixed(2)}</span>
  ) : (
    <span>Error: {result.error}</span>
  );
};

export default CalculatePrice;
