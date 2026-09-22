import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  FolderHeart,
  Link2,
  Check,
  Trash2,
  Search,
  Sparkles,
  RefreshCw,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Exercise } from '../../types';
import { getItem, setItem, STORAGE_KEYS } from '../../repositories/storage';
import { useToast } from '../../context/ToastContext';
import { getAssetUrl } from '../../utils/assets';

export interface CustomMediaItem {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
  sizeKb: number;
  assignedExerciseName?: string;
}

export interface ExerciseMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetExercise?: Exercise | null;
  allExercises: Exercise[];
  onSelectImage: (imageUrl: string, exerciseId?: string) => Promise<void> | void;
}

export const ExerciseMediaModal: React.FC<ExerciseMediaModalProps> = ({
  isOpen,
  onClose,
  targetExercise,
  allExercises,
  onSelectImage,
}) => {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'custom' | 'url'>('upload');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(targetExercise?.id || '');

  // Upload Tab state
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSizeKb, setUploadedFileSizeKb] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library Tab state
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('all');

  // Custom Media state
  const [customMediaList, setCustomMediaList] = useState<CustomMediaItem[]>([]);

  // URL Tab state
  const [manualUrl, setManualUrl] = useState('');
  const [urlPreviewValid, setUrlPreviewValid] = useState<boolean | null>(null);

  // Load custom media on mount / open
  useEffect(() => {
    if (isOpen) {
      const stored = getItem<CustomMediaItem[]>(STORAGE_KEYS.CUSTOM_MEDIA, []);
      setCustomMediaList(stored);
      if (targetExercise) {
        setSelectedExerciseId(targetExercise.id);
      } else if (allExercises.length > 0 && !selectedExerciseId) {
        setSelectedExerciseId(allExercises[0].id);
      }
    }
  }, [isOpen, targetExercise, allExercises]);

  // Optimize uploaded image using HTML5 Canvas to 512x512 with proper aspect fit
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Selecione um arquivo de imagem válido (PNG, JPG, WebP ou SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toastError('A imagem selecionada excede 10MB. Selecione uma imagem menor.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetSize = 512;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setUploadedPreview(src);
            setUploadedFileName(file.name);
            setUploadedFileSizeKb(Math.round(file.size / 1024));
            setIsProcessing(false);
            return;
          }

          // Clear transparent canvas
          ctx.clearRect(0, 0, targetSize, targetSize);

          // Calculate aspect ratio containment
          const hRatio = targetSize / img.width;
          const vRatio = targetSize / img.height;
          const ratio = Math.min(hRatio, vRatio);

          const centerShiftX = (targetSize - img.width * ratio) / 2;
          const centerShiftY = (targetSize - img.height * ratio) / 2;

          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShiftX,
            centerShiftY,
            img.width * ratio,
            img.height * ratio
          );

          const optimizedDataUrl = canvas.toDataURL('image/png', 0.92);
          setUploadedPreview(optimizedDataUrl);
          setUploadedFileName(file.name);
          setUploadedFileSizeKb(Math.round(optimizedDataUrl.length / 1024));
          setIsProcessing(false);
        } catch (err) {
          // Fallback to raw data url
          setUploadedPreview(src);
          setUploadedFileName(file.name);
          setUploadedFileSizeKb(Math.round(file.size / 1024));
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        toastError('Não foi possível processar os dados desta imagem.');
        setIsProcessing(false);
      };

      img.src = src;
    };

    reader.onerror = () => {
      toastError('Falha ao ler o arquivo local do computador.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Save new custom uploaded image and apply
  const handleApplyUpload = async () => {
    if (!uploadedPreview) {
      toastError('Nenhuma imagem foi carregada para envio.');
      return;
    }

    const assignedEx = allExercises.find((e) => e.id === selectedExerciseId);
    const assignedName = assignedEx ? assignedEx.name : 'Geral';

    // Save to Custom Media History
    const newItem: CustomMediaItem = {
      id: `media-${Date.now()}`,
      name: uploadedFileName || `Imagem ${assignedName}`,
      dataUrl: uploadedPreview,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      sizeKb: uploadedFileSizeKb || 45,
      assignedExerciseName: assignedName,
    };

    const updatedMedia = [newItem, ...customMediaList.filter((m) => m.name !== newItem.name)];
    setCustomMediaList(updatedMedia);
    setItem(STORAGE_KEYS.CUSTOM_MEDIA, updatedMedia);

    // Apply to selected exercise
    await onSelectImage(uploadedPreview, selectedExerciseId);
    success(`Imagem aplicada com sucesso ao exercício ${assignedName}!`);
    onClose();
  };

  // Apply from system library
  const handleApplyFromLibrary = async (ex: Exercise) => {
    const imgUrl = ex.imageUrl || `/exercises/frames/${ex.id.replace('exercise-', '')}/frame-1.png`;
    await onSelectImage(imgUrl, selectedExerciseId);
    success(`Ilustração de "${ex.name}" aplicada com sucesso!`);
    onClose();
  };

  // Apply from custom media
  const handleApplyCustom = async (item: CustomMediaItem) => {
    await onSelectImage(item.dataUrl, selectedExerciseId);
    success(`Imagem "${item.name}" aplicada com sucesso!`);
    onClose();
  };

  // Delete from custom media history
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = customMediaList.filter((m) => m.id !== id);
    setCustomMediaList(filtered);
    setItem(STORAGE_KEYS.CUSTOM_MEDIA, filtered);
    info('Imagem removida da sua galeria de uploads.');
  };

  // Apply manual URL
  const handleApplyManualUrl = async () => {
    if (!manualUrl.trim()) {
      toastError('Informe a URL da imagem.');
      return;
    }
    await onSelectImage(manualUrl.trim(), selectedExerciseId);
    success('URL da imagem aplicada com sucesso!');
    onClose();
  };

  // Filtered system library exercises
  const filteredLibraryExercises = useMemo(() => {
    const q = librarySearch.toLowerCase().trim();
    return allExercises.filter((ex) => {
      const matchesSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(q));
      const matchesCat = libraryCategory === 'all' || ex.category === libraryCategory;
      return matchesSearch && matchesCat;
    });
  }, [allExercises, librarySearch, libraryCategory]);

  const activeAssignedExercise = allExercises.find((e) => e.id === selectedExerciseId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Central de Mídia & Imagens dos Exercícios"
      description="Suba novas ilustrações do seu computador, selecione da biblioteca de 302 exercícios ou gerencie imagens enviadas"
      size="xl"
    >
      <div className="space-y-5">
        {/* Selected Exercise Target Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Exercício de Destino:
              </span>
              <span className="text-sm font-bold text-white">
                {activeAssignedExercise?.name || 'Selecione um exercício...'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {activeAssignedExercise?.category} • {activeAssignedExercise?.equipment}
              </span>
            </div>
          </div>

          {/* Destination Selector Dropdown */}
          <div className="w-full sm:w-64">
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              Trocar Exercício Alvo:
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs border border-white/10 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              {allExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border/60 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir do Computador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galeria Geral ({allExercises.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span>Minhas Imagens ({customMediaList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Link Web / URL</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD DO COMPUTADOR */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Dropzone Area Left */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[260px] ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-dark-cardElevated hover:border-emerald-500/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
                    {isProcessing ? (
                      <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-emerald-500" />
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Arraste a foto ou clique para procurar no seu computador
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-xs">
                    Suporta PNG, JPG, WebP ou SVG. A imagem é otimizada automaticamente com proporção 512x512.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs border border-slate-200 dark:border-slate-700">
                      Upload Seguro
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs border border-slate-200 dark:border-slate-700">
                      Resolução 512x512
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-dark-muted flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    Dica: Prefira imagens com fundo transparente ou escuro para harmonizar com o layout do app.
                  </span>
                </div>
              </div>

              {/* Real-time Preview Area Right */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-3xl bg-slate-900 border border-slate-800 text-white min-h-[260px]">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pré-visualização ao Vivo
                    </span>
                    {uploadedPreview && (
                      <Badge variant="success" size="sm">
                        Pronta
                      </Badge>
                    )}
                  </div>

                  {/* Stage */}
                  <div className="w-full h-44 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center p-3 relative">
                    <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                    {uploadedPreview ? (
                      <img
                        src={uploadedPreview}
                        alt="Preview"
                        className="max-w-full max-h-full w-auto h-auto object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      />
                    ) : (
                      <div className="text-center space-y-1 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                        <span className="text-xs block">Nenhuma imagem carregada</span>
                      </div>
                    )}
                  </div>

                  {uploadedPreview && (
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Arquivo:</span>
                        <span className="font-mono truncate max-w-[150px]">{uploadedFileName}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Tamanho Otimizado:</span>
                        <span className="font-mono text-emerald-400">{uploadedFileSizeKb} KB</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setUploadedPreview(null);
                      setUploadedFileName('');
                    }}
                    disabled={!uploadedPreview}
                    className="text-xs flex-1"
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyUpload}
                    disabled={!uploadedPreview || isProcessing}
                    leftIcon={<Check className="w-4 h-4" />}
                    className="text-xs flex-1"
                  >
                    Aplicar ao Exercício
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GALERIA GERAL DE 302 EXERCÍCIOS */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar exercícios por nome, categoria ou músculo..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={libraryCategory}
                onChange={(e) => setLibraryCategory(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Peito">Peito</option>
                <option value="Costas">Costas</option>
                <option value="Pernas">Pernas</option>
                <option value="Ombros">Ombros</option>
                <option value="Bíceps">Bíceps</option>
                <option value="Tríceps">Tríceps</option>
                <option value="Core">Core</option>
                <option value="Cardio">Cardio</option>
                <option value="Mobilidade">Mobilidade</option>
              </select>
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredLibraryExercises.map((ex) => {
                const imgSource = ex.imageUrl || `/exercises/frames/${ex.id.replace('exercise-', '')}/frame-1.png`;
                const resolvedUrl = getAssetUrl(imgSource);

                return (
                  <div
                    key={ex.id}
                    onClick={() => handleApplyFromLibrary(ex)}
                    className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/80 p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-500/10 text-left"
                  >
                    {/* Illustration stage */}
                    <div className="w-full h-24 rounded-xl bg-slate-950 flex items-center justify-center p-2 overflow-hidden mb-2 relative">
                      <img
                        src={resolvedUrl}
                        alt={ex.name}
                        loading="lazy"
                        className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      />
                    </div>

                    <div>
                      <h5 className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {ex.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {ex.category} • {ex.equipment}
                      </span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-emerald-400">Usar Esta</span>
                      <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-emerald-500 text-white flex items-center justify-center transition-colors">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MINHAS IMAGENS PERSONALIZADAS */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {customMediaList.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-dark-cardElevated rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <FolderHeart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Você ainda não subiu imagens personalizadas
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-sm mx-auto">
                    Use a aba "Subir do Computador" para fazer upload de fotos ou ilustrações customizadas. Elas ficarão salvas aqui para reutilização em qualquer treino.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('upload')}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                >
                  Fazer Primeiro Upload
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {customMediaList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleApplyCustom(item)}
                    className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/80 p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg text-left"
                  >
                    <div className="w-full h-24 rounded-xl bg-slate-950 flex items-center justify-center p-2 overflow-hidden mb-2 relative">
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustom(item.id, e)}
                        title="Remover imagem"
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-500 text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <h5 className="text-[11px] font-bold text-white line-clamp-1">
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {item.assignedExerciseName} • {item.sizeKb} KB
                      </span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-emerald-400">Reutilizar</span>
                      <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-emerald-500 text-white flex items-center justify-center transition-colors">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LINK WEB / URL EXTERNA */}
        {activeTab === 'url' && (
          <div className="space-y-4 max-w-lg mx-auto py-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Cole a URL direta da imagem (PNG, JPG, WebP ou SVG):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/minha-imagem.png"
                  value={manualUrl}
                  onChange={(e) => {
                    setManualUrl(e.target.value);
                    setUrlPreviewValid(null);
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {manualUrl && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <span className="text-xs font-bold text-slate-400 block">
                  Teste de Exibição
                </span>
                <div className="w-full h-40 rounded-xl bg-slate-950 flex items-center justify-center p-3">
                  <img
                    src={manualUrl}
                    alt="Preview URL"
                    onLoad={() => setUrlPreviewValid(true)}
                    onError={() => setUrlPreviewValid(false)}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {urlPreviewValid === true && (
                  <Badge variant="success" size="sm">
                    URL Válida e Carregada
                  </Badge>
                )}
                {urlPreviewValid === false && (
                  <Badge variant="danger" size="sm">
                    Erro ao carregar a imagem desta URL
                  </Badge>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyManualUrl}
                disabled={!manualUrl.trim() || urlPreviewValid === false}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Salvar URL no Exercício
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
