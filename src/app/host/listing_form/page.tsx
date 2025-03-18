// app/host/listing_form/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ListingFormPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [entireUnit, setEntireUnit] = useState(true);
  const [room, setRoom] = useState("");
  const [washroom, setWashroom] = useState("");
  const [capacity, setCapacity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [excludedDates, setExcludedDates] = useState<Date[]>([]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotoFiles(Array.from(e.target.files));
  };

  const handleAddExcludedDate = (date: Date | undefined) => {
    if (
      date &&
      !excludedDates.some((d) => d.toDateString() === date.toDateString())
    ) {
      setExcludedDates([...excludedDates, date]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("title", title);
    formData.append("entireUnit", String(entireUnit));
    formData.append("room", room);
    formData.append("washroom", washroom);
    formData.append("capacity", capacity);
    if (description) formData.append("description", description);
    if (locationState) formData.append("locationState", locationState);
    if (locationCountry) formData.append("locationCountry", locationCountry);
    if (latitude) formData.append("latitude", latitude);
    if (longitude) formData.append("longitude", longitude);
    formData.append("pricePerNight", pricePerNight);
    for (const file of photoFiles) {
      formData.append("photos", file);
    }
    formData.append(
      "excludedDates",
      JSON.stringify(excludedDates.map((d) => d.toISOString()))
    );

    try {
      const res = await fetch("/api/host/listing", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Listing created successfully!");
        router.push("/host");
      } else {
        setMessage(data.error || "Failed to create listing");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cozy Cabin"
            required
          />
        </div>
        <div>
          <label className="flex items-center font-semibold">
            <Checkbox
              checked={entireUnit}
              onCheckedChange={(checked) => setEntireUnit(checked as boolean)}
            />
            <span className="ml-2">Entire Unit</span>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid">
            <label className="block font-semibold">Rooms</label>
            <Input
              type="number"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="1"
              required
            />
          </div>
          <div className="grid">
            <label className="block font-semibold">Washrooms</label>
            <Input
              type="number"
              value={washroom}
              onChange={(e) => setWashroom(e.target.value)}
              placeholder="1"
              required
            />
          </div>
          <div className="grid">
            <label className="block font-semibold">Capacity</label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A quiet retreat"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Location State</label>
            <Input
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              placeholder="CA"
            />
          </div>
          <div>
            <label className="block font-semibold">Location Country</label>
            <Input
              value={locationCountry}
              onChange={(e) => setLocationCountry(e.target.value)}
              placeholder="USA"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Latitude</label>
            <Input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="37.7749"
            />
          </div>
          <div>
            <label className="block font-semibold">Longitude</label>
            <Input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="-122.4194"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold">
            Price per Night (US dollar)
          </label>
          <Input
            type="number"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            placeholder="100"
            required
          />
        </div>
        <div>
          <label className="font-semibold hover:cursor-pointer">Photos</label>
          <Input
            className="hover:cursor-pointer hover:bg-secondary"
            type="file"
            multiple
            onChange={handlePhotoChange}
            accept="image/*"
          />
        </div>
        <div>
          <label className="block font-semibold">
            Exclude Dates (Optional)
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Select Date</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" onSelect={handleAddExcludedDate} />
            </PopoverContent>
          </Popover>
          <ul className="mt-2">
            {excludedDates.map((date, index) => (
              <li key={index}>{format(date, "PPP")}</li>
            ))}
          </ul>
        </div>
        <Button type="submit">Create Listing</Button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
