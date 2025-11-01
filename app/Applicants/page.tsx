"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Users, RefreshCw, Eye } from "lucide-react"; 
import { supabase } from "../../lib/supabaseClient"; 
import { useRouter } from "next/navigation";

// --- [1. MODIFY INTERFACE] --- (Interface นี้ถูกต้องแล้ว)
interface Applicant {
  id: number | string; 
  empId: string;
  firstName: string;
  lastName: string;
  gender: string;
  experience: string;
  job_id: string | null; 
  job_descriptions?: { 
    id: string;
    title: string;
  } | null;
  status: "Applied" | "Shortlisted" | "Interviewed" | "Offered" | "Rejected"; 
  matchingScore: number;
  potentialPrediction?: string; 
  personalityInference?: string; 
  pssScore?: number;
}


const ApplicantsDashboard = () => {
  const router = useRouter(); 

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
    position: "All", 
    status: "All",
  });



  const itemsPerPage = 10;

  //State สำหรับ positions dynamic (เก็บ title)
  const [positionsOptions, setPositionsOptions] = useState<string[]>(["All"]);

  // 🔹 FILTER_OPTIONS dynamic
  const SCORE_RANGES = ["All", "0-20%", "21-40%", "41-60%", "61-80%", "81-100%"];

  // --- [!!! 3. MODIFY FILTER_OPTIONS !!!] ---
  // (ลบ genders, experiences, matchingScores, pssScores ออก)
  const FILTER_OPTIONS = {
    positions: positionsOptions, 
    statuses: ["All", "Applied", "Shortlisted", "Interviewed", "Offered", "Rejected"], 
  };
  // --- [!!! END MODIFY !!!] ---


  // --- PSS Calculation Logic (เหมือนเดิม) ---
  const calculatePSS = (applicant: Applicant): number => {
    const matchingScore = applicant.matchingScore || 0;
    
    const predText = applicant.potentialPrediction?.toLowerCase() || '';
    let potentialScore = 0;
    if (predText.includes('high potential') || predText.includes('senior ready') || predText.includes('excellent growth')) {
        potentialScore = 95;
    } else if (predText.includes('moderate potential') || predText.includes('stable growth')) {
        potentialScore = 70;
    } else {
        potentialScore = 40;
    }

    const personalityText = applicant.personalityInference?.toLowerCase() || '';
    let personalityScore = 0;
    if (personalityText.includes('result-oriented') || personalityText.includes('decisive') || personalityText.includes('leadership')) {
        personalityScore = 90;
    } else if (personalityText.includes('team-oriented') || personalityText.includes('collaborative') || personalityText.includes('detail-oriented')) {
        personalityScore = 75;
    } else {
        personalityScore = 50;
    }

    // PSS = (50% Match) + (30% Potential) + (20% Personality)
    const pss = (0.5 * matchingScore) + (0.3 * potentialScore) + (0.2 * personalityScore);
    
    return Math.round(pss);
  };


  // Fetch applicants และ positions
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  // --- [DATA FETCHING] --- (ส่วนนี้ถูกต้องแล้ว)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let applicantPositions: string[] = []; 
      let applicantsData: Applicant[] = []; 

      // --- 1. ดึงข้อมูล Applicants (Join ตาราง job_descriptions) ---
      const { data: appData, error: appError } = await supabase
        .from("applicants")
        .select(`
            *, 
            job_descriptions ( id, title )
        `); 

      if (appError) {
        console.error("Error fetching applicants:", appError);
      } else {
        const formatted = appData.map((a: any) => {
          const app: Applicant = {
            id: a.id,
            empId: a.emp_id || a.id,
            firstName: a.firstName || "-",
            lastName: a.lastName || "-",
            gender: a.gender || "-",
            experience: a.experience || "-",
            job_id: a.job_id || null, 
            job_descriptions: a.job_descriptions || null, 
            matchingScore: a.matching_score || 0,
            status: (a.status || "Applied") as
              | "Applied"
              | "Shortlisted"
              | "Interviewed"
              | "Offered"
              | "Rejected",
            potentialPrediction: a.potential_prediction || "",
            personalityInference: a.personality_inference || "",
          };
          app.pssScore = calculatePSS(app);
          return app;
        });
        
        applicantsData = formatted;
        applicantPositions = Array.from(
          new Set(formatted.map((d: any) => d.job_descriptions?.title).filter(Boolean))
        );
      }
      setAllApplicants(applicantsData); 

      // --- 2. ดึงข้อมูล Job Descriptions (สำหรับ Filter) ---
      const { data: jobsData, error: jobsError } = await supabase
        .from("job_descriptions")
        .select("title"); 

      if (jobsError) {
        console.error("❌ Error fetching job descriptions:", jobsError);
        setPositionsOptions(["All", ...applicantPositions.sort()]);
      } else {
        const jobPositions = Array.from(
          new Set(jobsData.map((job: any) => job.title).filter(Boolean))
        );

        // --- 3. รวม Lists และตั้งค่า State ---
        const allPositions = Array.from(
          new Set([...applicantPositions, ...jobPositions]) 
        );
        setPositionsOptions(["All", ...allPositions.sort()]); 
      }

      setLoading(false);
    };

    fetchData();
  }, []); 
  // --- [END DATA FETCHING] ---


  // --- [!!! 4. MODIFY FILTERING LOGIC !!!] ---
  const filteredApplicants = useMemo(() => {
    return allApplicants.filter((a) => {
      
      const searchMatch =
        searchTerm === "" ||
        a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.job_descriptions?.title || "").toLowerCase().includes(searchTerm.toLowerCase()); 

      // (ลบ genderMatch, expMatch, scoreMatch, pssMatch)
      const posMatch = filters.position === "All" || (a.job_descriptions?.title || "") === filters.position;
      const statusMatch = filters.status === "All" || a.status === filters.status;

      return searchMatch && posMatch && statusMatch; // (เหลือแค่ 3 เงื่อนไข)
    });
  }, [allApplicants, searchTerm, filters]);
  // --- [!!! END MODIFY !!!] ---


  const totalApplicants = filteredApplicants.length;
  const totalPages = Math.ceil(totalApplicants / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  // --- [!!! 5. MODIFY RESET FILTERS !!!] ---
  const resetFilters = () => {
    setFilters({
      position: "All",
      status: "All",
    });
    setSearchTerm("");
  };
  // --- [!!! END MODIFY !!!] ---

  
  const STATUS_CLASSES: Record<string, string> = {
    Applied: "text-blue-800 bg-blue-100",
    Shortlisted: "text-blue-700 bg-blue-200",
    Interviewed: "text-purple-700 bg-purple-200", 
    Offered: "text-green-700 bg-green-200", 
    Rejected: "text-red-700 bg-red-200", 
  };


  const getPageNumbers = () => {
    const max = 5;
    const pages: number[] = [];
    if (totalPages <= max) for (let i = 1; i <= totalPages; i++) pages.push(i);
    else if (currentPage <= 3) for (let i = 1; i <= max; i++) pages.push(i);
    else if (currentPage >= totalPages - 2) for (let i = totalPages - max + 1; i <= totalPages; i++) pages.push(i);
    else for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };
  
  const navigateToCVSummary = (applicantId: number | string) => {
      router.push(`/CVSummary?applicantId=${applicantId}`);
  };

  const summary = useMemo(() => ({
    all: allApplicants.length,
    applied: allApplicants.filter(a => a.status === "Applied").length, // (Added)
    shortlisted: allApplicants.filter(a => a.status === "Shortlisted").length,
    interview: allApplicants.filter(a => a.status === "Interviewed").length,
    offer: allApplicants.filter(a => a.status === "Offered").length,
    rejected: allApplicants.filter(a => a.status === "Rejected").length, // (Added)
  }), [allApplicants]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-7 h-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">All Applicants</h1>
          </div>
          <p className="text-gray-600">Search, filter, and view all applicants</p>
        </div>

       {/* --- [!!! 7. MODIFY SUMMARY CARDS (FIXED) !!!] --- */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {[
            { title: "All", value: summary.all, color: "from-blue-500 to-indigo-500" },
            { title: "Applied", value: summary.applied, color: "from-cyan-400 to-blue-500" },
            { title: "Shortlisted", value: summary.shortlisted, color: "from-blue-400 to-indigo-400" },
            { title: "Interviewed", value: summary.interview, color: "from-purple-400 to-violet-500" }, 
            { title: "Offered", value: summary.offer, color: "from-green-400 to-emerald-500" },
            { title: "Rejected", value: summary.rejected, color: "from-red-400 to-pink-500" },
          ].map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl bg-gradient-to-r ${card.color} text-white shadow-lg p-5 flex flex-col items-center justify-center hover:shadow-xl transition-all`}
            >
              <div className="text-2xl font-bold">{card.value}</div>
              {/* [!!! FIXED !!!] (ลบ .replace('ed', '') ออก) */}
              <div className="text-sm uppercase tracking-wide">{card.title}</div>
            </div>
          ))}
        </div>
        {/* --- [!!! END MODIFY !!!] --- */}

        {/* --- [!!! 8. MODIFY SEARCH/FILTERS !!!] --- */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filter Applicants</h3>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Reset Filter
            </button>
          </div>

          <div className="grid grid-cols-12 gap-4 items-end">
            {/* (Search Bar: ปรับ col-span) */}
            <div className="col-span-12 md:col-span-6"> 
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Search</label>
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, or position..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* (Filters: ปรับ col-span และ grid-cols) */}
            <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-3">
              {
                [ // (เหลือ 2 filters)
                    { key: 'positions', stateKey: 'position', label: 'Position' },
                    { key: 'statuses', stateKey: 'status', label: 'Status' },
                ].map((filterDef) => {
                const key = filterDef.key as keyof typeof FILTER_OPTIONS;
                const options = FILTER_OPTIONS[key] as string[];
                const stateKey = filterDef.stateKey;
                const label = filterDef.label;
                
                return (
                  <div key={key} className={'col-span-1'}> 
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <select
                        value={(filters as any)[stateKey]}
                        onChange={(e) => setFilters((p) => ({ ...p, [stateKey]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {options.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* --- [!!! END MODIFY !!!] --- */}


        {/* Table (ส่วนนี้ถูกต้องแล้ว ไม่ต้องแก้ไข) */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Applicants</h2>
            <span className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {totalApplicants > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalApplicants)}
              </span>{" "}
              of <span className="font-semibold">{totalApplicants}</span>
            </span>
          </div>
          {loading && (
            <div className="text-center py-10 text-gray-500">Loading applicants...</div>
          )}


          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  {["S/N", "Applicant ID", "Name ", "Position", "Match Score", "PSS Score", "Status", "Action"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentApplicants.length > 0 ? (
                  currentApplicants.map((a, i) => (
                    <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 text-gray-700">{String(startIndex + i + 1).padStart(2, "0")}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{a.empId}</td>
                      <td className="px-6 py-4 text-gray-800">{a.firstName} {a.lastName}</td>
                      
                      <td className="px-6 py-4">
                         {a.job_descriptions?.title || (a.job_id ? <span className="text-red-500 text-xs">Job ID not found</span> : <span className="text-gray-400">N/A</span>)}
                      </td>
                      
                      <td className="px-6 py-4 font-semibold text-blue-600">
                         {a.matchingScore}%
                      </td>
                      <td className="px-6 py-4 font-semibold text-purple-600">
                         {a.pssScore}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[a.status] || "text-gray-800 bg-gray-200"}`}>{a.status}</span>
                      </td>
                      <td className="px-6 py-4">
                          <button 
                              onClick={() => navigateToCVSummary(a.id)}
                              className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium flex items-center gap-1"
                              title="View Full AI Summary Report"
                          >
                              <Eye className="w-4 h-4" /> View
                          </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No applicants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (เหมือนเดิม) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 px-6 py-5 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                &lt;
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentPage === p
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                &lt;
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApplicantsDashboard;