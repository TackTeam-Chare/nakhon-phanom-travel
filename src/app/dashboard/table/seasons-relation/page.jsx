"use client"
import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getAllSeasonsRelations } from "@/services/admin/get"
import { deleteSeasonsRelations } from "@/services/admin/delete"
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter
} from "react-table"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import AddSeasonsRelationModal from "@/components/Dashboard/Modal/Add/AddSeasonsRelationModal"
import EditSeasonsRelationModal from "@/components/Dashboard/Modal/Edit/EditSeasonsRelationModal"

const SeasonsRelationIndexPage = () => {
  const [relations, setRelations] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRelationId, setSelectedRelationId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const result = await getAllSeasonsRelations()
        setRelations(result)
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลความสัมพันธ์")
      }
    }

    fetchRelations()
  }, [])

  const handleDelete = async id => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>คุณแน่ใจหรือไม่ว่าต้องการลบความสัมพันธ์นี้?</p>
          <button
            onClick={async () => {
              try {
                await deleteSeasonsRelations(id)
                setRelations(prevRelations =>
                  prevRelations.filter(relation => relation.id !== id)
                )
                toast.success("ลบความสัมพันธ์สำเร็จ!")
                closeToast()
              } catch (error) {
                console.error(
                  `เกิดข้อผิดพลาดในการลบความสัมพันธ์ที่มี ID ${id}:`,
                  error
                )
                toast.error(
                  "เกิดข้อผิดพลาดในการลบความสัมพันธ์ กรุณาลองอีกครั้ง"
                )
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 ease-in-out"
          >
            ใช่
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-600 text-white px-4 py-2 rounded-md ml-2 hover:bg-gray-700 transition duration-300 ease-in-out"
          >
            ไม่
          </button>
        </div>
      ),
      { closeButton: false }
    )
  }

  const handleEdit = id => {
    setSelectedRelationId(id)
    setIsEditModalOpen(true)
  }

  const columns = useMemo(
    () => [
      {
        Header: "รหัส",
        accessor: "id"
      },
      {
        Header: "ฤดูกาล",
        accessor: "season_name",
        Cell: ({ row }) => <span> {row.original.season_name}</span>
      },
      {
        Header: "หน่วยงานท่องเที่ยว",
        accessor: "tourism_entity_name",
        Cell: ({ row }) => (
          <span>{`ID: ${row.original.tourism_entities_id}, ชื่อ: ${row.original.tourism_entity_name}`}</span>
        )
      },
      {
        Header: "การกระทำ",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(row.original.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              แก้ไข
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 ease-in-out"
            >
              ลบ
            </button>
          </div>
        )
      }
    ],
    [router]
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    prepareRow,
    state,
    setGlobalFilter
  } = useTable(
    {
      columns,
      data: relations
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const { globalFilter, pageIndex } = state

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
          ตารางความสัมพันธ์ระหว่างฤดูกาล
        </h1>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 ease-in-out"
          >
            เพิ่มความสัมพันธ์ใหม่
          </button>
          <input
            value={globalFilter || ""}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="ค้นหา..."
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="overflow-x-auto">
          <table
            {...getTableProps()}
            className="min-w-full bg-white border border-gray-200"
          >
            <thead className="bg-gray-100">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={column.id}
                      className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider"
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row)
                return (
                  <tr
                    {...row.getRowProps()}
                    key={row.id}
                    className="hover:bg-gray-100 transition duration-300 ease-in-out"
                  >
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        key={cell.column.id}
                        className="px-6 py-4 whitespace-no-wrap border-b border-gray-200"
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            ก่อนหน้า
          </button>
          <span>
            หน้า{" "}
            <strong>
              {pageIndex + 1} จาก {pageOptions.length}
            </strong>
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            ถัดไป
          </button>
        </div>
        <ToastContainer />
      </div>

      {/* Modals */}
      <AddSeasonsRelationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      {selectedRelationId && (
        <EditSeasonsRelationModal
          id={selectedRelationId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}

export default SeasonsRelationIndexPage
