import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Camera, MapPin, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ProofUploadModalProps {
  task: Record<string, any>;
  onClose: () => void;
}

export function ProofUploadModal({ task, onClose }: ProofUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.tasks.generateUploadUrl);
  const submitProof = useMutation(api.tasks.submitProof);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location captured!");
        },
        (error) => {
          toast.error("Could not get location");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Step 3: Submit proof
      await submitProof({
        taskId: task._id,
        storageId,
        gps: gpsLocation || undefined,
      });

      toast.success("Proof submitted successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit proof");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Submit Proof of Work</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Task Info */}
          <div className="bg-slate-50 rounded-lg p-3">
            <h3 className="font-medium text-slate-900">{task.title}</h3>
            <p className="text-sm text-slate-600">{task.project} - {task.unit}</p>
            <p className="text-sm font-medium text-green-600">${task.amount.toLocaleString()}</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected proof"
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="absolute top-2 right-2 bg-white shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Another Photo
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-dashed border-2 border-slate-300 hover:border-slate-400"
              >
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">Tap to take photo</p>
                </div>
              </Button>
            )}
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location (Optional)
            </label>
            {gpsLocation ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Location captured: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={getLocation}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Capture Current Location
              </Button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Proof
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
