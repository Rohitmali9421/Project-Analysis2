import { useState } from "react";
import axios from "axios";
import {
  FaSpinner,
  FaCheckCircle,
  FaFilePdf,
  FaSearch,
} from "react-icons/fa";
import { FiUpload, FiAlertCircle } from "react-icons/fi";

function ATSResume() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("React Developer");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
      setResponse(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please upload a resume (PDF format).");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/resume/analyze`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResponse(res.data);
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Your Resume (PDF)
              </label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-center space-y-1">
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FaFilePdf className="h-10 w-10 text-red-500" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {fileName}
                      </span>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="h-10 w-10 mx-auto text-gray-400" />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-xs text-gray-500">PDF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Job Category Input */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Target Job Category
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. React Developer, Data Scientist"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 p-4 rounded-md flex items-start space-x-2">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full flex justify-center items-center py-3 px-4 text-sm font-medium text-white rounded-md shadow-sm transition-colors ${
                loading || !file
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                "Analyze Resume & Find Jobs"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {response && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8">
            <div className="flex items-center mb-4">
              <FaCheckCircle className="text-green-600 h-6 w-6 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
            </div>

            {/* Match % */}
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>ATS Compatibility</span>
                <span className="text-blue-600 font-semibold">
                  {response.matchPercentage}% Match
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div
                  className={`h-2.5 rounded-full ${
                    response.matchPercentage >= 70
                      ? "bg-green-500"
                      : response.matchPercentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${response.matchPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Your resume matches <strong>{response.matchPercentage}%</strong> of typical
                requirements for <strong>{category}</strong> roles.
              </p>
            </div>

            {/* Strengths */}
            <Section title="Strengths" color="green">
              {response.strengths.map((point, idx) => (
                <ListItem key={idx} text={point} color="green" />
              ))}
            </Section>

            {/* Missing Keywords */}
            <Section title="Missing Keywords" color="red">
              <div className="flex flex-wrap gap-2">
                {response.missingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </Section>

            {/* Suggestions */}
            <Section title="Improvement Suggestions" color="blue">
              {response.suggestions.map((s, idx) => (
                <ListItem key={idx} text={s} color="blue" />
              ))}
            </Section>

            {/* Summary */}
            <Section title="Summary" color="purple">
              <p className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed">
                {response.summary}
              </p>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Section Component
function Section({ title, children, color }) {
  const bg = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  }[color];

  return (
    <div>
      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
        <span className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center mr-3`}>
          {title === "Improvement Suggestions" ? "💡" : title === "Summary" ? "📄" : title === "Missing Keywords" ? "!" : "✓"}
        </span>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

// Reusable List Item
function ListItem({ text, color }) {
  const textColor = {
    green: "text-green-500",
    blue: "text-blue-500",
  }[color];

  return (
    <li className="flex items-start">
      <span className={`h-5 w-5 ${textColor} mt-0.5 mr-2`}>•</span>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}

export default ATSResume;
