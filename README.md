# bs-date-picker

A lightweight React date picker component designed for Tailwind / shadcn-style UIs and built with Radix Popover. It works inside modals and supports modern React + Vite app workflows.

## Features

- Native-like date selection UI
- Modal-safe popover using `@radix-ui/react-popover`
- Tailwind utility class styling
- Works with React 18+, Vite, and Inertia-powered React apps
- Includes Nepali BS calendar support alongside AD
- Peer dependencies for React and Radix packages

## Install

```bash
npm install @milanthapamgr/bs-date-picker
```

Install peer dependencies in your app:

```bash
npm install react react-dom @radix-ui/react-popover @radix-ui/react-icons
````


## Usage

```tsx
import { DatePicker } from '@milanthapamgr/bs-date-picker';

export function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="p-6">
      <DatePicker
        value={date}
        onChange={setDate}
        label="Booking date"
        placeholder="Choose a date"
        calendarType="both"
        minDate={new Date()}
      />
    </div>
  );
}
```

## Props

- `value?: Date | null`
- `defaultValue?: Date | null`
- `onChange?: (date: Date | null) => void`
- `label?: string`
- `placeholder?: string`
- `locale?: string`
- `disabled?: boolean`
- `className?: string`
- `inputClassName?: string`
- `inputStyle?: React.CSSProperties`
- `calendarClassName?: string`
- `calendarStyle?: React.CSSProperties`
- `minDate?: Date`
- `maxDate?: Date`
- `calendarType?: 'ad' | 'bs' | 'both'`  
  - `ad` shows only the Gregorian date picker and AD value  
  - `bs` shows the Bikram Sambat calendar picker while keeping AD visible in the input  
  - `both` shows the BS calendar picker and both AD/BS values in the input
- `dateFormat?: string | string[]`  
  - supports `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY.MM.DD`, `DD-MM-YYYY`, `DD/MM/YYYY`, `DD.MM.YYYY`, `MM-DD-YYYY`, `MM/DD/YYYY`, `MM.DD.YYYY`  
  - the input parses all supported formats and outputs the first provided format  
  - applies to AD display and BS display when `calendarType` is `bs` or `both`
- `selectionMode?: 'date' | 'month' | 'year'`  
  - `date` shows a day-level calendar  
  - `month` lets the user pick year and month with no day selected  
  - `year` lets the user pick a year only

## Notes

- The popover content is rendered in a portal, so the picker works reliably inside modals.
- Styling uses Tailwind utility classes, so it matches Tailwind/shadcn-style apps naturally.
- The component imports its own bundled CSS, so consuming apps do not need to manually import additional CSS for the picker.
- `Inline example` for a non-modal picker
- `Modal example` for a picker inside a modal rendered through a portal

If you want to preview the built site after `npm run build`, use:

```bash
npm run preview
```

This package is pinned to `vite@5.4.20` for compatibility with the latest Node runtime.

## Build

```bash
npm run build
```
