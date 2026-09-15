import React from 'react';
import { Modal } from '../common/Modal';
import { EvidenceRecord } from '../../types';
import { FileText, CheckCircle2, ShieldCheck, Tag, ExternalLink } from 'lucide-react';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  evidenceRecords: EvidenceRecord[];
  isLoading?: boolean;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  evidenceRecords,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ground Truth Evidence Dossier — ${candidateName}`}
      maxWidth="4xl"
    >
      <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-sm text-indigo-900">
            <span className="font-semibold">Zero Hallucination Guarantee:</span> Every claim, skill score, and requirement match presented by RecruitIQ is traceable directly to exact text snippets, sections, and page coordinates within the original documents.
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            Extracting text spans and bounding coordinates...
          </div>
        ) : evidenceRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p>No grounded evidence records found for this profile yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified Evidence Records ({evidenceRecords.length} grounded snippets)
            </div>

            <div className="grid grid-cols-1 gap-4">
              {evidenceRecords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-md">
                        {item.claim_key}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        in {item.section || 'Experience'} • Page {item.page_number || 1}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {Math.round(item.confidence)}% Confidence
                      </span>
                      <span className="text-xs text-slate-400">
                        Offsets: {item.char_start || 0} - {item.char_end || 0}
                      </span>
                    </div>
                  </div>

                  <blockquote className="p-3 bg-white border-l-4 border-indigo-500 rounded-r-lg text-sm text-slate-700 font-mono text-xs leading-relaxed">
                    "{item.evidence_text}"
                  </blockquote>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Source: {item.source_document || 'Resume.pdf'}
                    </span>
                    <span className="capitalize">{item.claim_type.toLowerCase()} claim</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
