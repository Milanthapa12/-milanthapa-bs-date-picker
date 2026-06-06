import { describe, expect, it } from 'vitest';
import { getBsMonthForSelection } from './DatePicker';

describe('getBsMonthForSelection', () => {
  it('preserves the selected BS month when bsDate is provided', () => {
    const selected = new Date('2026-05-15T00:00:00.000Z');
    const bsDate = { year: 2083, month: 2, day: 1 };

    expect(getBsMonthForSelection(selected, bsDate)).toEqual({ year: 2083, month: 2 });
  });

  it('falls back to adToBs conversion when bsDate is not provided', () => {
    const selected = new Date('2026-05-15T00:00:00.000Z');

    expect(getBsMonthForSelection(selected)).toEqual({ year: 2083, month: 2 });
  });
});
