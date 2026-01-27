import type { OpenStatus, Restaurant } from "../types/restaurant";

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * 현재 요일 이름을 반환
 */
export function getCurrentDayOfWeek(): (typeof DAYS_OF_WEEK)[number] {
  const dayIndex = new Date().getDay();
  return DAYS_OF_WEEK[dayIndex];
}

/**
 * 시간 문자열을 분으로 변환 (예: "09:30" -> 570)
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * 현재 시간을 분으로 반환
 */
function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * 오늘이 휴무일인지 확인
 */
export function isHoliday(holidays: string[]): boolean {
  const today = new Date().toISOString().split("T")[0];
  return holidays.includes(today);
}

/**
 * 영업 상태 확인
 */
export function getOpenStatus(
  businessHours: Restaurant["businessHours"],
  holidays: string[],
): OpenStatus {
  // 휴무일 체크
  if (isHoliday(holidays)) {
    return "holiday";
  }

  const currentDay = getCurrentDayOfWeek();
  const todayHours = businessHours[currentDay];

  // 오늘 휴무 (정기 휴무)
  if (!todayHours) {
    return "closed";
  }

  const currentMinutes = getCurrentTimeInMinutes();
  const openMinutes = timeToMinutes(todayHours.open);
  const closeMinutes = timeToMinutes(todayHours.close);

  // 영업 시작 30분 전
  if (currentMinutes >= openMinutes - 30 && currentMinutes < openMinutes) {
    return "opening-soon";
  }

  // 영업 종료 30분 전
  if (currentMinutes >= closeMinutes - 30 && currentMinutes < closeMinutes) {
    return "closing-soon";
  }

  // 영업 중
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return "open";
  }

  // 영업 시간 외
  return "closed";
}

/**
 * 영업 상태를 한글로 변환
 */
export function getOpenStatusLabel(status: OpenStatus): string {
  switch (status) {
    case "open":
      return "영업 중";
    case "closed":
      return "영업 종료";
    case "holiday":
      return "휴무일";
    case "opening-soon":
      return "곧 오픈";
    case "closing-soon":
      return "곧 마감";
    default:
      return "알 수 없음";
  }
}

/**
 * 오늘의 영업 시간 문자열 반환
 */
export function getTodayBusinessHoursString(
  businessHours: Restaurant["businessHours"],
): string {
  const currentDay = getCurrentDayOfWeek();
  const todayHours = businessHours[currentDay];

  if (!todayHours) {
    return "정기 휴무";
  }

  return `${todayHours.open} - ${todayHours.close}`;
}

/**
 * 거리를 포맷팅 (m / km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 가격대 표시
 */
export function formatPriceRange(range: 1 | 2 | 3): string {
  return "₩".repeat(range);
}
