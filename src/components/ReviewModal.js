import React, { useState } from "react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { saveReview } from "@/services/user/api";
import { 
  Star,
  Loader2, 
  X, 
  MessageCircle, 
  Upload,
  UserCircle,
  Clock,
  Medal,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const StarRating = ({ stars, setStars }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map((value) => (
      // biome-ignore lint/a11y/useButtonType: <explanation>
<button
        key={value}
        onClick={() => setStars(value)}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <Star
          size={28}
          className={`${
            value <= stars
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-100 text-gray-300"
          } transition-colors`}
        />
      </button>
    ))}
    <span className="ml-2 text-sm text-gray-500">
      {stars > 0 ? `${stars} ดาว` : 'ยังไม่ได้ให้คะแนน'}
    </span>
  </div>
);

const ReviewForm = ({ place }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const mockUserProfile = {
    userId: "mock_user_123",
    displayName: "Mock User",
    pictureUrl: "/icons/avatar-vector-icon.jpg",
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 7;
    const maxFileSizeMB = 5;

    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`สามารถอัปโหลดได้สูงสุด ${maxFiles} รูป`);
      return;
    }

    if (files.some((file) => file.size > maxFileSizeMB * 1024 * 1024)) {
      toast.error(`ขนาดไฟล์ต้องไม่เกิน ${maxFileSizeMB} MB`);
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stars === 0 || !comment.trim()) {
      toast.error("กรุณาให้คะแนนและแสดงความคิดเห็น", {
        icon: <AlertCircle className="text-red-500" />
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", mockUserProfile.userId);
      formData.append("username", mockUserProfile.displayName);
      formData.append("tourism_entity_id", place.id);
      formData.append("rating", stars);
      formData.append("comment", comment);

      // biome-ignore lint/complexity/noForEach: <explanation>
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await saveReview(formData);
      toast.success("บันทึกรีวิวเรียบร้อยแล้ว", {
        icon: <CheckCircle2 className="text-green-500" />
      });
      setStars(0);
      setComment("");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("เกิดข้อผิดพลาด โปรดลองอีกครั้ง", {
        icon: <AlertCircle className="text-red-500" />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster />
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <Medal className="w-6 h-6" />
            เขียนรีวิว
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Profile Section */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="relative">
              <Image
                src={mockUserProfile.pictureUrl}
                alt="Profile"
                width={56}
                height={56}
                className="rounded-full ring-2 ring-orange-500 p-0.5"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">
                  {mockUserProfile.displayName}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">เขียนรีวิวเมื่อ {new Date().toLocaleDateString('th-TH')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Rating Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Medal className="w-5 h-5 text-orange-500" />
                ให้คะแนนความประทับใจ
              </label>
              <StarRating stars={stars} setStars={setStars} />
            </div>

            {/* Comment Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                แสดงความคิดเห็นของคุณ
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-shadow"
                placeholder="บอกเล่าประสบการณ์ของคุณ..."
              />
            </div>

            {/* Image Upload Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                เพิ่มรูปภาพ
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index} className="relative group aspect-square">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {selectedFiles.length < 7 && (
                  <label className="relative aspect-square cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-orange-500 transition-colors bg-white">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">เพิ่มรูป</span>
                    </div>
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">
                  อัปโหลดได้สูงสุด 7 รูป (ไม่เกิน 5MB ต่อรูป)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>บันทึกรีวิว</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;