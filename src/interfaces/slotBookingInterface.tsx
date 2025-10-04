export interface Slot {
  time: string;
  duration: number;
  price: number;
  availability: boolean;
  bookedBy: string | null;
}

export interface slotRequest {
  date: string;
  halfHourPrice: number;
  oneHourPrice: number;
  slots: Slot[];
}