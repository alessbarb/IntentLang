intent "Booking service" tags ["api","booking"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
  clock: Clock {},
  random: Random { seed: 7 },
}

types {
  // Brands
  type Email = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$");
  type BookingId = String brand "BookingId";
  type PassengerId = String brand "PassengerId";
  type MoneyCents = Int brand "MoneyCents";

  // Literals & unions
  type Currency = "EUR" | "USD";

  // Records
  type Price = { 
    amount: MoneyCents, 
    currency: Currency 
  };

  // Union with named constructors (discriminated)
  type SeatClass =
    | Economy {}
    | Business { lounge: Bool }
    | First { suite: Bool };

  type Passenger = {
    id: PassengerId,
    name: String where _.length >= 2,
    email: Email,
  };

  type Booking = {
    id: BookingId,
    passenger: Passenger,
    flightId: String,
    seat: SeatClass,
    price: Price,
    createdAt: DateTime,
  };

  type BookingError = { 
    code: Int, 
    message: String
  };

  // Collections in types
  type SeatMap = Map<String, SeatClass>;
  type PriceList = Array<Price>;
}

// ------------- Pure funcs -------------

func toEmail(s: String): Result<Email, String> {
  if matches("^[^@]+@[^@]+\\.[^@]+$", s) {
    return Ok(brand<Email>(s));
  } else {
    return Err("Invalid email");
  }
}

func priceFromFloat(amount: Float, currency: Currency): Price
  requires amount >= 0.0
{
  // floor(amount * 100)
  let cents = (amount * 100.0) >> 0;
  return { amount: brand<MoneyCents>(cents), currency };
}

func chooseSeat(n: Int): SeatClass {
  // Simple deterministic bucket by modulo
  let m = n % 3;
  match m {
    0 => Economy {};
    1 => Business { lounge: true };
    2 => First { suite: false };
  }
}

func seatLabel(s: SeatClass): String {
  match s {
    Economy {} => "E";
    Business { lounge: _l } => "B";
    First { suite: _s } => "F";
  }
}

// ------------- Effects -------------

effect createBooking(input: {
  name: String,
  email: Email,
  flightId: String,
  basePrice: Float,
  currency: Currency,
}): Result<Booking, BookingError> uses http, clock, random {
  // Pseudo-UUID from RNG
  let rawId = random.next().toString();
  let id = brand<BookingId>(rawId);

  let seat = chooseSeat((random.next() * 10) >> 0);
  let price = priceFromFloat(input.basePrice, input.currency);

  // Build passenger using shorthand fields
  let passenger = {
    id: brand<PassengerId>(rawId),
    name: input.name,
    email: input.email,
  };

  return http.post("/bookings", {
    id,
    passenger,
    flightId: input.flightId,
    seat,
    price,
    createdAt: clock.now(),
  });
}

effect sendItinerary(b: Booking): Result<Bool, BookingError> uses http {
  let label = seatLabel(b.seat);
  // Toy payload
  let payload = {
    to: b.passenger.email,
    subject: "Your itinerary",
    body: "Seat " + label + " for flight " + b.flightId,
  };
  return http.post("/emails", payload);
}

// ------------- Test -------------

test booking_flow {
  // Happy email
  let e = toEmail("user@example.com");
  // Price helper
  let p = priceFromFloat(123.45, "EUR");
  // Seat label on a constructor
  let lab = seatLabel(Economy {});
}
