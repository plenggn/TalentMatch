"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useSession } from "next-auth/react";

interface Applicant {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  gender: string;
  experience: string;
  position: string;
  matchingScore: number;
  status: "Applied" | "Shortlisted" | "Interviewed" | "Offered";
  stage: "Applied" | "Shortlisted" | "Interviewed" | "Offered";
  date: string; 
}

export default function Dashboard() {
  const { data: session } = useSession(); // ✅ ดึงข้อมูล session จาก NextAuth
  const userName = session?.user?.name || "Guest"; // ✅ ถ้ามีชื่อจาก Google ใช้เลย
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [filters, setFilters] = useState({
    gender: "All",
    experience: "All",
    position: "All",
  });
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [openPositions, setOpenPositions] = useState<number>(0); 
  const [positionsOptions, setPositionsOptions] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ [FIX HYDRATION] สร้าง State สำหรับเก็บวันที่ (เริ่มจาก null)
  const [clientFormattedDate, setClientFormattedDate] = useState<string | null>(null);

  // ฟังก์ชันช่วยหา start of week
  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const newApplicantsThisWeek = useMemo(() => {
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date();
  return allApplicants.filter((a) => {
    if (!a.date) return false;
    const applicantDate = new Date(a.date);
    return applicantDate >= startOfWeek && applicantDate <= endOfWeek;
  }).length;
}, [allApplicants]);

  // Fetch applicants และ positions dynamic
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    // Fetch applicants
    const { data: applicantsData, error: applicantsError } = await supabase
      .from("applicants")
      .select("*");

    if (applicantsError) {
      console.error("Error fetching applicants:", applicantsError);
      setAllApplicants([]);
      setPositionsOptions(["All"]);
    } else {
      const applicants = (applicantsData as any[]).map((a) => ({
        id: a.id,
        empId: a.emp_id,
        firstName: a.firstName,
        lastName: a.lastName,
        gender: a.gender,
        experience: a.experience,
        position: a.position,
        matchingScore: a.matching_score,
        status: a.status ? a.status.trim().toLowerCase() : "applied",
        stage: a.stage ? a.stage.trim().toLowerCase() : "applied",
        date: a.created_at,
      }));
      setAllApplicants(applicants);

      const uniquePositions = Array.from(
        new Set(applicants.map((a) => a.position).filter(Boolean))
      );
      setPositionsOptions(["All", ...uniquePositions]);
    }
     
  // ✅ Fetch job_descriptions และนับจำนวนทั้งหมด
const { data: jobs, error: jobsFetchError } = await supabase
  .from("job_descriptions")
  .select("*");

if (jobsFetchError) {
  console.error("Error fetching jobs:", jobsFetchError);
  setOpenPositions(0);
} else {
  //แค่ให้นับจำนวนแถวทั้งหมดใน job_descriptions
  setOpenPositions(jobs?.length ?? 0);

  //เอา title มารวมกับ position ของ applicants
  const jobPositions = Array.from(
    new Set(jobs.map((job) => job.title).filter(Boolean))
  );

  const applicantPositions = positionsOptions.filter((p) => p !== "All");
  const allPositions = Array.from(new Set([...applicantPositions, ...jobPositions]));

  setPositionsOptions(["All", ...allPositions]);
}

    setLoading(false);
  };

  fetchData();
}, []);

  // ✅ [FIX HYDRATION] ย้ายการคำนวณวันที่มาไว้ใน useEffect
  // โค้ดนี้จะรันเฉพาะที่ Client เท่านั้น ทำให้ไม่เกิด Mismatch กับ Server
  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setClientFormattedDate(formatted);
  }, []); // [] = รันแค่ครั้งเดียวหลังจากหน้าเว็บโหลดเสร็จ


  const FILTER_OPTIONS = {
    genders: ["All", "Male", "Female"],
    experiences: ["All", "1-9", "10+"],
    positions: positionsOptions,
  };

  const handleStageClick = (stage: string) =>
    setSelectedStage(selectedStage === stage ? "all" : stage);

  const handleFilterChange = (filterName: string, value: string) =>
    setFilters((prev) => ({ ...prev, [filterName]: value }));

  const clearAllFilters = () => {
    setFilters({ gender: "All", experience: "All", position: "All" });
    setSelectedStage("all");
  };
  
  const hasActiveFilters =
    filters.gender !== "All" ||
    filters.experience !== "All" ||
    filters.position !== "All";

  // Filtered applicants ตาม Filter & Stage
  const filteredApplicants = useMemo(() => {
  return allApplicants.filter((a) => {
    let stageMatch =
      selectedStage === "all" || a.stage?.toLowerCase() === selectedStage;
    let genderMatch = filters.gender === "All" || a.gender === filters.gender;

    let expMatch = true;
    if (filters.experience !== "All") {
      if (filters.experience === "10+") expMatch = Number(a.experience) >= 10;
      else expMatch = Number(a.experience) <= 9 && Number(a.experience) >= 1;
    }

    let posMatch = filters.position === "All" || a.position === filters.position;

    return stageMatch && genderMatch && expMatch && posMatch;
  });
}, [allApplicants, selectedStage, filters]);

  // Stage Counts ใช้ allApplicants ไม่สน filter
  const statusCounts = useMemo(
  () => ({
    applied: allApplicants.filter((a) => a.status?.toLowerCase() === "applied").length,
    shortlisted: allApplicants.filter((a) => a.status?.toLowerCase() === "shortlisted").length,
    interview: allApplicants.filter((a) => a.status?.toLowerCase() === "interviewed").length,
    offer: allApplicants.filter((a) => a.status?.toLowerCase() === "offered").length,
  }),
  [allApplicants]
);

  // Applicants แยก Status สำหรับ Table
