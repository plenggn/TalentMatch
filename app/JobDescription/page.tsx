"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, FileText, MapPin, Briefcase, DollarSign, Filter, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient"; // Adjust path if needed

// Match your Supabase table columns
interface JobPosting {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  job_type: string;
  salary: string;
  required_skills: string[]; // stored as text[] in Supabase
  soft_skills: string[];     // stored as text[] in Supabase
  experience: string;
  education: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
}

const JobDescriptionPage = () => {
  // Data + loading
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal editing
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  // Local form fields for skills as comma-separated strings
  const [requiredSkillsInput, setRequiredSkillsInput] = useState("");
  const [softSkillsInput, setSoftSkillsInput] = useState("");

  // Fetch data from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase.from("job_descriptions").select("*");
      if (error) {
        setErrorMsg(error.message);
      } else {
        setJobs((data || []) as JobPosting[]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  // Derived filter options
  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))],
    [jobs]
  );
  const locations = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.location)))],
    [jobs]
  );
  const jobTypes = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.job_type)))],
    [jobs]
  );

  // Filtering
  const filteredJobs = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.job_type.toLowerCase().includes(searchLower) ||
        job.required_skills?.some((s) => s.toLowerCase().includes(searchLower)) ||
        job.soft_skills?.some((s) => s.toLowerCase().includes(searchLower)) ||
        job.experience.toLowerCase().includes(searchLower) ||
        job.education.toLowerCase().includes(searchLower);

      const matchesDept = selectedDepartment === "All" || job.department === selectedDepartment;
      const matchesLoc = selectedLocation === "All" || job.location === selectedLocation;
      const matchesType = selectedJobType === "All" || job.job_type === selectedJobType;

      return matchesSearch && matchesDept && matchesLoc && matchesType;
    });
  }, [jobs, searchTerm, selectedDepartment, selectedLocation, selectedJobType]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSelectedDepartment("All");
    setSelectedLocation("All");
    setSelectedJobType("All");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Delete job
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("job_descriptions").delete().eq("id", id);
    if (error) {
      setErrorMsg("Delete failed: " + error.message);
      return;
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  // Open update modal
  const handleOpenUpdate = (job: JobPosting) => {
    setEditingJob(job);
    setRequiredSkillsInput((job.required_skills || []).join(", "));
    setSoftSkillsInput((job.soft_skills || []).join(", "));
    setShowUpdateModal(true);
  };

  // Close update modal
  const handleCloseModal = () => {
    setEditingJob(null);
    setRequiredSkillsInput("");
    setSoftSkillsInput("");
    setShowUpdateModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Description</h1>
              <p className="text-sm text-gray-600 mt-1">Job profiles for AI-powered CV matching</p>
            </div>
          </div>

          <a
            href="/JobDescription/create"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Job Description
          </a>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  Quick Search
                </label>
                <input
                  type="text"
                  placeholder="Search by title, skills, or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-5 py-3.5 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="text-center self-end">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl px-8 py-3 shadow-lg">
                  <div className="text-3xl font-bold text-white">{filteredJobs.length}</div>
                  <div className="text-xs text-blue-100 font-medium">Total Jobs</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <Filter className="w-4 h-4 text-blue-600" />
                  Job Type
                </label>
                <select
                  value={selectedJobType}
                  onChange={(e) => {
                    setSelectedJobType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Reset
                </button>
                <button className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards */}
        {loading ? (
          <p className="text-gray-600">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-gray-600 bg-white rounded-xl border border-gray-100 p-10 shadow-sm">
            No jobs found. Try adjusting filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {currentJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{job.title}</h3>
                  <div className="flex items-center gap-4 text-blue-50 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.job_type}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3.5 text-sm bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Description:</span>
                    <span className="flex-1 text-gray-600">{job.description}</span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Department:</span>
                    <span className="flex-1">
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {job.department}
                      </span>
                    </span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0 flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Salary:
                    </span>
                    <span className="flex-1 text-green-600 font-semibold">{job.salary}</span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Required Skills:</span>
                    <span className="flex-1 flex flex-wrap gap-1.5">
                      {job.required_skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Soft Skills:</span>
                    <span className="flex-1 flex flex-wrap gap-1.5">
                      {job.soft_skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Experience:</span>
                    <span className="flex-1 text-gray-600">{job.experience}</span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Education:</span>
                    <span className="flex-1 text-gray-600">{job.education}</span>
                  </div>

                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-36 flex-shrink-0">Period:</span>
                    <span className="flex-1 text-gray-600 font-medium">
                      {job.start_date} - {job.end_date}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenUpdate(job)}
                    className="flex-1 bg-white border-2 border-blue-500 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              &lt;&lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  currentPage === num
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              &gt;&gt;
            </button>
          </div>
        )}
      </div>
      {/* Update Modal */}
      {showUpdateModal && editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Update Job</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Job Title"
              />
              <input
                type="text"
                value={editingJob.department}
                onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Department"
              />
              <input
                type="text"
                value={editingJob.location}
                onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Location"
              />
              <input
                type="text"
                value={editingJob.job_type}
                onChange={(e) => setEditingJob({ ...editingJob, job_type: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Job Type"
              />
              <input
                type="text"
                value={editingJob.salary}
                onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Salary"
              />
              <input
                type="text"
                value={editingJob.experience}
                onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Experience"
              />
              <input
                type="text"
                value={editingJob.education}
                onChange={(e) => setEditingJob({ ...editingJob, education: e.target.value })}
                className="border rounded-lg px-3 py-2"
                placeholder="Education"
              />
              <input
                type="date"
                value={editingJob.start_date}
                onChange={(e) => setEditingJob({ ...editingJob, start_date: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="date"
                value={editingJob.end_date}
                onChange={(e) => setEditingJob({ ...editingJob, end_date: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <textarea
              value={editingJob.description}
              onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full mt-4"
              rows={3}
              placeholder="Description"
            />

            {/* Skills as comma-separated for easy editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={requiredSkillsInput}
                  onChange={(e) => setRequiredSkillsInput(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. JavaScript, React, SQL"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1">Soft Skills (comma-separated)</label>
                <input
                  type="text"
                  value={softSkillsInput}
                  onChange={(e) => setSoftSkillsInput(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. Communication, Teamwork"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingJob) return;

                  const required_skills = requiredSkillsInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const soft_skills = softSkillsInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const payload = {
                    title: editingJob.title,
                    description: editingJob.description,
                    department: editingJob.department,
                    location: editingJob.location,
                    job_type: editingJob.job_type,
                    salary: editingJob.salary,
                    required_skills,
                    soft_skills,
                    experience: editingJob.experience,
                    education: editingJob.education,
                    start_date: editingJob.start_date,
                    end_date: editingJob.end_date,
                  };

                  const { error } = await supabase
                    .from("job_descriptions")
                    .update(payload)
                    .eq("id", editingJob.id);

                  if (error) {
                    alert("Update failed: " + error.message);
                    return;
                  }

                  // Update local state
                  setJobs((prev) =>
                    prev.map((j) =>
                      j.id === editingJob.id ? { ...editingJob, required_skills, soft_skills } : j
                    )
                  );
                  handleCloseModal();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionPage;
