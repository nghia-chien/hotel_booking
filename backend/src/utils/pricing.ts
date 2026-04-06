import PricingRule from '../models/PricingRule.js';
import RoomType from '../models/RoomType.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isWeekend = (date: Date): boolean => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

const isHoliday = (_date: Date): boolean => false;

const eachDay = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  let current = new Date(start);
  while (current < end) {
    days.push(new Date(current));
    current = new Date(current.getTime() + MS_PER_DAY);
  }
  return days;
};

export const calculateBookingPrice = async (
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> => {
  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType) {
    const err: any = new Error('Room type not found');
    err.statusCode = 404;
    throw err;
  }

  const rules = await PricingRule.find({
    roomType: roomTypeId,
    startDate: { $lte: checkOut },
    endDate: { $gte: checkIn },
  });

  const days = eachDay(checkIn, checkOut);
  let total = 0;

  for (const day of days) {
    let price: number = roomType.basePrice;

    const applicableRules = rules.filter((rule: any) => {
      const inRange = day >= rule.startDate && day <= rule.endDate;
      if (!inRange) return false;
      if (rule.applyWeekend && !isWeekend(day)) return false;
      if (rule.applyHolidays && !isHoliday(day)) return false;
      return true;
    });

    applicableRules.forEach((rule: any) => {
      if (rule.priceType === 'fixed') {
        price += rule.value;
      } else if (rule.priceType === 'percentage') {
        price += (price * rule.value) / 100;
      }
    });

    total += price;
  }

  return total;
};
