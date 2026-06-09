"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X,
  LucideIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = "Tanlang...",
  label,
  error,
  searchable = true,
  clearable = false,
  className,
  disabled = false,
}: CustomSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);
  const Icon = selectedOption?.icon;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.("");
  };

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-600 ml-1">
          {label}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectPrimitive.Trigger
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border bg-white/50 px-4 py-2 text-sm ring-offset-background transition-all hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/50 dark:border-slate-200 dark:hover:bg-white/80 backdrop-blur-sm shadow-sm",
            error ? "border-red-500 ring-red-500/20" : "border-slate-200"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {Icon && <Icon className="size-4 text-primary shrink-0" />}
            <SelectPrimitive.Value placeholder={placeholder}>
              {selectedOption?.label}
            </SelectPrimitive.Value>
          </div>
          
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-slate-700 dark:hover:bg-slate-100 text-slate-400 transition-colors"
                aria-label="Clear selection"
              >
                <X className="size-3.5" />
              </button>
            )}
            <SelectPrimitive.Icon asChild>
              <ChevronDown className={cn("size-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </SelectPrimitive.Icon>
          </div>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 min-w-[var(--radix-select-trigger-width)] max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-200 dark:bg-slate-50/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            position="popper"
            sideOffset={8}
          >
            {searchable && (
              <div className="sticky top-0 z-10 flex items-center border-b border-slate-200/50 dark:border-slate-200 bg-inherit px-3 py-2">
                <Search className="mr-2 size-4 text-slate-400 shrink-0" />
                <input
                  className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Qidiruv..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 bg-slate-50/50 dark:bg-white/50 cursor-default">
              <ChevronUp className="size-4 text-slate-400" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1.5">
              <SelectPrimitive.Group>
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-400">
                    Natija topilmadi
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} icon={option.icon}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 bg-slate-50/50 dark:bg-white/50 cursor-default">
              <ChevronDown className="size-4 text-slate-400" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { icon?: LucideIcon }
>(({ className, children, icon: ItemIcon, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-sm outline-none transition-colors focus:bg-primary/10 focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-primary/10 dark:focus:text-primary",
      className
    )}
    {...props}
  >
    {ItemIcon && <ItemIcon className="size-4 mr-2 shrink-0 text-slate-400 group-focus:text-primary" />}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-3 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check className="size-4 text-primary" />
        </motion.div>
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export default CustomSelect;
