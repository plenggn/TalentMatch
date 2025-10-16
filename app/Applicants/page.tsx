"use client";
import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Users, RefreshCw } from "lucide-react";

interface Applicant {
  id: number;
  empId: string;
  firstName: string;
  gender: string;
  experience: string;
  position: string;
  matchingScore: number;
  status: "Applied" | "Shortlisted" | "Interview" | "Offer";
}

const FILTER_OPTIONS = {
  genders: ["All", "Male", "Female"],
  experiences: ["All", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years"],
  positions: ["All", "Backend Developer", "Software Engineer", "Frontend Developer", "Data Analyst", "DevOps Engineer"],
  matchingScores: ["All", "60-70%", "71-80%", "81-90%", "91-100%"],
  statuses: ["All", "Applied", "Shortlisted", "Interview", "Offer"],
};

const ApplicantsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    gender: "All",
    experience: "All",
    position: "All",
    matchingScore: "All",
    status: "All",
  });

  const itemsPerPage = 10;

  const allApplicants: Applicant[] = useMemo(() => {
    const names = ["Thanapon", "Kanokwan", "Piyapong", "Supawadee", "Nattapong", "Chutima", "Anucha", "Siriporn", "Kritsada", "Chayanon", "Somchai", "Siriwan", "Preecha", "Porn"];
    const genders = ["Male", "Female"];
    const positions = ["Backend Developer", "Software Engineer", "Frontend Developer", "Data Analyst", "DevOps Engineer"];
    const experiences = ["2 years", "3 years", "4 years", "5 years", "6 years", "7 years"];
    const statuses: ("Applied" | "Shortlisted" | "Interview" | "Offer")[] = ["Applied", "Shortlisted", "Interview", "Offer"];

    return Array.from({ length: 417 }, (_, i) => ({
      id: i + 1,
      empId: `EMP-${83427 + i}`,
      firstName: names[i % names.length],
      gender: genders[i % 2],
      experience: experiences[i % experiences.length],
      position: positions[i % positions.length],
      matchingScore: 60 + (i % 36),
      status: statuses[i % statuses.length],
    }));
  }, []);

  const filteredApplicants = useMemo(() => {
    return allApplicants.filter((a) => {
      const searchMatch =
        searchTerm === "" ||
        a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.position.toLowerCase().includes(searchTerm.toLowerCase());

      const genderMatch = filters.gender === "All" || a.gender === filters.gender;
      const expMatch = filters.experience === "All" || a.experience === filters.experience;
      const posMatch = filters.position === "All" || a.position === filters.position;
      const statusMatch = filters.status === "All" || a.status === filters.status;

      let scoreMatch = true;
      if (filters.matchingScore === "60-70%") scoreMatch = a.matchingScore >= 60 && a.matchingScore <= 70;
      else if (filters.matchingScore === "71-80%") scoreMatch = a.matchingScore >= 71 && a.matchingScore <= 80;
      else if (filters.matchingScore === "81-90%") scoreMatch = a.matchingScore >= 81 && a.matchingScore <= 90;
      else if (filters.matchingScore === "91-100%") scoreMatch = a.matchingScore >= 91 && a.matchingScore <= 100;

      return searchMatch && genderMatch && expMatch && posMatch && scoreMatch && statusMatch;
    });
  }, [allApplicants, searchTerm, filters]);

  const totalApplicants = filteredApplicants.length;
  const totalPages = Math.ceil(totalApplicants / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  const resetFilters = () => {
    setFilters({
      gender: "All",
      experience: "All",
      position: "All",
      matchingScore: "All",
      status: "All",
    });
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "text-gray-700 bg-gray-100";
      case "Shortlisted":
        return "text-blue-700 bg-blue-50";
      case "Interview":
        return "text-purple-700 bg-purple-50";
      case "Offer":
        return "text-green-700 bg-green-50";
      default:
        return "text-gray-700 bg-gray-100";
    }
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

  // Count summary
  const summary = useMemo(() => ({
    all: allApplicants.length,
    male: allApplicants.filter(a => a.gender === "Male").length,
    female: allApplicants.filter(a => a.gender === "Female").length,
    shortlisted: allApplicants.filter(a => a.status === "Shortlisted").length,
    interview: allApplicants.filter(a => a.status === "Interview").length,
    offer: allApplicants.filter(a => a.status === "Offer").length,
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

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {[
            { title: "All", value: summary.all, color: "from-blue-500 to-indigo-500" },
            { title: "Male", value: summary.male, color: "from-cyan-400 to-blue-500" },
            { title: "Female", value: summary.female, color: "from-pink-400 to-rose-500" },
            { title: "Shortlisted", value: summary.shortlisted, color: "from-blue-400 to-indigo-400" },
            { title: "Interview", value: summary.interview, color: "from-purple-400 to-violet-500" },
            { title: "Offer", value: summary.offer, color: "from-green-400 to-emerald-500" },
          ].map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl bg-gradient-to-r ${card.color} text-white shadow-lg p-5 flex flex-col items-center justify-center hover:shadow-xl transition-all`}
            >
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm uppercase tracking-wide">{card.title}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
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
            <div className="col-span-5">
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

            <div className="col-span-7 grid grid-cols-5 gap-3">
              {Object.entries(FILTER_OPTIONS).map(([key, options]) => {
                const stateKey =
                  key === "genders" ? "gender" :
                  key === "experiences" ? "experience" :
                  key === "positions" ? "position" :
                  key === "matchingScores" ? "matchingScore" :
                  key === "statuses" ? "status" : key;

                return (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stateKey}</label>
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

        {/* Table */}
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  {["S/N", "Applicant ID", "First Name", "Gender", "Experience", "Position", "Matching Score", "Status", "Action"].map((h) => (
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
                      <td className="px-6 py-4 text-gray-800">{a.firstName}</td>
                      <td className="px-6 py-4">{a.gender}</td>
                      <td className="px-6 py-4">{a.experience}</td>
                      <td className="px-6 py-4">{a.position}</td>
                      <td className="px-6 py-4 font-semibold text-blue-600">{a.matchingScore}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>{a.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">View more</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No applicants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                &gt;
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApplicantsDashboard;
