'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import StepProgress from '@/components/borrower/StepProgress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 5MB', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 5MB', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('salarySlip', file);
    try {
      await api.post('/application/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploaded(true);
      toast({ title: 'Uploaded successfully!', description: 'Proceeding to loan configuration.' });
      setTimeout(() => router.push('/borrower/apply/loan'), 800);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Upload failed', description: error.response?.data?.message || 'Try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['borrower']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <StepProgress currentStep={1} />

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Upload Salary Slip</CardTitle>
              <CardDescription>Upload your latest salary slip (PDF, JPG, or PNG — max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !file && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {uploaded ? (
                  <div className="flex flex-col items-center gap-3 text-green-600">
                    <CheckCircle className="w-12 h-12" />
                    <p className="font-semibold">Uploaded successfully!</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-12 h-12 text-blue-500" />
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Upload className="w-12 h-12" />
                    <p className="font-medium text-gray-600">Drag & drop or click to browse</p>
                    <p className="text-sm">PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => router.push('/borrower/apply/personal')}>Back</Button>
                <Button className="flex-1" onClick={handleUpload} disabled={!file || loading || uploaded}>
                  {loading ? 'Uploading…' : 'Upload & Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
