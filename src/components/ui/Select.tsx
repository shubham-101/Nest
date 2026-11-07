
import * as Sel from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';


export const Select = ({ value, onValueChange, options, placeholder }: {
  value: string; onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <Sel.Root value={value} onValueChange={onValueChange}>
    <Sel.Trigger className="h-10 w-full inline-flex items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40">
      <Sel.Value placeholder={placeholder} />
      <Sel.Icon><ChevronDown size={16} className="text-text-muted" /></Sel.Icon>
    </Sel.Trigger>
    <Sel.Portal>
      <Sel.Content className="z-50 bg-surface border border-border rounded-xl shadow-lg p-1 max-h-60 overflow-auto">
        <Sel.Viewport>
          {options.map(o => (
            <Sel.Item key={o.value} value={o.value} className="relative flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-surface-2 outline-none data-[highlighted]:bg-surface-2">
              <Sel.ItemText>{o.label}</Sel.ItemText>
              <Sel.ItemIndicator className="absolute right-2"><Check size={14} /></Sel.ItemIndicator>
            </Sel.Item>
          ))}
        </Sel.Viewport>
      </Sel.Content>
    </Sel.Portal>
  </Sel.Root>
);