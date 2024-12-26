import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Image from 'next/image'
import {
  CheckCircle2,
  XCircle,
  Star,
  ClipboardCheck,
  Loader2,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { saveReview } from "@/services/user/api";
import { Toaster, toast } from "react-hot-toast";
import liff from "@line/liff";
import { getUserProfile } from "@/utils/auth";
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const StatusToggle = ({ status, onStatusChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => onStatusChange("pass")}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 
        ${
          status === "pass"
            ? "bg-emerald-600 text-white shadow-md"
            : "bg-emerald-100 text-emerald-600 border border-emerald-300 hover:bg-emerald-200"
        }`}
    >
      <CheckCircle2 className="w-5 h-5" />
      <span>ผ่าน</span>
    </button>
    <button
      type="button"
      onClick={() => onStatusChange("fail")}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 
        ${
          status === "fail"
            ? "bg-red-600 text-white shadow-md"
            : "bg-red-100 text-red-600 border border-red-300 hover:bg-red-200"
        }`}
    >
      <XCircle className="w-5 h-5" />
      <span>ไม่ผ่าน</span>
    </button>
  </div>
);

const StarRating = ({ stars, setStars }) => (
  <div className="grid grid-cols-5 gap-2 justify-items-center">
    {[1, 2, 3, 4, 5].map((starValue) => (
      <Star
        key={starValue}
        className={`cursor-pointer w-6 h-6 sm:w-8 sm:h-8 ${
          starValue <= stars ? "text-green-700" : "text-gray-300"
        } transition-colors duration-200 hover:text-green-500`}
        onClick={() => setStars(starValue)}
      />
    ))}
  </div>
);

const ReviewModal = ({ isOpen, onClose, place }) => {
  const [reviewStatus, setReviewStatus] = useState(null);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
    
  const [selectedFiles, setSelectedFiles] = useState([]); 
  useEffect(() => {
    if (place) {
      setReviewStatus(null);
      setStars(0);
      setComment("");
      setSelectedFiles([]); 
    }
  }, [place]);

  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const fetchProfile = async () => {
          try {
            const profile = await getUserProfile();
            setUserProfile(profile);
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
          }
        };
        fetchProfile();
      }
    }, []);
    
    useEffect(() => {
      const hideLiffAlert = () => {
          const alertElement = document.querySelector(".liff-alert-class");
          if (alertElement) {
              alertElement.style.display = "none"; // ซ่อนข้อความ
          }
      };
  
      hideLiffAlert();
  
      // รอให้ DOM โหลดเสร็จและลองซ่อนอีกครั้ง
      const timeout = setTimeout(hideLiffAlert, 1000);
  
      return () => clearTimeout(timeout); // Cleanup
  }, []);

  const fetchUserProfile = async () => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    } else {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const profile = await liff.getProfile();
          setUserProfile(profile);
          localStorage.setItem("userProfile", JSON.stringify(profile));
        }
      } catch (error) {
        console.error("LINE Login Error:", error);
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 10;
    const maxFileSizeMB = 5;
  
    // ตรวจสอบจำนวนไฟล์
    if (files.length > maxFiles) {
      toast.error(`ไม่สามารถอัปโหลดไฟล์ได้เกิน ${maxFiles} ไฟล์`);
      return;
    }
  
    // ตรวจสอบขนาดไฟล์
    const oversizedFiles = files.filter((file) => file.size > maxFileSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`ไฟล์ที่อัปโหลดต้องมีขนาดไม่เกิน ${maxFileSizeMB} MB ต่อไฟล์`);
      return;
    }
  
    setSelectedFiles(files);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!reviewStatus || stars === 0 || !comment) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", userProfile.userId);
      formData.append("username", userProfile.displayName);
      formData.append("tourism_entity_id", place.id);
      formData.append("rating", stars);
      formData.append("comment", comment);
      formData.append("status", reviewStatus);
      // biome-ignore lint/complexity/noForEach: <explanation>
      selectedFiles.forEach((file) => formData.append("images", file));

      await addReview(formData);
      toast.success("รีวิวถูกบันทึกเรียบร้อยแล้ว!");
      onClose();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด! โปรดลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <>
   <Toaster position="top-center" />
      <Modal isOpen={isOpen} onRequestClose={onClose} className="p-4">
        <h2 className="text-lg font-bold mb-4">รีวิวสถานที่</h2>

        <div>
          {userProfile && (
            <div className="flex items-center mb-4">
              <Image
                src={userProfile.pictureUrl}
                alt="User"
                width={50}
                height={50}
                className="rounded-full"
              />
              <p className="ml-2">{userProfile.displayName}</p>
            </div>
          )}
          <StatusToggle status={reviewStatus} onStatusChange={setReviewStatus} />
          <StarRating stars={stars} setStars={setStars} />
          <textarea
            placeholder="กรอกความคิดเห็น..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded-lg mt-2"
          />
          <input type="file" multiple onChange={handleFileChange} className="mt-2" />

          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-500 text-white w-full p-2 mt-4 rounded-lg"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกรีวิว"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ReviewModal;