const statusApplicants = useMemo(() => ({
  applied: allApplicants.filter((a) => a.status?.toLowerCase() === "applied"),
  shortlisted: allApplicants.filter((a) => a.status?.toLowerCase() === "shortlisted"),
  interview: allApplicants.filter((a) => a.status?.toLowerCase() === "interviewed"),
  offer: allApplicants.filter((a) => a.status?.toLowerCase() === "offered"),
}), [allApplicants]);

  // ⛔️ [FIX HYDRATION] ย้ายโค้ดส่วนนี้ไปไว้ใน useEffect ด้านบนแล้ว
  // const today = new Date();
  // const formattedDate = today.toLocaleDateString("en-GB", {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long",
  //   year: "numeric",
  // });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
  case "applied": return "text-gray-700";
  case "shortlisted": return "text-blue-600";
  case "interview": return "text-purple-600";
  case "offer": return "text-green-600";
  default: return "text-gray-500";
} 
  };

  //แปลงวันที่จาก Supabase ให้อ่านง่าย
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  const renderTable = (
    data: Applicant[],
    title: string,
    colorClass: string,
    stage: string
  ) => (
    <div
      className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl ${
        selectedStage === "all" || selectedStage === stage
          ? "opacity-100 scale-100"
          : "opacity-60 scale-[0.99]"
      }`}
    >
      <h3 className={`text-lg font-bold ${colorClass} mb-4`}>{title}</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500">
              S/N
            </th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500">
              Candidate Name
            </th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500">
              Date
            </th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, idx) => (
              <tr
                key={item.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } border-b border-gray-100 hover:bg-indigo-50/60 transition-all`}
              >
                <td className="py-3 px-2 text-sm text-gray-900">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="py-3 px-2 text-sm text-gray-900">
                  {item.firstName} {item.lastName}
                </td>
                <td className="py-3 px-2 text-sm text-gray-900">
                      {formatDateTime(item.date)}
                </td>

                <td
                  className={`py-3 px-2 text-sm font-semibold ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="py-6 px-2 text-sm text-gray-500 text-center"
              >
                {loading ? "Loading applicants..." : "No applicants in this stage"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="max-w-7xl mx-auto px-12 py-10">
      {/* Welcome */}
      <div className="flex flex-col gap-3 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome, {userName.split(" ")[0]} 
    </h1>

        <div className="inline-block w-fit px-5 py-2 text-blue-700 border border-blue-600 bg-blue-50 rounded-lg font-medium shadow-sm">
          {/* ✅ [FIX HYDRATION] ใช้ค่าจาก State (ถ้ายังไม่มีค่า ให้แสดง "...") */}
          Today is {clientFormattedDate ?? "..."}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
          label: "New Applicants This Week",
          value: newApplicantsThisWeek,
          },

  {
  label: "Open Positions",
  value: openPositions,
}
,
          { label: "Total Applicants", value: allApplicants.length },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-9 shadow-lg hover:shadow-2xl border border-gray-100 transition-all hover:-translate-y-1"
          >
            <div className="text-6xl font-extrabold text-gray-900 mb-2">
              {stat.value}
            </div>
            <div className="text-xl font-semibold text-gray-700">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

     {/* <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">Filter By:</h3>
          {(hasActiveFilters || selectedStage !== "all") && (
            <button
              onClick={clearAllFilters}
              className="px-3.5 py-1.5 text-blue-600 border border-blue-600 rounded-md text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {["gender", "experience", "position"].map((f, key) => {
            const options =
              FILTER_OPTIONS[`${f}s` as keyof typeof FILTER_OPTIONS] as string[];
            return (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </label>
                <div className="relative">
                  <select
                    value={filters[f as keyof typeof filters]}
                    onChange={(e) => handleFilterChange(f, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all"
                  >
                    {options.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div> */}

     {/* Stages */}
<div className="mb-10">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    Current Stage
  </h2>
  <div className="flex flex-wrap gap-6">
    {["applied", "shortlisted", "interview", "offer"].map((stage, key) => {
      return (
        <div
          key={key}
          onClick={() => handleStageClick(stage)}
          className={`flex items-center gap-3 cursor-pointer px-5 py-2.5 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
            selectedStage === stage
              ? stage === "applied"
                ? "bg-red-50 border-red-500"
                : stage === "shortlisted"
                ? "bg-blue-50 border-blue-500"
                : stage === "interview"
                ? "bg-purple-50 border-purple-500"
                : "bg-green-50 border-green-500"
              : "border-transparent bg-white/60"
          }`}
        >
          <div
            className={`w-1.5 h-7 rounded-sm ${
              stage === "applied"
                ? "bg-gray-500"
                : stage === "shortlisted"
                ? "bg-blue-500"
                : stage === "interview"
                ? "bg-purple-500"
                : "bg-green-500"
            }`}
          ></div>
          <span className="text-2xl font-extrabold text-gray-900">
            {statusCounts[stage as keyof typeof statusCounts]}
          </span>
          <span className="text-base text-gray-600">
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </span>
        </div>
      );
    })}
  </div>
</div>


      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {renderTable(statusApplicants.applied, "Applied", "text-gray-700", "applied")}
        {renderTable(statusApplicants.shortlisted, "Shortlisted", "text-blue-600", "shortlisted")}
        {renderTable(statusApplicants.interview, "Interviewed", "text-purple-600", "interview")}
        {renderTable(statusApplicants.offer, "Offered", "text-green-600", "offer")}
      </div>
    </div> {/* ปิด max-w-7xl */}
  </div>   /* ปิด min-h-screen */
);
}