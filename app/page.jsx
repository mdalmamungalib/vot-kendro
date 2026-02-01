"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Loader2, Info, MapPin, User, Calendar } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utility to convert Bengali digits to English digits (for normalizing input)
const toEnglishNumber = (str) => {
  const bengaliToEnglish = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };
  return str.replace(/[০-৯]/g, (w) => bengaliToEnglish[w]);
};

export default function VoterSearch() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS93uepLcBaQlvFY_p_icygYwc8sR2C2cYviKkYcnsahEHCpvhTP0aM2mqMv6xHuph2w0EcNL9Ex4h7/pub?gid=1809482357&single=true&output=csv";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setResults(null);
    setError("");

    try {
      // Fetch the CSV data
      Papa.parse(GOOGLE_SHEET_CSV_URL, {
        download: true,
        header: true,
        complete: (results) => {
          const allVoters = results.data;
          console.log("Fetched Data:", allVoters); // For debugging

          // Normalize Search Input
          const searchId = data.voter_id.trim();
          const normalizedInput = toEnglishNumber(searchId);
          
          // Search Logic
          const found = allVoters.find(
            (v) => v.voter_id && toEnglishNumber(v.voter_id.toString()) === normalizedInput
          );

          if (found) {
            // Map CSV columns to UI structure
            // CSV Columns: voter_id, name, serial_no, father_name, mother_name, occupation, dob, address, polling_station, ward_no, area_no, post_code
            const formattedResult = {
              ...found,
              date_of_birth: found.dob, // Map 'dob' to 'date_of_birth'
              election_info: {
                polling_station: found.polling_station,
                ward_no: found.ward_no,
                voter_area_no: found.area_no, // Map 'area_no' to 'voter_area_no'
                post_code: found.post_code
              }
            };
            
            setResults(formattedResult);
            setIsDialogOpen(true);
            setLoading(false);
          } else {
            setError("দুঃখিত, এই নম্বরে কোনো ভোটার পাওয়া যায়নি।");
            setLoading(false);
          }
        },
        error: (err) => {
          console.error("CSV Parse Error:", err);
          setError("তথ্য লোড করতে সমস্যা হয়েছে।");
          setLoading(false);
        }
      });
      
    } catch (err) {
      console.error(err);
      setError("তথ্য অনুসন্ধানে সমস্যা হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 font-sans relative"
      style={{
        backgroundImage: "url('/background_image.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/20 dark:bg-black/80 backdrop-blur-sm" />
      
      <div className="w-full max-w-lg space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
            ভোটকেন্দ্র তথ্য সেবা
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            দ্রুত এবং সহজে আপনার ভোটকেন্দ্রের বিস্তারিত জানুন
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200 dark:shadow-none bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              তথ্য অনুসন্ধান করুন
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              আপনার ১০ বা ১৩/১৭ সংখ্যার ভোটার আইডি নম্বরটি নিচে লিখুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="voter_id" className="text-slate-700 dark:text-slate-300 font-medium">
                  জাতীয় পরিচয়পত্র / ভোটার নম্বর
                </Label>
                <div className="relative group">
                  <Input
                    {...register("voter_id", { required: true })}
                    id="voter_id"
                    type="text"
                    placeholder="উদাহরণ: 470189317002" 
                    className="pl-10 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 transition-all text-lg tracking-wide"
                  />
                  <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                {errors.voter_id && (
                  <p className="text-sm text-red-500 animate-pulse">
                    ভোটার নম্বর দেওয়া আবশ্যক
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    অনুসন্ধান করা হচ্ছে...
                  </>
                ) : (
                  "তথ্য খুঁজুন"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 text-center animate-in fade-in slide-in-from-bottom-2">
            <p className="font-medium flex items-center justify-center gap-2">
              <Info className="w-5 h-5" /> {error}
            </p>
          </div>
        )}

        {/* Results Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl w-full p-0 overflow-hidden bg-white dark:bg-slate-900 border-none sm:rounded-2xl shadow-2xl">
            {results && (
              <>
                <DialogHeader className="sr-only">
                  <DialogTitle>Voter Details for {results.name}</DialogTitle>
                  <DialogDescription>Details including ID, address, and polling station.</DialogDescription>
                </DialogHeader>
                
                <div className="bg-blue-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                      {results.name}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-3">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2 border border-white/10">
                            ID: {results.voter_id}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-white/10">
                            {results.occupation}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Personal Info */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-white/5">
                            
                            <div className="space-y-1.5">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">পিতার নাম</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-lg">{results.father_name}</p>
                            </div>
                            
                            <div className="space-y-1.5">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">মাতার নাম</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-lg">{results.mother_name}</p>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> জন্ম তারিখ
                                </p>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{results.date_of_birth}</p>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">ক্রমিক নং</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{results.serial_no}</p>
                            </div>
                            
                            <div className="space-y-1.5 sm:col-span-2">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> ঠিকানা
                                </p>
                                <p className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed text-base">{results.address}</p>
                            </div>
                        </div>

                        {/* Election Info */}
                        <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10">
                            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <div className="h-px flex-1 bg-blue-200 dark:bg-blue-800"></div>
                                নির্বাচনী তথ্য
                                <div className="h-px flex-1 bg-blue-200 dark:bg-blue-800"></div>
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                <div className="col-span-1 sm:col-span-2 bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-950 dark:to-blue-950/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                    <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">ভোটকেন্দ্রের নাম</p>
                                    <p className="font-bold text-blue-900 dark:text-blue-100 text-xl leading-snug">
                                        {results.election_info.polling_station}
                                    </p>
                                </div>

                                <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 mb-1">ওয়ার্ড নং</p>
                                    <p className="font-bold text-slate-900 dark:text-slate-200 text-lg">{results.election_info.ward_no}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 mb-1">ভোটার এলাকা নং</p>
                                    <p className="font-bold text-slate-900 dark:text-slate-200 text-lg">{results.election_info.voter_area_no}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}