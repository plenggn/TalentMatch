"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const JobDescriptionForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id"); // รับ id จาก query param เช่น /JobDescriptionForm?id=123

  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    location: "",
    jobType: "",
    salaryRange: "",
    datePosted: "",
    closingDate: "",
    jobDescription: "",
    responsibilities: "",
    requiredSkills: "",
    softSkills: "",
    minimumExperience: "",
    education: ""
  });

  const [modal, setModal] = useState<{ show: boolean; type: "create" | "update" | "" }>({ show: false, type: "" });
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลเดิมถ้าเป็น update
  useEffect(() => {
    const fetchJob = async () => {
      if (jobId) {
        const { data, error } = await supabase
          .from("job_descriptions")
          .select("*")
          .eq("id", jobId)
          .single();

        if (error) {
          console.error(error);
        } else if (data) {
          setFormData({
            jobTitle: data.title || "",
            department: data.department || "",
            location: data.location || "",
            jobType: data.job_type || "",
            salaryRange: data.salary || "",
            datePosted: data.start_date || "",
            closingDate: data.end_date || "",
            jobDescription: data.description || "",
            responsibilities: data.responsibilities || "",
            requiredSkills: data.required_skills?.join(", ") || "",
            softSkills: data.soft_skills?.join(", ") || "",
            minimumExperience: data.experience || "",
            education: data.education || ""
          });
        }
      }
    };
    fetchJob();
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => router.back();

  const handleConfirmAction = (type: "create" | "update") => {
    setModal({ show: true, type });
  };

  const handleModalConfirm = async () => {
    setModal({ show: false, type: "" });

    const payload = {
      title: formData.jobTitle,
      description: formData.jobDescription,
      responsibilities: formData.responsibilities, // ✅ เก็บ responsibilities
      department: formData.department,
      location: formData.location,
      job_type: formData.jobType,
      salary: formData.salaryRange,
      required_skills: formData.requiredSkills
        ? formData.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      soft_skills: formData.softSkills
        ? formData.softSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      experience: formData.minimumExperience,
      education: formData.education,
      start_date: formData.datePosted || null,
      end_date: formData.closingDate || null
    };

    if (modal.type === "create") {
      setLoading(true);
      const { error } = await supabase.from("job_descriptions").insert([payload]);
      setLoading(false);

      if (error) {
        alert("Failed to create job: " + error.message);
      } else {
        alert("Job Created Successfully!");
        router.push("/JobDescription");
      }
    } else if (modal.type === "update" && jobId) {
      setLoading(true);
      const { error } = await supabase.from("job_descriptions").update(payload).eq("id", jobId);
      setLoading(false);

      if (error) {
        alert("Failed to update job: " + error.message);
      } else {
        alert("Job Updated Successfully!");
        router.push("/JobDescription");
      }
    }
  };

  const handleModalCancel = () => setModal({ show: false, type: "" });

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ChevronLeft size={20} /> Back
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        {jobId ? "Update Job Description" : "Create Job Description"}
      </h2>
      <p className="text-gray-600 mb-6">Create or update a job profile for AI-powered CV matching.</p>

      {/* Job Basic Info */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Job Basic Info</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <InputField
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
          />
          {/* ✅ Department ใช้ datalist */}
          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            list="departments"
          />
          <datalist id="departments">
            <option value="Engineering" />
            <option value="Marketing" />
            <option value="Sales" />
            <option value="HR" />
            <option value="Finance" />
          </datalist>
          <InputField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <SelectField
            label="Job Type"
            name="jobType"
            value={formData.jobType}
            onChange={handleInputChange}
            options={["Full-time", "Part-time", "Contract", "Internship"]}
          />
          <InputField
            label="Salary Range"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleInputChange}
          />
          <InputField
            label="Date Posted"
            name="datePosted"
            value={formData.datePosted}
            onChange={handleInputChange}
            type="date"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <InputField
            label="Closing Date"
            name="closingDate"
            value={formData.closingDate}
            onChange={handleInputChange}
            type="date"
          />
        </div>
      </section>

      {/* Job Requirements */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Job Requirements</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <TextareaField
            label="Job Description"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleInputChange}
          />
          <TextareaField
            label="Responsibilities"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleInputChange}
          />
          <TextareaField
            label="Required Skills"
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <InputField
            label="Soft Skills"
            name="softSkills"
            value={formData.softSkills}
            onChange={handleInputChange}
          />
          <SelectField
            label="Minimum Experience"
            name="minimumExperience"
            value={formData.minimumExperience}
            onChange={handleInputChange}
            options={["0-1 years", "1-3 years", "3-5 years", "5+ years"]}
          />
          <SelectField
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            options={["High School", "Bachelor's Degree", "Master's Degree", "PhD"]}
          />
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleConfirmAction("create")}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Job Description"}
        </button>
        <button
          onClick={() => handleConfirmAction("update")}
          className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition font-medium"
        >
          Update Job Description
        </button>
      </div>

      {/* Confirm Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg text-center">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              {modal.type === "create" ? "Create Job" : "Update Job"}?
            </h4>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {modal.type} this Job Description?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleModalConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Confirm
              </button>
              <button
                onClick={handleModalCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Reusable Components */
type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  list?: string;
};

const InputField = ({ label, name, value, onChange, type = "text", list }: InputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      list={list}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

const SelectField = ({ label, name, value, onChange, options }: SelectProps) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
  </div>
);

type TextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const TextareaField = ({ label, name, value, onChange }: TextareaProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      rows={4}
    />
  </div>
);

export default JobDescriptionForm;
