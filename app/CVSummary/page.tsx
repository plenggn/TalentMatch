"use client";
import React, { useState, useEffect } from "react";
import { FileText, Download, Printer, ChevronDown, ChevronUp, X, Search } from "lucide-react";

interface Candidate {
  name: string;
  applicantId: string;
  experience: string;
  position: string;
  education: string;
  matchingScore: string;
  status: string;
  summary: string;
  strengths: string[];
  overview: string;
  cv: {
    name: string;
    address: string;
    city: string;
    email: string;
    phone: string;
    researchInterests: string;
    education: string[];
    experience: string[];
    pdfUrl?: string;
    imgUrl?: string;
  };
}

const candidatesData: Candidate[] = [
  {
    name: "Weeraphol Jongsara",
    applicantId: "EMP-83030",
    experience: "7 years",
    position: "Software Engineer",
    education: "B.Sc. Computer Engineering, KMUTT",
    matchingScore: "95%",
    status: "Interview",
    summary: "Experienced full-stack engineer skilled in JavaScript, React, Node.js, and AWS...",
    strengths: ["React & Vue frontend", "Node.js backend", "AWS & Docker deployment", "Team leadership", "Problem-solving", "Bilingual communication"],
    overview: "High alignment with Software Engineer role requirements. Matches 90% of tech stack.",
    cv: {
      name: "Weeraphol Jongsara",
      address: "Bangkok, Thailand",
      city: "Bangkok",
      email: "weeraphol@example.com",
      phone: "099-999-9999",
      researchInterests: "Web Development, AI, Cloud Computing",
      education: ["B.Sc. Computer Engineering, KMUTT, 2016-2020"],
      experience: ["Software Engineer, ABC Co., 2020-2023", "Frontend Developer Intern, XYZ Co., 2019"],
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      imgUrl: "https://via.placeholder.com/400x500?text=CV+Image"
    }
  },
  {
    name: "Jane Doe",
    applicantId: "EMP-83031",
    experience: "3 years",
    position: "Frontend Developer",
    education: "B.Sc. Computer Science, Chulalongkorn",
    matchingScore: "88%",
    status: "Applied",
    summary: "Frontend developer skilled in React, TypeScript...",
    strengths: ["React", "TypeScript", "UI/UX design", "Team collaboration"],
    overview: "Good fit for Frontend role.",
    cv: {
      name: "Jane Doe",
      address: "Bangkok, Thailand",
      city: "Bangkok",
      email: "jane@example.com",
      phone: "088-888-8888",
      researchInterests: "Web design, Frontend frameworks",
      education: ["B.Sc. Computer Science, Chulalongkorn, 2018-2021"],
      experience: ["Frontend Developer, XYZ Co., 2021-2024"],
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  }
];

export default function CVSummaryApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState(candidatesData);
  const [selectedCandidate, setSelectedCandidate] = useState(candidatesData[0]);
  const [showCV, setShowCV] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  
  // **ใหม่**: Modal confirm status
  const [statusConfirm, setStatusConfirm] = useState<{ show: boolean; newStatus: string | null }>({ show: false, newStatus: null });

  const statusOptions = ["Applied", "Shortlisted", "Interview", "Offer"];

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredCandidates(
      candidatesData.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.applicantId.toLowerCase().includes(term)
      )
    );
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Applied: "bg-gray-500",
      Shortlisted: "bg-blue-500",
      Interview: "bg-yellow-500",
      Offer: "bg-green-500"
    };
    return colors[status] || "bg-gray-500";
  };

  // **แก้ไข**: เปิด modal แทน confirm
  const handleStatusChange = (newStatus: string) => {
    setStatusConfirm({ show: true, newStatus });
  };

  const confirmStatusChange = () => {
    if (statusConfirm.newStatus) {
      setSelectedCandidate({ ...selectedCandidate, status: statusConfirm.newStatus });
    }
    setStatusConfirm({ show: false, newStatus: null });
  };

  const cancelStatusChange = () => setStatusConfirm({ show: false, newStatus: null });

  const exportToExcel = () => {
    const csvContent = [
      ["Field", "Value"],
      ["Candidate Name", selectedCandidate.name],
      ["Applicant ID", selectedCandidate.applicantId],
      ["Position", selectedCandidate.position],
      ["Experience", selectedCandidate.experience],
      ["Education", selectedCandidate.education],
      ["Matching Score", selectedCandidate.matchingScore],
      ["Status", selectedCandidate.status],
      ["AI Summary", selectedCandidate.summary],
      ["Strengths", selectedCandidate.strengths.join("; ")],
      ["Overview", selectedCandidate.overview]
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob(['\uFEFF'+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CV_${selectedCandidate.name.replace(/\s/g,'_')}.csv`;
    link.click();
  };

  const printToPDF = () => window.print();

  const openCVModal = () => setShowCVModal(true);
  const closeCVModal = () => setShowCVModal(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14ADD6]/10 via-[#384295]/10 to-[#14ADD6]/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header + Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">AI CV Matching</h1>

          <div className="relative w-full lg:w-1/3 flex">
            <input
              type="text"
              placeholder="Search by name or applicant ID..."
              className="flex-1 px-4 py-2 rounded-l-xl border border-gray-300 focus:ring-2 focus:ring-[#14ADD6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
             className="bg-gradient-to-r from-[#14ADD6] to-[#384295] text-white px-4 rounded-r-xl flex items-center gap-2 hover:scale-105 transition"
              onClick={() => {
                if (filteredCandidates.length > 0) setSelectedCandidate(filteredCandidates[0]);
              }}
            >
              <Search size={16} /> Search
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowCV(!showCV)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#14ADD6] to-[#384295] text-white rounded-xl shadow hover:scale-105 transition"
          >
            <FileText size={18} /> {showCV ? "Hide CV" : "Show CV"} {showCV ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:scale-105 transition"
          >
            <Download size={18} /> Export Excel
          </button>

          <button
            onClick={printToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl shadow hover:scale-105 transition"
          >
            <Printer size={18} /> Print PDF
          </button>

          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`px-4 py-2 rounded-xl text-white ${getStatusColor(selectedCandidate.status)} flex items-center gap-2`}
            >
              Status: {selectedCandidate.status} <ChevronDown size={18} />
            </button>
            {showStatusDropdown && (
              <div className="absolute mt-2 bg-white border rounded-xl shadow-lg z-10 min-w-[150px]">
                {statusOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleStatusChange(opt)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Summary / Matching */}
        <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-800">{selectedCandidate.name}</span>
              <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(selectedCandidate.status)}`}>
                {selectedCandidate.status}
              </span>
            </div>
            <p className="text-gray-600">Applicant ID: {selectedCandidate.applicantId}</p>
            <p className="text-gray-600">Position: {selectedCandidate.position}</p>
            <p className="text-gray-600">Experience: {selectedCandidate.experience}</p>
            <p className="text-gray-600">Education: {selectedCandidate.education}</p>
          </div>
          <div className="bg-gradient-to-r from-[#14ADD6] to-[#384295] text-white rounded-2xl p-6 flex flex-col justify-center items-center shadow-lg transition-transform hover:scale-105">
            <div className="text-5xl font-bold">{selectedCandidate.matchingScore}</div>
            <div className="text-sm mt-1">Matching Score</div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#14ADD6]">AI Summary</h2>
          <p className="text-gray-700">{selectedCandidate.summary}</p>

          <h2 className="text-xl font-bold text-[#14ADD6] mt-4">Key Strengths</h2>
          <div className="flex flex-wrap gap-2">
            {selectedCandidate.strengths.map((s, idx) => (
              <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
                {s}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-bold text-[#14ADD6] mt-4">Overall Job Fit Overview</h2>
          <p className="text-gray-700">{selectedCandidate.overview}</p>
        </div>

        {/* CV Section */}
        {showCV && (
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800">{selectedCandidate.cv.name}</h2>
            <p className="text-gray-600">{selectedCandidate.cv.address}, {selectedCandidate.cv.city}</p>
            <p className="text-gray-600">{selectedCandidate.cv.email} | {selectedCandidate.cv.phone}</p>

            {selectedCandidate.cv.pdfUrl ? (
              <iframe
                src={selectedCandidate.cv.pdfUrl}
                width="100%"
                height="600px"
                className="border rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                onClick={openCVModal}
              ></iframe>
            ) : selectedCandidate.cv.imgUrl ? (
              <img
                src={selectedCandidate.cv.imgUrl}
                alt="CV Image"
                className="w-full max-w-xl rounded-xl border shadow hover:shadow-lg transition cursor-pointer"
                onClick={openCVModal}
              />
            ) : null}
          </div>
        )}

        {/* CV Modal */}
        {showCVModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-70">
            <div className="relative bg-white rounded-xl p-4 max-w-5xl w-full max-h-[90vh] overflow-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                onClick={closeCVModal}
              >
                <X size={24} />
              </button>
              {selectedCandidate.cv.pdfUrl ? (
                <iframe
                  src={selectedCandidate.cv.pdfUrl}
                  width="100%"
                  height="90vh"
                  className="border rounded-xl"
                ></iframe>
              ) : selectedCandidate.cv.imgUrl ? (
                <img
                  src={selectedCandidate.cv.imgUrl}
                  alt="CV Image"
                  className="w-full rounded-xl"
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Status Confirm Modal */}
        {statusConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">
              <h4 className="text-lg font-bold text-gray-800 mb-4">
                Change Status?
              </h4>
              <p className="text-gray-600 mb-6">
                Are you sure you want to change status to "{statusConfirm.newStatus}"?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmStatusChange}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  Confirm
                </button>
                <button
                  onClick={cancelStatusChange}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
