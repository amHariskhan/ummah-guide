import Link from "next/link";
import { GraduationCap, Clock, ArrowRight, BadgeCheck } from "lucide-react";

type Props = {
  id: string;
  name: string;
  specialty: string;
  qualification?: string | null;
  experienceYears?: number | null;
  bio?: string | null;
};

export default function ScholarCard({
  id,
  name,
  specialty,
  qualification,
  experienceYears,
  bio,
}: Props) {
  return (
    <Link
      href={`/scholars/${id}`}
      className="group relative block h-full rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gold-300 hover:shadow-xl hover:shadow-emerald-900/10"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-700 to-teal-600 font-heading text-2xl font-bold text-white ring-2 ring-gold-400/70">
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-emerald-950">
            {name}
          </h3>
          <p className="flex items-center gap-1 text-sm font-medium text-emerald-700">
            <BadgeCheck className="h-4 w-4 text-gold-500" />
            Verified
          </p>
        </div>
      </div>

      <span className="mt-5 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
        {specialty}
      </span>

      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        {qualification && (
          <li className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 shrink-0 text-emerald-700" />
            <span className="truncate">{qualification}</span>
          </li>
        )}
        {experienceYears != null && (
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-emerald-700" />
            {experienceYears} years experience
          </li>
        )}
      </ul>

      {bio && (
        <p className="mt-4 line-clamp-3 leading-relaxed text-gray-600">{bio}</p>
      )}

      <span className="mt-6 flex items-center gap-2 font-semibold text-emerald-700 transition-colors group-hover:text-emerald-900">
        View profile
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}