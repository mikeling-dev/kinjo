"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface Listing {
  id: number;
  title: string;
  entireUnit: boolean;
  room: number;
  washroom: number;
  capacity: number;
  description: string | null;
  locationState: string | null;
  locationCountry: string | null;
  latitude: number | null;
  longitude: number | null;
  pricePerNight: number;
  isAlwaysAvailable: boolean;
  photos: { id: number; photoUrl: string }[];
  availabilities: { id: number; startDate: string; endDate: string }[];
}

const SortablePhoto = ({
  photo,
}: {
  photo: { id: number; photoUrl: string };
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center p-2 w-fit mb-2"
    >
      <Image
        src={photo.photoUrl}
        height={200}
        width={200}
        alt="Listing photo"
        className="w-24 h-24 object-cover rounded-lg"
      />
    </Card>
  );
};

export default function ListingDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<{ id: number; photoUrl: string }[]>([]);
  const [excludedDates, setExcludedDates] = useState<Date[]>([]);

  // Define sensors outside render
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require a small movement to start dragging
      },
    })
  );

  useEffect(() => {
    if (!user) return;
    fetch(`/api/host/listing?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listing");
        return res.json();
      })
      .then((data: Listing) => {
        console.log("Fetched photos:", data.photos);
        setListing(data);
        setPhotos(data.photos);
        setExcludedDates(data.availabilities.map((a) => new Date(a.startDate)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user, id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("photos", JSON.stringify(photos));
    formData.append(
      "excludedDates",
      JSON.stringify(excludedDates.map((d) => d.toISOString()))
    );

    try {
      const res = await fetch(`/api/host/listing?id=${id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        alert("Listing updated successfully!");
        router.push("/host");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update listing");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/host/listing?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Listing deleted successfully!");
        router.push("/host");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete listing");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      const newPhotos = arrayMove(photos, oldIndex, newIndex);
      setPhotos(newPhotos);
    }
  };

  const handleAddExcludedDate = (date: Date | undefined) => {
    if (
      date &&
      !excludedDates.some((d) => d.toDateString() === date.toDateString())
    ) {
      setExcludedDates([...excludedDates, date]);
    }
  };

  if (!user)
    return <div className="p-4">Please log in to access this page.</div>;
  if (loading) return <div className="p-4">Loading...</div>;
  if (!listing) return <div className="p-4">Listing not found.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Listing: {listing.title}</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <Input name="title" defaultValue={listing.title} required />
        </div>
        <div>
          <label className="flex items-center font-semibold">
            <Checkbox name="entireUnit" defaultChecked={listing.entireUnit} />
            <span className="ml-2">Entire Unit</span>
          </label>
        </div>
        <div>
          <label className="block font-semibold">Rooms</label>
          <Input
            name="room"
            type="number"
            defaultValue={listing.room}
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Washrooms</label>
          <Input
            name="washroom"
            type="number"
            defaultValue={listing.washroom}
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Capacity (Guests)</label>
          <Input
            name="capacity"
            type="number"
            defaultValue={listing.capacity}
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <Textarea
            name="description"
            defaultValue={listing.description || ""}
          />
        </div>
        <div>
          <label className="block font-semibold">Location State</label>
          <Input
            name="locationState"
            defaultValue={listing.locationState || ""}
          />
        </div>
        <div>
          <label className="block font-semibold">Location Country</label>
          <Input
            name="locationCountry"
            defaultValue={listing.locationCountry || ""}
          />
        </div>
        <div>
          <label className="block font-semibold">Latitude</label>
          <Input
            name="latitude"
            type="number"
            step="any"
            defaultValue={listing.latitude || ""}
          />
        </div>
        <div>
          <label className="block font-semibold">Longitude</label>
          <Input
            name="longitude"
            type="number"
            step="any"
            defaultValue={listing.longitude || ""}
          />
        </div>
        <div>
          <label className="block font-semibold">Price per Night</label>
          <Input
            name="pricePerNight"
            type="number"
            defaultValue={listing.pricePerNight}
            required
          />
        </div>
        <div>
          <label className="block font-semibold">
            Photos (Drag to reorder)
          </label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <Card className="flex flex-col p-2 justify-center items-center">
                {photos.map((photo) => (
                  <SortablePhoto key={photo.id} photo={photo} />
                ))}
              </Card>
            </SortableContext>
          </DndContext>
        </div>
        <div>
          <label className="block font-semibold">Exclude Dates</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Add Excluded Date</Button>
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
        <Button type="submit">Update Listing</Button>
      </form>
      <Button variant="destructive" onClick={handleDelete} className="mt-4">
        Delete Listing
      </Button>
    </div>
  );
}
