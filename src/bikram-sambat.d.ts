declare module 'bikram-sambat' {
  export function toBik(value: string | Date): {
    year: number;
    month: number;
    day: number;
  };

  export function toGreg(year: number, month: number, day: number): {
    year: number;
    month: number;
    day: number;
  };

  export function daysInMonth(year: number, month: number): number;
  export function toBik_text(value: string | Date): string;
  export function toDev(value: string | Date): string;
}
