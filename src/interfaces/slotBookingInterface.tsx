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

export enum SlotDuration {
  HALF_HOUR = 30,
  ONE_HOUR = 60,
}

export interface TimeSlot {
  id: string;
  time: string;
  duration: SlotDuration;
  price: number;
}

export interface SavedSlot {
  _id: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  availability: boolean;
  bookedBy: null | string;
}

export interface SavedSlotDate {
  _id: string;
  date: string;
  halfHourPrice: number;
  oneHourPrice: number;
  slots: SavedSlot[];
}

export interface SlotRequest {
  date: string;
  halfHourPrice: number;
  oneHourPrice: number;
  slots: {
    time: string;
    duration: number;
    price: number;
    availability: boolean;
    bookedBy: null | string;
  }[];
}
