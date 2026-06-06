import * as React from 'react';
import { DatePicker } from './DatePicker';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [inlineDate, setInlineDate] = React.useState<Date | null>(null);
  const [modalDate, setModalDate] = React.useState<Date | null>(null);
  const supportedFormats = [
    'YYYY-MM-DD',
    'YYYY/MM/DD',
    'YYYY.MM.DD',
    'DD-MM-YYYY',
    'DD/MM/YYYY',
    'DD.MM.YYYY',
    'MM-DD-YYYY',
    'MM/DD/YYYY',
    'MM.DD.YYYY'
  ] as const;

  const [formatDates, setFormatDates] = React.useState<Record<string, Date | null>>(
    Object.fromEntries(supportedFormats.map((format) => [format, null]))
  );
  const [monthFormatDates, setMonthFormatDates] = React.useState<Record<string, Date | null>>(
    Object.fromEntries(supportedFormats.map((format) => [format, null]))
  );
  const [bsMonthFormatDates, setBsMonthFormatDates] = React.useState<Record<string, Date | null>>(
    Object.fromEntries(supportedFormats.map((format) => [format, null]))
  );

  const handleFormatChange = (format: string, date: Date | null) => {
    setFormatDates((current) => ({ ...current, [format]: date }));
  };

  const handleMonthFormatChange = (format: string, date: Date | null) => {
    setMonthFormatDates((current) => ({ ...current, [format]: date }));
  };

  const handleBsMonthFormatChange = (format: string, date: Date | null) => {
    setBsMonthFormatDates((current) => ({ ...current, [format]: date }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">bs-date-picker demo</h1>
          <p className="mt-2 text-sm text-slate-600">
            This demo shows both a non-modal inline picker and a modal picker. The modal picker uses a portal so the popover stays visible above modal content.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Inline example</h2>
            <p className="mt-2 text-sm text-slate-600">A date picker rendered directly on the page.</p>
            <div className="mt-5">
              <DatePicker
              inputClassName=""
                value={inlineDate}
                onChange={setInlineDate}
                label="Inline date"
                placeholder="Select a date"
                calendarType="both"
                dateFormat="YYYY/MM/DD"
              />
            </div>
            <div className="mt-5">
              <DatePicker
                value={inlineDate}
                onChange={setInlineDate}
                label="Month selection"
                placeholder="Select a month"
                calendarType="ad"
                selectionMode="month"
                dateFormat="YYYY-MM-DD"
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2030, 11, 31)}
              />
            </div>
            <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <strong>Inline selected:</strong>{' '}
              {inlineDate ? inlineDate.toLocaleDateString() : 'None selected'}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Modal example</h2>
            <p className="mt-2 text-sm text-slate-600">Open the modal and use the date picker inside it.</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open date picker modal
            </button>
            <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <strong>Modal selected:</strong>{' '}
              {modalDate ? modalDate.toLocaleDateString() : 'None selected'}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">All supported date formats</h2>
          <p className="mt-2 text-sm text-slate-600">Each picker below uses one supported parsing/formatting pattern.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supportedFormats.map((format) => (
              <div key={format} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-medium text-slate-700">{format}</div>
                <DatePicker
                  value={formatDates[format]}
                  onChange={(date) => handleFormatChange(format, date)}
                  label={format}
                  placeholder={format}
                  calendarType="ad"
                  dateFormat={format}
                />
                <div className="mt-3 text-xs text-slate-500">
                  Selected: {formatDates[format] ? formatDates[format]!.toLocaleDateString() : 'None'}
                </div>
              </div>
            ))}
          </div>
        </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">All supported month-selection formats</h2>
            <p className="mt-2 text-sm text-slate-600">Each picker below lets you select only month and year for a supported format.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supportedFormats.map((format) => (
                <div key={`month-${format}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-medium text-slate-700">{format}</div>
                  <DatePicker
                    value={monthFormatDates[format]}
                    onChange={(date) => handleMonthFormatChange(format, date)}
                    label={`Month - ${format}`}
                    placeholder={format}
                    calendarType="ad"
                    selectionMode="month"
                    dateFormat={format}
                  />
                  <div className="mt-3 text-xs text-slate-500">
                    Selected: {monthFormatDates[format] ? monthFormatDates[format]!.toLocaleDateString() : 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">All supported BS month-selection formats</h2>
            <p className="mt-2 text-sm text-slate-600">Each picker below uses the same format strings but displays BS month/year selection.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supportedFormats.map((format) => (
                <div key={`bs-month-${format}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-medium text-slate-700">{format}</div>
                  <DatePicker
                    value={bsMonthFormatDates[format]}
                    onChange={(date) => handleBsMonthFormatChange(format, date)}
                    label={`BS Month - ${format}`}
                    placeholder={format}
                    calendarType="bs"
                    selectionMode="month"
                    dateFormat={format}
                  />
                  <div className="mt-3 text-xs text-slate-500">
                    Selected: {bsMonthFormatDates[format] ? bsMonthFormatDates[format]!.toLocaleDateString() : 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Modal content</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Reservation details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The calendar popover is rendered through a portal, keeping it visible above the modal wrapper when opened.
            </p>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Choose your check-in date:</div>
            <div className="mt-4">
              <DatePicker
                value={modalDate}
                onChange={(date) => {
                  setModalDate(date);
                  if (date) setModalOpen(false);
                }}
                label="Check-in date"
                placeholder="Choose your arrival date"
                calendarType="both"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
