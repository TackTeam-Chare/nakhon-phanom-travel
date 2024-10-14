"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getDistricts } from "@/services/admin/get";
import { deleteDistrict } from "@/services/admin/delete";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter
} from "react-table";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import AddDistrictModal from "@/components/Dashboard/Modal/Add/AddDistrictModal";
import EditDistrictModal from "@/components/Dashboard/Modal/Edit/EditDistrictModal";

const MySwal = withReactContent(Swal);

const DistrictsPage = () => {
  const [districts, setDistricts] = useState([]); // List of districts
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For add modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For edit modal visibility
  const [selectedDistrict, setSelectedDistrict] = useState(null); // To store the selected district for editing

  // Function to fetch districts from the backend
  const fetchDistricts = async () => {
    try {
      const result = await getDistricts();
      setDistricts(result);
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลอำเภอได้"
      });
    }
  };

  // Fetch districts on component mount
  useEffect(() => {
    fetchDistricts();
  }, []);

  // Handle deletion of a district
  const handleDelete = async (id) => {
    MySwal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบอำเภอนี้ใช่ไหม?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDistrict(id);
          setDistricts((prevDistricts) =>
            prevDistricts.filter((district) => district.id !== id)
          );
          MySwal.fire("ลบสำเร็จ!", "อำเภอได้ถูกลบออกแล้ว.", "success");
        } catch (error) {
          MySwal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลบอำเภอได้ กรุณาลองอีกครั้ง",
          });
        }
      }
    });
  };

  // Open and close modals
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (district) => {
    setSelectedDistrict(district);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDistrict(null);
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        Header: "รหัส",
        accessor: "id",
      },
      {
        Header: "ชื่อ",
        accessor: "name",
      },
      {
        Header: "การจัดการข้อมูล",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openEditModal(row.original)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out flex items-center"
            >
              <FaEdit className="mr-1" />
              แก้ไข
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 ease-in-out flex items-center"
            >
              <FaTrash className="mr-1" />
              ลบ
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // React Table setup
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
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: districts,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex } = state;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
          จัดการอำเภอ
        </h1>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 ease-in-out flex items-center"
          >
            <FaPlus className="mr-2" /> เพิ่มอำเภอใหม่
          </button>
          <div className="flex items-center border border-gray-300 rounded-md p-2">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              value={globalFilter || ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="ค้นหา..."
              className="outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table
            {...getTableProps()}
            className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md"
          >
            <thead className="bg-gray-100">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
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
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={row.id}
                    className="hover:bg-gray-100 transition duration-300 ease-in-out"
                  >
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        key={cell.column.id}
                        className="px-6 py-4 whitespace-no-wrap border-b border-gray-200"
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> ก่อนหน้า
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
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
          >
            ถัดไป <FaArrowRight className="ml-2" />
          </button>
        </div>

        {/* Add District Modal */}
        {isAddModalOpen && (
          <AddDistrictModal isOpen={isAddModalOpen} onClose={closeAddModal} onDistrictAdded={fetchDistricts} />
        )}

        {/* Edit District Modal */}
        {isEditModalOpen && selectedDistrict && (
          <EditDistrictModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            district={selectedDistrict}
            onDistrictUpdated={fetchDistricts}
          />
        )}
      </div>
    </div>
  );
};

export default DistrictsPage;
