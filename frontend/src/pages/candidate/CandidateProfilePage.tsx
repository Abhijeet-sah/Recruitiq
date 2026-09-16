import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, 
  User, Briefcase, GraduationCap, Plus, Trash2, Loader2, Save 
} from 'lucide-react';
import { resumesApi, candidatesApi } from '../../api';
import { CandidateProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CandidateProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [summary, setSummary] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExp, setYearsExp] = useState(2.0);
  const [eduLevel, setEduLevel] = useState("Bachelor's Degree");
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await candidatesApi.getMyProfile();
      setProfile(data);
      setSummary(data.summary || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      setYearsExp(data.years_of_experience || 1.0);
      setEduLevel(data.education_level || "Bachelor's Degree");
    } catch (err: any) {
      console.warn('Failed to load candidate profile from API, providing editable fallback:', err);
      // Construct fallback profile from authenticated user so the page always renders cleanly
      const fallbackProfile: any = {
        id: user.candidate_profile_id || user.id,
        user_id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: '',
        location: 'Remote / Hybrid',
        summary: '',
        years_of_experience: 1.0,
        education_level: "Bachelor's Degree",
        parsing_confidence: 0,
        skills: [],
        experiences: [],
        educations: []
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadMessage(null);
    setUploading(true);

    try {
      const res = await resumesApi.upload(file, profile?.id);
      setUploadMessage(res.message);
      await loadProfile();
    } catch (err: any) {
      setError(err.message || 'Unable to parse this resume. Please upload a valid PDF or DOCX file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await candidatesApi.update(profile.id, {
        summary,
        phone,
        location,
        years_of_experience: yearsExp,
        education_level: eduLevel,
      });
      setProfile(updated);
      setUploadMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <LoadingSpinner fullScreen message="Loading candidate profile..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Candidate Profile & Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Resume & Experience Dossier
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume in PDF or DOCX format for automatic parsing and confidence calculation.
        </p>
      </div>

      {uploadMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-8 text-center transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Upload Your Resume</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Supported formats: <strong>.PDF, .DOCX</strong> (Max 10MB). PyMuPDF and python-docx will extract your credentials.
        </p>

        <label className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Parsing Resume...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" /> Select Resume File
            </>
          )}
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {profile.parsing_confidence > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-500">Current Confidence Score:</span>
            <Badge variant="primary" size="sm">
              {profile.parsing_confidence}% High Confidence
            </Badge>
          </div>
        )}
      </div>

      {/* Editable Profile Information */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Parsed Candidate Details & Manual Overrides
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 0123-4567"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State / Remote"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Years Experience</label>
              <input
                type="number"
                step="0.5"
                value={yearsExp}
                onChange={(e) => setYearsExp(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Professional Summary</label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Current Extracted Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Recognized Competencies</label>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  {s.skill_name}
                  <span className="text-[10px] text-indigo-400">({s.level})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving changes...' : 'Save Profile Adjustments'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
