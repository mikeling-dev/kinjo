"use client";

import { countries } from "countries-list";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronsUpDown } from "lucide-react"; // Icons from shadcn

// Prepare country list
const countryList = Object.entries(countries).map(([, info]) => ({
  code: info.phone[0],
  country: info.name,
  searchValue: `${info.phone[0]} ${info.name.toLowerCase()}`, // For filtering
}));

interface CountryCodeProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function CountryCodeSelector({ value, onChange }: CountryCodeProps) {
  const [open, setOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-20 justify-between p-2"
        >
          {selectedCode ? `+${selectedCode}` : "Code"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 sm:w-96 p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>No countries found.</CommandEmpty>
            <CommandGroup>
              {countryList.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.searchValue}
                  onSelect={() => {
                    setSelectedCode(country.code.toString());
                    onChange?.(country.code.toString());
                    setOpen(false);
                  }}
                >
                  <span>
                    +{country.code} - {country.country}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
