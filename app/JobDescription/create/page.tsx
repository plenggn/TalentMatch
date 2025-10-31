"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const JobDescriptionForm = () => {
  const router = useRouter();

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
    education: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    router.back();
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleModalConfirm = async () => {
    closeModal();

    const payload = {
      title: formData.jobTitle,
      department: formData.department,
      location: formData.location,
      job_type: formData.jobType,
      salary: formData.salaryRange,
      start_date: formData.datePosted || null,
      end_date: formData.closingDate || null,
      description: formData.jobDescription,
      responsibilities: formData.responsibilities,
      required_skills: formData.requiredSkills
        ? formData.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      soft_skills: formData.softSkills
        ? formData.softSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      experience: formData.minimumExperience,
      education: formData.education,
    };

    setLoading(true);
    const { error } = await supabase
      .from("job_descriptions")
      .insert([payload]);
    setLoading(false);

    if (error) {
      alert("Failed to create job: " + error.message);
    } else {
      alert("Job Created Successfully!");
      router.push("/JobDescription");
    }
  };

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
        Create Job Description
      </h2>
      <p className="text-gray-600 mb-6">
        Create a job profile for AI-powered CV matching.
      </p>

      {/* Job Basic Info */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Job Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <InputField
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            list="departments"
            placeholder="Select or type..."
            required
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SelectField
            label="Job Type"
            name="jobType"
            value={formData.jobType}
            onChange={handleInputChange}
            options={[
              "Full-time",
              "Part-time",
              "Contract",
              "Internship",
            ]}
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
            type="date"
            value={formData.datePosted}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Closing Date"
            name="closingDate"
            type="date"
            value={formData.closingDate}
            onChange={handleInputChange}
          />
        </div>
      </section>

      {/* Job Requirements */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Job Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            options={[
              "High School",
              "Bachelor's Degree",
              "Master's Degree",
              "PhD",
            ]}
          />
        </div>
      </section>

      {/* Create Button */}
      <div className="flex justify-center">
        <button
          onClick={openModal}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Job Description"}
        </button>
      </div>

      {/* Confirm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl p-6 w-96 shadow-lg text-center animate-fade-in"
          >
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Create Job?
            </h4>
            <p className="text-gray-600 mb-6">
              Are you sure you want to create this Job Description?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleModalConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Confirm
              </button>
              <button
                onClick={closeModal}
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  type?: string;
  list?: string;
  placeholder?: string;
  required?: boolean;
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  list,
  placeholder,
  required = false,
}: InputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      list={list}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: string[];
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}: SelectProps) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
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
    <ChevronDown
      className="absolute right-3 top-3 text-gray-400 pointer-events-none"
      size={20}
    />
  </div>
);

type TextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

const TextareaField = ({
  label,
  name,
  value,
  onChange,
}: TextareaProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  </div>
);

export default JobDescriptionForm;
