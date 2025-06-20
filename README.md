# Dynamic Pricing Engine

A TypeScript-based pricing engine for service businesses that calculates real-time pricing based on demand patterns, booking urgency, and business preferences.

## Overview

This pricing engine was initially designed for a hair salon to dynamically adjust pricing based on real-world demand patterns. Rather than using arbitrary price increases, the engine reflects actual business conditions like:
- Peak hours
- Weekend demand
- Last-minute booking scenarios.

## Approach

The engine follows a structured calculation flow:

1. **Base Price Adjustments** - Apply multipliers for high-demand periods(Weekends/Mid-Day)
2. **Discount Hierarchy** - Apply the best available discount to the customer(But do not stack)
3. **Error Handling** - Validate inputs and provide fallback behavior

The pricing logic prioritizes customer experience by offering discounts for less desirable time slots and last-minute bookings, rather than penalizing customers with excessive surcharges.

## Function Signature

```typescript
function calculatePrice(
  business: Business, 
  service: Service, 
  context: Context
): PriceResult
```

### Type Definitions

```typescript
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
  duration: number;
  minPrice: number;
  maxPrice: number;
};

type Context = {
  apptDate: Date | null;
  bookDate: Date | null;
  wasCancelled: boolean;
  cancellationDate: string;
};

type PriceResult = {
  success: boolean;
  price?: number;
  error?: string;
};

type PricingRules = {
  peakHours: {
    start: number;
    end: number;
    multiplier: number;
  };
  weekendDays: {
    days: number[];
    multiplier: number;
  };
  discounts: {
    cancellation: { 
      thresholdHours: number; 
      discount: number 
    };
    lastMinute: { 
      thresholdHours: number; 
      discount: number 
    };
  };
};
```

## Example Usage

```typescript
const business = {
  id: "salon_123",
  name: "Bella's Hair Studio",
  industry: "beauty",
  timezone: "America/New_York",
  pricingRules: {
    peakHours: {
      start: 12,
      end: 15,
      multiplier: 1.15
    },
    weekendDays: {
      days: [5, 6, 0], // Friday, Saturday, Sunday
      multiplier: 1.10
    },
    discounts: {
      cancellation: {
        thresholdHours: 36,
        discount: 0.10
      },
      lastMinute: {
        thresholdHours: 4,
        discount: 0.15
      }
    }
  }
};

const service = {
  id: "haircut_001",
  name: "Haircut & Style",
  basePrice: 85,
  duration: 60,
  minPrice: 65,
  maxPrice: 110
};

const context = {
  apptDate: new Date("2024-06-22T14:30:00"), // Saturday 2:30 PM
  bookDate: new Date("2024-06-22T13:00:00"),  // Same day 1:00 PM
  wasCancelled: false,
  cancellationDate: ""
};

const result = calculatePrice(business, service, context);
// Result: { success: true, price: 91.40 }
// Calculation: $85 base * 1.10 weekend * 1.15 peak hours * 0.85 last-minute discount
```

## Pricing Factors

### 1. Peak Hours (15% increase)
- **Hours**: 12:00 PM - 3:00 PM
- **Rationale**: Based on real local salon data showing highest demand during lunch/afternoon hours
- **Implementation**: Multiplier applied to base price during specified hours

### 2. Weekend Premium (10% increase)
- **Days**: Friday, Saturday, Sunday
- **Rationale**: Weekend appointments are consistently more popular and harder to book
- **Implementation**: Base price multiplier for specified days of the week

### 3. Discount Hierarchy
The engine applies the best available discount to customers:

#### Last-Minute Booking Discount (15% off)
- **Threshold**: Booking within 4 hours of appointment
- **Rationale**: Incentivizes customers to fill urgent gaps in the schedule
- **Priority**: Takes precedence over cancellation discount

#### Cancellation Slot Discount (10% off)  
- **Threshold**: Slot was cancelled within 36 hours of original appointment
- **Rationale**: Helps fill slots that became available on short notice
- **Priority**: Applied only if last-minute discount doesn't apply

## Business Logic Decisions

### Why Discounts Instead of Surcharges?
- **Customer Experience**: Discounts feel like rewards rather than penalties
- **Inventory Management**: Encourages booking during less popular times
- **Revenue Optimization**: Better to fill slots at reduced rates than leave them empty

### Discount Hierarchy Reasoning
- Last-minute bookings (15%) are harder to fill than planned cancellation slots (10%)
- Prevents customers from "gaming" the system by getting multiple discounts
- Ensures customers always get the best available deal

### Error Handling Philosophy
- **Graceful Degradation**: Return meaningful error messages rather than crashing
- **Input Validation**: Catch impossible scenarios (booking after appointment time)
- **Business Rule Protection**: Prevent invalid configurations from breaking calculations

## Integration

The pricing engine is designed as a pure function that can be:
- Called from React components for real-time UI updates
- Integrated into booking APIs for server-side calculations  
- Extended with additional business rules via the database-driven configuration
- Tested independently with various scenarios

## Future Enhancements

- **Dynamic Rule Loading**: Load pricing rules from PostgreSQL database
- **A/B Testing**: Support for multiple pricing strategies
- **Demand Forecasting**: Integration with external APIs for real-time demand data
- **Multi-Location Support**: Different pricing rules per business location
