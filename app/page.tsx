"use client";
import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface Applicant {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  gender: string;
  experience: string;
  position: string;
  matchingScore: number;
  status: "Applied" | "Shortlisted" | "Interview" | "Offer";
  stage: "Applied" | "Shortlisted" | "Interview" | "Offer";
  date: string;
}

const FILTER_OPTIONS = {
  genders: ["All", "Male", "Female"],
  experiences: [
    "All",
    "2 years",
    "3 years",
    "4 years",
    "5 years",
    "6 years",
    "7 years",
  ],
  positions: [
    "All",
    "Backend Developer",
    "Software Engineer",
    "Frontend Developer",
    "Data Analyst",
    "DevOps Engineer",
  ],
};

export default function Dashboard() {
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [filters, setFilters] = useState({
    gender: "All",
    experience: "All",
    position: "All",
  });

  const allApplicants: Applicant[] = useMemo(() => {
    return Array.from({ length: 417 }, (_, i) => {
      const firstNames = [
        "Thanapon",
        "Kanokwan",
        "Piyapong",
        "Supawadee",
        "Nattapong",
        "Chutima",
        "Anucha",
        "Siriporn",
        "Kritsada",
        "Chayanon",
        "Somchai",
        "Siriwan",
        "Preecha",
        "Pornpimol",
      ];
      const lastNames = [
        "Watthanakun",
        "Srisuwan",
        "Chaimongkol",
        "Pitakthai",
        "Thongchai",
        "Boonmee",
        "Rattana",
        "Pongpat",
      ];
      const genders = ["Male", "Female"];
      const positions = [
        "Backend Developer",
        "Software Engineer",
        "Frontend Developer",
        "Data Analyst",
        "DevOps Engineer",
      ];
      const experiences = [
        "2 years",
        "3 years",
        "4 years",
        "5 years",
        "6 years",
        "7 years",
      ];
      const stages: ("Applied" | "Shortlisted" | "Interview" | "Offer")[] = [
        "Applied",
        "Shortlisted",
        "Interview",
        "Offer",
      ];

      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      const formattedDate = date.toLocaleDateString("en-GB");

      return {
        id: i + 1,
        empId: `EMP-${83427 + i}`,
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[i % lastNames.length],
        gender: genders[i % 2],
        experience: experiences[i % experiences.length],
        position: positions[i % positions.length],
        matchingScore: 60 + (i % 36),
        status: stages[i % 4],
        stage: stages[i % 4],
        date: formattedDate,
      };
    });
  }, []);

  const filteredApplicants = useMemo(() => {
    let result = allApplicants;
    if (selectedStage !== "all")
      result = result.filter((a) => a.stage.toLowerCase() === selectedStage);
    if (filters.gender !== "All")
      result = result.filter((a) => a.gender === filters.gender);
    if (filters.experience !== "All")
      result = result.filter((a) => a.experience === filters.experience);
    if (filters.position !== "All")
      result = result.filter((a) => a.position === filters.position);
    return result;
  }, [allApplicants, selectedStage, filters]);

  const stageCounts = useMemo(
    () => ({
      applied: filteredApplicants.filter((a) => a.stage === "Applied").length,
      shortlisted: filteredApplicants.filter(
        (a) => a.stage === "Shortlisted"
      ).length,
      interview: filteredApplicants.filter(
        (a) => a.stage === "Interview"
      ).length,
      offer: filteredApplicants.filter((a) => a.stage === "Offer").length,
    }),
    [filteredApplicants]
  );

  const stageApplicants = useMemo(
    () => ({
      applied: filteredApplicants.filter((a) => a.stage === "Applied").slice(0, 4),
      shortlisted: filteredApplicants.filter(
        (a) => a.stage === "Shortlisted"
      ).slice(0, 4),
      interview: filteredApplicants.filter(
        (a) => a.stage === "Interview"
      ).slice(0, 4),
      offer: filteredApplicants.filter((a) => a.stage === "Offer").slice(0, 4),
    }),
    [filteredApplicants]
  );

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "text-gray-700";
      case "Shortlisted":
        return "text-blue-600";
      case "Interview":
        return "text-purple-600";
      case "Offer":
        return "text-green-600";
      default:
        return "text-gray-500";
    }
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
                <td className="py-3 px-2 text-sm text-gray-900">{item.date}</td>
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
                No applicants in this stage
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-12 py-10">
        {/* Welcome */}
        <div className="flex flex-col gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome, Mr. Weeraphol J
          </h1>
          <div className="inline-block w-fit px-5 py-2 text-blue-700 border border-blue-600 bg-blue-50 rounded-lg font-medium shadow-sm">
            Today is {formattedDate}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: "New Applicants",
              value: allApplicants.filter(
                (a) =>
                  new Date(a.date.split("/").reverse().join("-")) >=
                  new Date(Date.now() - 7 * 24 * 3600 * 1000)
              ).length,
            },
            {
              label: "Open Positions",
              value: Array.from(new Set(allApplicants.map((a) => a.position)))
                .length,
            },
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

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-md border border-gray-100">
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
        </div>

        {/* Stages */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Current Stage
          </h2>
          <div className="flex flex-wrap gap-6">
            {["applied", "shortlisted", "interview", "offer"].map((stage, key) => {
              const colors = {
                applied: "red",
                shortlisted: "blue",
                interview: "purple",
                offer: "green",
              } as any;
              return (
                <div
                  key={key}
                  onClick={() => handleStageClick(stage)}
                  className={`flex items-center gap-3 cursor-pointer px-5 py-2.5 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                    selectedStage === stage
                      ? `bg-${colors[stage]}-50 border-${colors[stage]}-500`
                      : "border-transparent bg-white/60"
                  }`}
                >
                  <div
                    className={`w-1.5 h-7 bg-${colors[stage]}-500 rounded-sm`}
                  ></div>
                  <span className="text-2xl font-extrabold text-gray-900">
                    {stageCounts[stage as keyof typeof stageCounts]}
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
          {renderTable(stageApplicants.applied, "Applied", "text-gray-700", "applied")}
          {renderTable(stageApplicants.shortlisted, "Shortlisted", "text-blue-600", "shortlisted")}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderTable(stageApplicants.interview, "Interview", "text-purple-600", "interview")}
          {renderTable(stageApplicants.offer, "Offer", "text-green-600", "offer")}
        </div>
      </div>
    </div>
  );
}

