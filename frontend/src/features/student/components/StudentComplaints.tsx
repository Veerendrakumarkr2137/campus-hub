import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  AlertCircle, 
  FileText,
  Search,
  ChevronRight,
  Camera,
  Paperclip,
  ChevronDown,
  X,
  FlipHorizontal,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'MAINTENANCE', label: 'Maintenance', icon: '🛠️' },
  { id: 'IT_SUPPORT', label: 'IT Support', icon: '💻' },
  { id: 'ACADEMIC', label: 'Academic Issues', icon: '📚' },
  { id: 'HOSTEL', label: 'Hostel & Food', icon: '🏠' },
  { id: 'FINANCIAL', label: 'Finance & Fees', icon: '💰' },
  { id: 'SPORTS', label: 'Sports & Gym', icon: '🏀' },
  { id: 'TRANSPORT', label: 'Transport', icon: '🚌' },
  { id: 'OTHER', label: 'Other', icon: '📋' },
];

export default function StudentComplaints({ userId }: { userId: string }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [category, setCategory] = useState('MAINTENANCE');
  const [otherReason, setOtherReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchComplaints();
    return () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [userId]);

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setComplaints(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Camera logic
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setAttachment(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setLoading(true);
    setMsg(null);
    try {
      let attachmentUrl = null;
      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('complaint-attachments')
          .upload(fileName, attachment);
        
        if (!uploadError && data) {
           attachmentUrl = data.path;
        }
      }

      const finalCategory = category === 'OTHER' ? `OTHER: ${otherReason}` : category;

      const { error } = await supabase.from('service_requests').insert([{
        user_id: userId,
        category: finalCategory,
        description: description.trim(),
        attachment_url: attachmentUrl
      }]);

      if (error) throw error;
      setMsg({ type: 'success', text: 'Request submitted successfully!' });
      setDescription('');
      setOtherReason('');
      setAttachment(null);
      setPreviewUrl(null);
      fetchComplaints();
    } catch (err: any) {
      setMsg({ type: 'error', text: `Failed to submit: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.id === category);

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Raising Section */}
        <div className="lg:col-span-2 space-y-6">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 relative"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <PlusCircle className="w-6 h-6 mr-3 text-emerald-400"/> Raise Request
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Submit your concern with attachments.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence>
                  {msg && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-xl text-sm flex items-center space-x-3 ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
                    >
                      {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      <span>{msg.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="glass-input w-full flex items-center justify-between px-4 py-3 bg-white/5 border-white/10 text-sm hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{selectedCat?.icon}</span>
                        <span className="text-slate-200">{selectedCat?.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-[999] w-full mt-2 bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                        >
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setCategory(cat.id);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm text-slate-300 bg-slate-950 border-b border-white/5 last:border-0"
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Other Reason Field (Conditional) */}
                  <AnimatePresence>
                    {category === 'OTHER' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Specify Reason</label>
                        <input 
                          type="text" 
                          required={category === 'OTHER'}
                          value={otherReason}
                          onChange={(e) => setOtherReason(e.target.value)}
                          className="glass-input w-full text-sm py-3"
                          placeholder="What is this request about?"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Issue Description</label>
                  <textarea 
                    required 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="glass-input w-full h-32 resize-none text-sm p-4" 
                    placeholder="Describe your issue in detail..." 
                  />
                </div>

                {/* Attachments Section */}
                <div className="flex flex-wrap gap-4 items-center">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>Attach File</span>
                  </button>

                  <button 
                    type="button"
                    onClick={startCamera}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  {attachment && (
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold animate-pulse">
                      {previewUrl ? <img src={previewUrl} className="w-4 h-4 rounded object-cover" /> : <FileText className="w-3 h-3" />}
                      <span className="truncate max-w-[100px]">{attachment.name}</span>
                      <button onClick={() => { setAttachment(null); setPreviewUrl(null); }}><X className="w-3 h-3 hover:text-white" /></button>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading || !description.trim()} 
                    className="glass-button bg-emerald-600 hover:bg-emerald-500 w-full md:w-auto px-12 py-3 font-bold text-sm shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400"/> History
              </h3>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
              {complaints.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center py-8">No records found.</p>
              ) : (
                complaints.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider truncate mr-2">{c.category}</p>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${c.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {c.status}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">"{c.description}"</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-[9px] text-slate-600">{new Date(c.created_at).toLocaleDateString()}</span>
                      {c.attachment_url && <Paperclip className="w-3 h-3 text-blue-400" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>

      </div>

      {/* Camera Hub Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel w-full max-w-lg overflow-hidden border-white/20 shadow-2xl bg-black"
            >
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Live Feed</span>
                </div>
                <button 
                  onClick={stopCamera}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">Camera Hub</h3>
                  <p className="text-slate-400 text-sm mt-1">Point your camera at the issue and capture.</p>
                </div>

                <div className="flex items-center space-x-8">
                   <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/5">
                      <FlipHorizontal className="w-6 h-6" />
                   </button>
                   <button 
                    onClick={capturePhoto}
                    className="h-20 w-20 rounded-full border-4 border-white/20 p-1 hover:scale-105 transition-transform"
                   >
                     <div className="h-full w-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center">
                        <Camera className="w-8 h-8 text-black" />
                     </div>
                   </button>
                   <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/5">
                      <RefreshCw className="w-6 h-6" />
                   </button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
                
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  High Resolution Capture Enabled
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
