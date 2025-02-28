"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");

  const openModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc("");
  };

  return (
    <div className=" min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-orange-50 rounded-3xl shadow-xl p-8 max-w-3xl w-full border border-orange-200">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text mb-10 text-center">
          เกี่ยวกับเรา
        </h1>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">ชื่อเว็บ</h2>
          <p className="text-gray-700 mb-2 ">
            <span className="font-semibold">ภาษาไทย:</span> เว็บแอปพลิเคชันแนะนำการท่องเที่ยวและร้านค้าในบริเวณใกล้เคียง
            สถานที่ท่องเที่ยวในจังหวัดนครพนม
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">ภาษาอังกฤษ:</span> Web Application Recommends Travel And Shops In Nearby Tourist Attractions In Nakhon Phanom Province
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">พัฒนาโดย</h2>
          <div className="flex items-center mb-6">
            <Image
              src="/profile/developer-avatar.jpg"
              alt="Developer Avatar"
              width={80}
              height={80}
              className="rounded-full mr-6 shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => openModal("/profile/developer-avatar.jpg")}
            />
            <div>
              <p className="text-lg font-bold text-gray-800">นายจเร อุปชิตวาน</p>
              <p className="text-gray-700">หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์</p>
              <p className="text-gray-700">คณะวิทยาศาสตร์และวิศวกรรมศาสตร์, มหาวิทยาลัยเกษตรศาสตร์</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg p-4 border-l-4 border-orange-600 text-orange-700">
            ระบบนี้เป็นส่วนหนึ่งของวิชา <strong>Computer Science Project</strong>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">อาจารย์ที่ปรึกษา</h2>
          <div className="flex items-center">
            <Image
              src="/profile/advisor-avatar.png"
              alt="Advisor Avatar"
              width={80}
              height={80}
              className="rounded-full mr-6 shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => openModal("/profile/advisor-avatar.png")}
            />
            <p className="text-lg font-bold text-gray-800">ผู้ช่วยศาสตราจารย์วไลลักษณ์ วงษ์รื่น</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-orange-600 mb-4">ติดต่อผู้พัฒนา</h2>
          <p className="text-gray-700">
            อีเมล: {" "}
            <Link
              href="mailto:tackteam.dev@gmail.com"
              className="text-orange-600 hover:text-orange-700 hover:underline transition-all"
            >
              tackteam.dev@gmail.com
            </Link>
          </p>
        </section>

        <section className="bg-orange-100 rounded-lg p-6 border-l-4 border-orange-600">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">หมายเหตุ</h2>
          <p className="text-gray-700">
            ภาพในระบบนี้มีบางส่วนที่ถูกนำมาจากเว็บไซต์ต่าง ๆ โดยมีวัตถุประสงค์เพื่อการจัดทำโครงงานเพื่อการศึกษาเท่านั้น
            โดยผู้พัฒนาได้ใส่ข้อมูลอ้างอิงจากแหล่งข้อมูลภาพไว้เรียบร้อยแล้ว
          </p>
        </section>
      </div>

      {isModalOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
<div
            className="relative bg-white p-4 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={modalImageSrc}
              alt="Enlarged Avatar"
              width={500}
              height={500}
              className="max-w-full max-h-full rounded-lg"
            />
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-800 text-2xl bg-gray-200 rounded-full px-2 hover:bg-gray-300 transition-transform transform hover:scale-110"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
