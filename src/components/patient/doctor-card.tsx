import Link from "next/link";
import { User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DoctorSummary } from "@/types/appointments";

export function DoctorCard({ doctor, viewMode = "summary" }: { doctor: DoctorSummary, viewMode?: "summary" | "detail" }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-100 text-teal-900 font-bold uppercase">
            {doctor.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doctor.profileImageUrl} alt={`Dr. ${doctor.displayName}`} className="size-full object-cover" />
            ) : (
              doctor.displayName.replace("Dr. ", "").charAt(0)
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 line-clamp-1">{doctor.displayName}</h2>
            <p className="font-medium text-teal-700 text-sm line-clamp-1">{doctor.specializationName}</p>
          </div>
        </div>
        {doctor.verified && (
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
            <CheckCircle2 className="size-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wide">Verified</span>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 text-sm flex-1">
        <div>
          <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Institution</dt>
          <dd className="font-medium text-slate-900 line-clamp-1">{doctor.hospitalName}</dd>
          <dd className="text-slate-600 line-clamp-1 text-[13px]">{doctor.departmentName}</dd>
        </div>
        
        {viewMode === "detail" && (
          <>
            <div>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Qualifications</dt>
              <dd className="font-medium text-slate-900 line-clamp-2">{doctor.qualifications}</dd>
            </div>
            {doctor.yearsOfExperience > 0 && (
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Experience</dt>
                <dd className="font-medium text-slate-900">{doctor.yearsOfExperience} years</dd>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/patient/doctors/${doctor.doctorProfileId}`}>
            View Profile
          </Link>
        </Button>
      </div>
    </article>
  );
}
