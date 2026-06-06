# Using `bs-date-picker` in Laravel + Inertia + React

This guide explains how to install and use the `bs-date-picker` package inside a Laravel application that uses Inertia and React.

## 1. Install the package

From your Laravel app frontend directory (usually the project root or `resources/js`):

```bash
npm install bs-date-picker
```

If your package is still local and not published to npm, install from a local path:

```bash
npm install /path/to/bs-date
```

Or install from a Git repository:

```bash
npm install git+ssh://git@github.com/your/repo.git
```

## 2. Install peer dependencies

`bs-date-picker` depends on React and Radix UI packages. Install them if they are not already present:

```bash
npm install react react-dom @radix-ui/react-popover @radix-ui/react-icons
```

## 3. Import the component in your Inertia page

Create or update a React page used by Inertia, for example `resources/js/Pages/BookingPage.jsx` or `BookingPage.tsx`:

```tsx
import React, { useState } from 'react';
import { DatePicker } from 'bs-date-picker';

export default function BookingPage() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Booking date</h1>
      <div className="mt-4 max-w-sm">
        <DatePicker
          value={date}
          onChange={setDate}
          label="Booking date"
          placeholder="Choose a date"
          calendarType="both"
          dateFormat="YYYY-MM-DD"
          minDate={new Date()}
        />
      </div>
    </div>
  );
}
```

## 4. Render the page from Laravel

In a Laravel controller, return the Inertia page:

```php
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        return Inertia::render('BookingPage');
    }
}
```

## 5. Build and run the app

Start your frontend build/watch process:

```bash
npm run dev
```

Then open your Laravel page in the browser.

## 6. Common prop usage

- `calendarType="ad"` — Gregorian date only
- `calendarType="bs"` — Nepali BS calendar only, with AD visible internally
- `calendarType="both"` — show both AD and BS values in the input
- `dateFormat="YYYY-MM-DD"` — supported formats include:
  - `YYYY-MM-DD`
  - `YYYY/MM/DD`
  - `YYYY.MM.DD`
  - `DD-MM-YYYY`
  - `DD/MM/YYYY`
  - `DD.MM.YYYY`
  - `MM-DD-YYYY`
  - `MM/DD/YYYY`
  - `MM.DD.YYYY`
- `selectionMode="date" | "month" | "year"`
- `minDate` / `maxDate` — range limits

## 7. Notes

- The component is React-only and works in any React-based Inertia page.
- It uses Tailwind-style classes but does not require Tailwind to function.
- If your app uses Vite, no additional configuration is needed beyond a normal React setup.
