"use client"
import { useState } from 'react';

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  const openModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc('');
  };

  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-500 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-6 text-center">เกี่ยวกับ</h1>
        
        {/* Web Application Description */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-2">ชื่อเว็บ</h2>
          <p className="text-gray-700 mb-2">
            <span className="text-gray-900 font-semibold">ภาษาไทย:</span> เว็บแอปพลิเคชันแนะนำการท่องเที่ยวและร้านค้าในบริเวณใกล้เคียง สถานที่ท่องเที่ยวในจังหวัดนครพนม
          </p>
          <p className="text-gray-700">
            <span className="text-gray-900 font-semibold">ภาษาอังกฤษ:</span> Web Application Recommends Travel And Shops In Nearby Tourist Attractions In Nakhon Phanom Province
          </p>
        </section>
        
        {/* Developer Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">พัฒนาโดย</h2>
          <div className="flex items-center mb-4">
            <img
              src="/profile/developer-avatar.jpg"
              alt="Developer Avatar"
              className="w-16 h-16 rounded-full mr-4 shadow-md cursor-pointer"
              onClick={() => openModal('/profile/developer-avatar.jpg')}
            />
            <div>
              <p className="text-gray-800 font-medium text-lg">นายจเร อุปชิตวาน</p>
              <p className="text-gray-700">
                หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์
              </p>
              <p className="text-gray-700">
                คณะวิทยาศาสตร์และวิศวกรรมศาสตร์, มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร
              </p>
            </div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 border-l-4 border-orange-600 text-orange-600">
            ระบบนี้เป็นส่วนหนึ่งของวิชา <strong>Computer Science Project</strong>
          </div>
        </section>
        
        {/* Advisor Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">อาจารย์ที่ปรึกษา</h2>
          <div className="flex items-center">
            <img
              src="/profile/advisor-avatar.png"
              alt="Advisor Avatar"
              className="w-16 h-16 rounded-full mr-4 shadow-md cursor-pointer"
              onClick={() => openModal('/profile/advisor-avatar.png')}
            />
            <p className="text-gray-800 font-medium text-lg">ผู้ช่วยศาสตราจารย์วไลลักษณ์ วงษ์รื่น</p>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-2">ติดต่อผู้พัฒนา</h2>
          <p className="text-gray-900">
            อีเมล์: <a href="mailto:tackteam.dev@gmail.com" className="text-orange-600 hover:underline">tackteam.dev@gmail.com</a>
          </p>
        </section>
        
        {/* Note */}
        <section className="mb-4">
          <h2 className="text-2xl font-bold text-orange-600 mb-2">หมายเหตุ</h2>
          <p className="text-gray-700">
            ภาพในระบบนี้มีบางส่วนที่ถูกนำมาจากเว็บไซต์ต่าง ๆ โดยมีวัตถุประสงค์เพื่อการจัดทำโครงงานเพื่อการศึกษาเท่านั้น โดยผู้พัฒนาได้ใส่ข้อมูลอ้างอิงจากแหล่งข้อมูลภาพไว้เรียบร้อยแล้ว
          </p>
        </section>
      </div>

      {/* Modal for Enlarged Image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img src={modalImageSrc} alt="Enlarged Avatar" className="max-w-full max-h-full rounded-lg shadow-lg" />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-2xl bg-gray-800 rounded-full px-2"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
