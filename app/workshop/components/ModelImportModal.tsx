"use client";

import React, { useState, useRef } from "react";
import { Modal, message } from "antd";
import {
  UploadCloud,
  FileBox,
  CheckCircle2,
  HelpCircle,
  Sliders,
} from "lucide-react";

interface ModelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomModel: (file: File, fileType: "glb" | "gltf" | "fbx", scaleFactor: number) => void;
}

export default function ModelImportModal({
  isOpen,
  onClose,
  onLoadCustomModel,
}: ModelImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "glb" && extension !== "gltf" && extension !== "fbx") {
      message.error("Format file tidak didukung! Harap unggah file .glb, .gltf, atau .fbx");
      return;
    }

    setSelectedFile(file);
    message.success(`File 3D "${file.name}" siap di-import!`);
  };

  const handleImportSubmit = () => {
    if (!selectedFile) {
      message.warning("Pilih file 3D terlebih dahulu.");
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() as
      | "glb"
      | "gltf"
      | "fbx";

    setIsProcessing(true);
    setTimeout(() => {
      onLoadCustomModel(selectedFile, extension, scaleFactor);
      setIsProcessing(false);
      onClose();
      message.success({
        content: `Model 3D "${selectedFile.name}" berhasil dipasang di showroom!`,
        style: { marginTop: "5vh" },
      });
    }, 400);
  };

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} centered className="dark-theme-modal">
      <div className="p-4 sm:p-6 bg-[#0c0e14] text-neutral-200 rounded-2xl font-mono border border-white/10 -m-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="p-2.5 rounded-lg bg-[#9cbbf8]/10 text-[#9cbbf8] border border-[#9cbbf8]/20">
            <FileBox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              IMPORT CUSTOM 3D CAR MODEL
            </h3>
            <p className="text-[11px] text-neutral-400">
              Format yang didukung: .GLB, .GLTF, .FBX (Turntable Stage Auto-Centering)
            </p>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#9cbbf8] bg-[#9cbbf8]/10 scale-[0.99]"
              : selectedFile
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf,.fbx"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-300">
              {selectedFile ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
              ) : (
                <UploadCloud className="w-6 h-6 text-[#9cbbf8]" />
              )}
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-white tracking-wide">{selectedFile.name}</p>
                <p className="text-xs text-emerald-400 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • File Ready
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-neutral-200">
                  Tarik & Lepas file 3D mobil Anda di sini
                </p>
                <p className="text-xs text-neutral-400 mt-1">atau klik untuk memilih dari komputer</p>
              </div>
            )}
          </div>
        </div>

        {/* Scale Adjuster Slider */}
        <div className="mt-5 p-3.5 bg-[#141720] rounded-xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#9cbbf8]" />
              <span>Model Scale Multiplier</span>
            </span>
            <span className="text-[#9cbbf8] font-bold">{scaleFactor.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#9cbbf8]"
          />
        </div>

        {/* Helper Note */}
        <div className="mt-4 p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg text-[11px] text-neutral-300 leading-relaxed flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-[#9cbbf8] shrink-0 mt-0.5" />
          <span>
            Model Anda akan otomatis diposisikan tepat di atas panggung showroom 3D neon halo.
            Warna cat bodi dan aksesoris velg dapat langsung disesuaikan setelah import!
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white rounded-lg font-bold text-xs uppercase transition-colors"
          >
            BATAL
          </button>
          <button
            onClick={handleImportSubmit}
            disabled={!selectedFile || isProcessing}
            className="flex-1 py-2.5 bg-[#9cbbf8] hover:bg-[#b4ceff] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(156,187,248,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "MEMPROSES MODEL..." : "LOAD KE SHOWROOM"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
