"use client"
import React, { Fragment, useEffect, useState } from "react"
import Image from "next/image"
import { useForm, useFieldArray } from "react-hook-form"
import { Dialog, Transition } from "@headlessui/react"
import { createTouristEntity } from "@/services/admin/insert"
import { getDistricts, getCategories, getSeasons } from "@/services/admin/get"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTrash,
  faPlus,
  faMapMarkerAlt,
  faTags,
  faSnowflake,
  faGlobe,
  faUpload,
  faClock,
  faChevronDown,
  faChevronUp 
} from "@fortawesome/free-solid-svg-icons"
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons"
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons"
import { faImage } from "@fortawesome/free-regular-svg-icons"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

const CreatePlaceModal = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      operating_hours: [
        { day_of_week: "", opening_time: "", closing_time: "" }
      ],
      published: false,
      rating: 0
    }
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "operating_hours"
  })

  const [districts, setDistricts] = useState([])
  const [categories, setCategories] = useState([])
  const [seasons, setSeasons] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState({
    district: false,
    category: false,
    season: false,
    operatingHours: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [districtsData, categoriesData, seasonsData] = await Promise.all([
          getDistricts(),
          getCategories(),
          getSeasons()
        ])
        setDistricts(districtsData)
        setCategories(categoriesData)
        setSeasons(seasonsData)
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "ไม่สามารถโหลดข้อมูลได้",
          text: error.message
        })
      }
    }

    fetchData()
  }, [])

  
  const handleFileChange = event => {
    const files = Array.from(event.target.files || [])
    if (files.length > 10) {
      MySwal.fire({
        icon: "warning",
        title: "อัพโหลดสูงสุด 10 รูปภาพ",
        text: "คุณสามารถอัพโหลดภาพได้สูงสุด 10 ภาพเท่านั้น"
      })
      return
    }
    const filePreviews = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name
    }))
    setUploadedFiles(filePreviews)
  }

  const handleImageClick = url => {
    setSelectedImage(url)
  }

  const onSubmit = async data => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      for (const key of Object.keys(data)) {
        if (key === "image_paths" && data[key]) {
          const files = data[key]
          if (files instanceof FileList) {
            for (let i = 0; i < files.length; i++) {
              formData.append(key, files[i])
            }
          }
        } else if (key === "operating_hours") {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }

      const response = await createTouristEntity(formData)
      if (!response) {
        throw new Error("ไม่สามารถเพิ่มสถานที่ได้")
      }

      MySwal.fire({
        icon: "success",
        title: "เพิ่มสถานที่สำเร็จ!",
        showConfirmButton: false,
        timer: 1500
      })
      setTimeout(onClose, 2000)
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "ไม่สามารถเพิ่มสถานที่ได้",
        text: error.message
      })
    } finally {
      setSubmitting(false)
    }
  }


  const toggleDropdown = field => {
    setDropdownOpen(prevState => ({
      ...prevState,
      [field]: !prevState[field]
    }))
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    เพิ่มสถานที่
                  </Dialog.Title>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-4 space-y-6"
                  >
                    <div className="relative z-0 w-full mb-6 group">
                      <FontAwesomeIcon
                        icon={faGlobe}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        id="name"
                        {...register("name", {
                          required: "ชื่อสถานที่จำเป็นต้องระบุ"
                        })}
                        className="block py-2.5 px-10 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                        placeholder=" "
                      />
                      <label
                        htmlFor="name"
                        className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        ชื่อสถานที่
                      </label>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="relative z-0 w-full mb-6 group">
                      <FontAwesomeIcon
                        icon={faTags}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <textarea
                        id="description"
                        {...register("description")}
                        rows={3}
                        className="block py-2.5 px-10 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                        placeholder=" "
                      />
                      <label
                        htmlFor="description"
                        className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        คำอธิบายเกี่ยวกับสถานที่
                      </label>
                    </div>

                    <div className="relative z-0 w-full mb-6 group">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        id="location"
                        {...register("location")}
                        className="block py-2.5 px-10 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-black-600 peer"
                        placeholder=" "
                      />
                      <label
                        htmlFor="location"
                        className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                      >
                        ตำแหน่งที่ตั้ง
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="relative z-0 w-full group">
                        <input
                          type="text"
                          id="latitude"
                          {...register("latitude")}
                          className="block py-2.5 px-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                          placeholder=" "
                        />
                        <label
                          htmlFor="latitude"
                          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-3 -z-10 origin-[0] peer-focus:left-3 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          ละติจูด
                        </label>
                      </div>
                      <div className="relative z-0 w-full group">
                        <input
                          type="text"
                          id="longitude"
                          {...register("longitude")}
                          className="block py-2.5 px-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                          placeholder=" "
                        />
                        <label
                          htmlFor="longitude"
                          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-3 -z-10 origin-[0] peer-focus:left-3 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          ลองจิจูด
                        </label>
                      </div>
                    </div>
          {/* Dropdowns with icons for indicating expansion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="relative z-0 w-full group">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                        <select
                          id="district_name"
                          {...register("district_name")}
                          className="block py-2.5 px-10 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                          onClick={() => toggleDropdown("district")}
                        >
                          <option value="">เลือกอำเภอ</option>
                          {districts.map(district => (
                            <option key={district.id} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                        <FontAwesomeIcon
                          icon={
                            dropdownOpen.district ? faChevronUp : faChevronDown
                          }
                          className="absolute right-3 top-3 text-gray-400"
                        />
                        <label
                          htmlFor="district_name"
                          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          อำเภอ
                        </label>
                      </div>
                      <div className="relative z-0 w-full group">
                        <FontAwesomeIcon
                          icon={faTags}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                        <select
                          id="category_name"
                          {...register("category_name")}
                          className="block py-2.5 px-10 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                          onClick={() => toggleDropdown("category")}
                        >
                          <option value="">เลือกหมวดหมู่</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <FontAwesomeIcon
                          icon={
                            dropdownOpen.category ? faChevronUp : faChevronDown
                          }
                          className="absolute right-3 top-3 text-gray-400"
                        />
                        <label
                          htmlFor="category_name"
                          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          หมวดหมู่
                        </label>
                      </div>
                      <div className="relative z-0 w-full group">
                        <FontAwesomeIcon
                          icon={faSnowflake}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                        <select
                          id="season_id"
                          {...register("season_id")}
                          className="block py-2.5 px-10 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
                          onClick={() => toggleDropdown("season")}
                        >
                          <option value="">เลือกฤดู</option>
                          {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                              {season.name}
                            </option>
                          ))}
                        </select>
                        <FontAwesomeIcon
                          icon={
                            dropdownOpen.season ? faChevronUp : faChevronDown
                          }
                          className="absolute right-3 top-3 text-gray-400"
                        />
                        <label
                          htmlFor="season_id"
                          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shwn:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          ฤดู
                        </label>
                      </div>
                    </div>

                    <div className="relative z-0 w-full mb-6 group">
  <label
    htmlFor="operating_hours"
    className="block text-sm font-medium text-gray-700"
  >
    เวลาทำการ
  </label>
  {fields.map((item, index) => (
    <div key={item.id} className="grid grid-cols-4 gap-4 mb-6 items-center">
      <div className="relative w-full">
        <select
          {...register(`operating_hours.${index}.day_of_week`)}
          onClick={() => toggleDropdown("operatingHours")}
          className="block py-2 px-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
        >
          <option value="">วันในสัปดาห์</option>
          <option value="Sunday">วันอาทิตย์</option>
          <option value="Monday">วันจันทร์</option>
          <option value="Tuesday">วันอังคาร</option>
          <option value="Wednesday">วันพุธ</option>
          <option value="Thursday">วันพฤหัสบดี</option>
          <option value="Friday">วันศุกร์</option>
          <option value="Saturday">วันเสาร์</option>
          <option value="Everyday">ทุกวัน</option>
          <option value="ExceptHolidays">ยกเว้นวันหยุดนักขัตฤกษ์</option>
        </select>
        <FontAwesomeIcon
          icon={dropdownOpen.operatingHours ? faChevronUp : faChevronDown}
          className="absolute right-3 top-3 text-gray-400 pointer-events-none"
        />
      </div>
      <div className="relative mt-2">
        <FontAwesomeIcon
          icon={faClock}
          className="absolute left-3 top-3 text-gray-400"
        />
        <input
          type="time"
          {...register(`operating_hours.${index}.opening_time`)}
          className="block py-2 pl-10 pr-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
        />
        <label
          htmlFor={`operating_hours.${index}.opening_time`}
          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          เวลาเปิด
        </label>
      </div>
      <div className="relative mt-2">
        <FontAwesomeIcon
          icon={faClock}
          className="absolute left-3 top-3 text-gray-400"
        />
        <input
          type="time"
          {...register(`operating_hours.${index}.closing_time`)}
          className="block py-2 pl-10 pr-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer"
        />
        <label
          htmlFor={`operating_hours.${index}.closing_time`}
          className="absolute text-sm text-gray-500 bg-white px-1 transform duration-300 -translate-y-6 scale-75 top-0 left-10 -z-10 origin-[0] peer-focus:left-10 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-6"
        >
          เวลาปิด
        </label>
      </div>
      <button
        type="button"
        onClick={() => remove(index)}
        className="text-red-500 hover:text-red-700 focus:outline-none"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={() =>
      append({
        day_of_week: "",
        opening_time: "",
        closing_time: ""
      })
    }
    className="col-span-3 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
  >
    <FontAwesomeIcon icon={faPlus} className="mr-2" />
    เพิ่มเวลาทำการ
  </button>
</div>

                    <div className="relative z-0 w-full mb-6 group">
                      <label
                        htmlFor="image_paths"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        รูปภาพสถานที่
                      </label>
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                          <FontAwesomeIcon
                            icon={faImage}
                            className="mx-auto h-12 w-12 text-gray-300"
                          />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              <span>อัปโหลดไฟล์</span>
                              <input
                                id="file-upload"
                                type="file"
                                multiple
                                className="sr-only"
                                {...register("image_paths", {
                                  onChange: handleFileChange
                                })}
                              />
                            </label>
                            <p className="pl-1">หรือลากและวาง</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            PNG, JPG, GIF สูงสุด 10MB
                          </p>
                          <p className="text-xs leading-5 text-red-600">
                            คุณสามารถอัพโหลดภาพได้ไม่เกิน 10 ภาพ
                          </p>
                        </div>
                      </div>
                      {/* Display uploaded files with click-to-view functionality */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-medium text-gray-700">
                            ไฟล์ที่อัปโหลด:
                          </h3>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="relative">
                                <Image
                                  src={file.previewUrl}
                                  alt={`Uploaded ${index}`}
                                  className="object-cover w-full h-32 rounded-md cursor-pointer"
                                  onClick={() =>
                                    handleImageClick(file.previewUrl)
                                  }
                                  layout="responsive"
                                  width={300}
                                  height={200}
                                  objectFit="cover"
                                />
                                <p className="text-xs text-center mt-2">
                                  {file.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image Preview Modal */}
                    {selectedImage && (
                      <Transition appear show={!!selectedImage} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-50"
                          onClose={() => setSelectedImage(null)}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
                          </Transition.Child>

                          <div className="fixed inset-0 flex items-center justify-center p-4">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto overflow-auto">
                              {/* Responsive Image */}
                              <Image
                                src={selectedImage}
                                alt="Preview"
                                className="object-contain w-full h-auto max-h-[80vh] rounded-md"
                                layout="responsive"
                                width={300}
                                height={200}
                                objectFit="cover"
                              />
                              <button
                                onClick={() => setSelectedImage(null)}
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
                              >
                                ปิด
                              </button>
                            </div>
                          </div>
                        </Dialog>
                      </Transition>
                    )}
    
                    <div className="relative z-0 w-full mb-6 group">
                      <div className="flex items-center mb-6">
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="mr-2 text-gray-500"
                        />
                        <input
                          type="checkbox"
                          id="published"
                          {...register("published")}
                          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <label
                          htmlFor="published"
                          className="ml-2 block text-sm leading-5 text-gray-900"
                        >
                          เผยแพร่
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        onClick={onClose}
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />{" "}
                        {/* Replace `faTrash` with a relevant icon for cancel, e.g., `faTimes` */}
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        disabled={submitting}
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {submitting ? "กำลังเพิ่ม..." : "เพิ่มสถานที่"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <ToastContainer />
    </>
  )
}

export default CreatePlaceModal
