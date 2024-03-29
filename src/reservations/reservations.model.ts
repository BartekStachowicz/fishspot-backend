export interface Reservation {
  [year: string]: ReservationData[];
}

export interface ReservationData {
  id: string;

  fullName: string;

  phone: string;

  email: string;
  data: {
    dates: {
      date: string;
      priceForDate: number;
    }[];
    spotId: string;
  }[];
  timestamp: string;
  confirmed: boolean;
  rejected: boolean;
  price: number;
  fullPaymentMethod: string; //online, cash itp.
  fullPaymentStatus: string; //oczekujące, zapłacone itp.
  depositPrice: number; //wysokość zaliczki
  depositSoFar: number; //wysokość wpłaconej zaliczki (np. gotówką przy okazji łowienia)
  isDepositPaid: boolean; //czy zapłacona zaliczka
  isDepositRequired: boolean; // czy wymagana zaliczka
}
