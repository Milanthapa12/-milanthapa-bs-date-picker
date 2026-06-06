import * as React from 'react';
import { DatePicker } from './DatePicker';

export default function SingleDate() {

    const [inlineDate, setInlineDate] = React.useState<Date | null>(null);
  console.log('inlineDate', inlineDate);
  
    return (
    <div>
        <div className="flex align-middle gap-4">

          <DatePicker
                    inputClassName=""
                      value={inlineDate}
                      onChange={setInlineDate}
                      label="Inline date"
                      placeholder="Select a date"
                      calendarType="both"
                      dateFormat="YYYY/MM/DD"
                    />

          {/* <DatePicker
                    inputClassName=""
                      value={inlineDate}
                      onChange={setInlineDate}
                      label="Inline date"
                      placeholder="Select a date"
                      calendarType="ad"
                      dateFormat="YYYY/MM/DD"
                    /> */}
        </div>
    </div>
  );
}