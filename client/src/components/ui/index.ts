import React from 'react';

// TypeScript interfaces for component props
interface BaseProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

interface ButtonProps extends BaseProps {
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

interface SelectProps extends BaseProps {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  className?: string;
  [key: string]: any;
}

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  [key: string]: any;
}

interface TabsProps extends BaseProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface DialogProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Button Component
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "default",
  size = "default",
  disabled = false,
  type = "button",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary"
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Components
export const Card = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Input Component
export const Input = ({ 
  className = "",
  type = "text",
  ...props 
}: {
  className?: string;
  type?: string;
  [key: string]: any;
}) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Label Component
export const Label = ({ children, className = "", htmlFor, ...props }: { children: React.ReactNode; className?: string; htmlFor?: string; [key: string]: any }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
);

// Select Components
export const Select = ({ children, onValueChange, defaultValue, value, ...props }: { 
  children: React.ReactNode; 
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  [key: string]: any;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {
              isOpen,
              setIsOpen,
              selectedValue,
              onValueChange: handleValueChange,
            })
          : child
      )}
    </div>
  );
};

export const SelectTrigger = ({ 
  children, 
  className = "",
  isOpen,
  setIsOpen,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  [key: string]: any;
}) => (
  <button
    type="button"
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    onClick={() => setIsOpen?.(!isOpen)}
    {...props}
  >
    {children}
  </button>
);

export const SelectValue = ({ 
  placeholder = "Select...",
  selectedValue,
  ...props 
}: { 
  placeholder?: string;
  selectedValue?: string;
  [key: string]: any;
}) => (
  <span {...props}>
    {selectedValue || placeholder}
  </span>
);

export const SelectContent = ({ 
  children,
  className = "",
  isOpen,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  [key: string]: any;
}) => (
  isOpen ? (
    <div
      className={`absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  ) : null
);

export const SelectItem = ({ 
  children,
  value,
  className = "",
  onValueChange,
  ...props 
}: { 
  children: React.ReactNode;
  value: string;
  className?: string;
  onValueChange?: (value: string) => void;
  [key: string]: any;
}) => (
  <div
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
    onClick={() => onValueChange?.(value)}
    {...props}
  >
    {children}
  </div>
);

// Slider Component
export const Slider = ({ 
  value = [0],
  onValueChange,
  max = 100,
  min = 0,
  step = 1,
  className = "",
  ...props 
}: {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  className?: string;
  [key: string]: any;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [parseInt(e.target.value)];
    onValueChange?.(newValue);
  };

  return (
    <div className={`relative flex w-full touch-none select-none items-center ${className}`} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );
};

// Switch Component
export const Switch = ({ 
  checked = false,
  onCheckedChange,
  className = "",
  ...props 
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  [key: string]: any;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-primary' : 'bg-input'
    } ${className}`}
    onClick={() => onCheckedChange?.(!checked)}
    {...props}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// Tabs Components
export const Tabs = ({ 
  children,
  defaultValue,
  value,
  onValueChange,
  className = "",
  ...props 
}: {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  [key: string]: any;
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={className} {...props}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {
              activeTab,
              onTabChange: handleTabChange,
            })
          : child
      )}
    </div>
  );
};

export const TabsList = ({ 
  children,
  className = "",
  activeTab,
  onTabChange,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  [key: string]: any;
}) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  >
    {React.Children.map(children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement, {
            activeTab,
            onTabChange,
          })
        : child
    )}
  </div>
);

export const TabsTrigger = ({ 
  children,
  value,
  className = "",
  activeTab,
  onTabChange,
  ...props 
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  [key: string]: any;
}) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value
        ? 'bg-background text-foreground shadow-sm'
        : 'hover:bg-background/80'
    } ${className}`}
    onClick={() => onTabChange?.(value)}
    {...props}
  >
    {children}
  </button>
);

export const TabsContent = ({ 
  children,
  value,
  className = "",
  activeTab,
  ...props 
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
  activeTab?: string;
  [key: string]: any;
}) => (
  activeTab === value ? (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  ) : null
);

// Textarea Component
export const Textarea = ({ 
  className = "",
  ...props 
}: {
  className?: string;
  [key: string]: any;
}) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Dialog Components
export const Dialog = ({ 
  children,
  open = false,
  onOpenChange,
  ...props 
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any;
}) => {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {
              isOpen,
              onOpenChange: handleOpenChange,
            })
          : child
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => handleOpenChange(false)}
        />
      )}
    </>
  );
};

export const DialogContent = ({ 
  children,
  className = "",
  isOpen,
  onOpenChange,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any;
}) => (
  isOpen ? (
    <div
      className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg ${className}`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <button
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => onOpenChange?.(false)}
      >
        ✕
      </button>
      {children}
    </div>
  ) : null
);

export const DialogHeader = ({ 
  children,
  className = "",
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ 
  children,
  className = "",
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h2>
);

// Export all the implemented components above