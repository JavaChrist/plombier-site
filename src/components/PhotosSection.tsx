import Image from "next/image";
import { Intervention } from "@/types";

interface PhotosSectionProps {
  intervention: Intervention;
  editing: boolean;
  onPhotoUpload: (files: FileList | null, type: 'avant' | 'apres') => Promise<void>;
  uploading: boolean;
}

export default function PhotosSection({
  intervention,
  editing,
  onPhotoUpload,
  uploading,
}: PhotosSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Photos</h3>
      
      {/* Photos avant */}
      <div>
        <h4 className="text-sm font-medium mb-2">Avant l&apos;intervention</h4>
        {editing && (
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onPhotoUpload(e.target.files, 'avant')}
            disabled={uploading}
            className="mb-2"
          />
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {intervention.photosAvant?.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt={`Photo avant l&apos;intervention ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-32 object-cover rounded"
            />
          ))}
        </div>
      </div>

      {/* Photos après */}
      <div>
        <h4 className="text-sm font-medium mb-2">Après l&apos;intervention</h4>
        {editing && (
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onPhotoUpload(e.target.files, 'apres')}
            disabled={uploading}
            className="mb-2"
          />
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {intervention.photosApres?.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt={`Photo après l&apos;intervention ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-32 object-cover rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}