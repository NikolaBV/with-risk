import { forwardRef, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <input
        type="date"
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        value={value}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker }; 