"use client"

import React from "react"
import {
  FaFacebook,
  FaEnvelope,
  FaUser
} from "react-icons/fa"
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-orange-500 text-white py-10 ">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo and Description */}
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-4">นครพนม</h1>
          <p className="text-lg">
            เว็บแอปพลิเคชันแนะนำการท่องเที่ยวและร้านค้าในบริเวณใกล้เคียง
            สถานที่ท่องเที่ยวในจังหวัดนครพนม
          </p>
          <p className="text-lg">
            Web Application Recommends Travel And Shops In Nearby Tourist
            Attractions In Nakhon Phanom Province
          </p>
        </div>

        {/* Attribution Section */}
        <div className="text-center md:text-right">
          <h2 className="text-xl font-semibold mb-2">จัดทำโดย</h2>
          <p className="mb-2 flex items-center justify-center md:justify-end">
            <FaUser className="mr-2" />
            Chare Auppachitwan
          </p>
          <p className="mb-4 flex items-center justify-center md:justify-end">
            <FaEnvelope className="mr-2" />
            <span>tackteam.dev@gmail.com</span>
          </p>
          <div className="flex justify-center md:justify-end space-x-4">
            <Link
              href="https://www.facebook.com/chare.uppachittan"
              className="text-2xl hover:text-gray-200 transition duration-300"
            >
              <FaFacebook />
            </Link>

          </div>
        </div>
      </div>
    </footer>
  )
}
