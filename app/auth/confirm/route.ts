import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let confirmed = false;
  let role: string | undefined;

  if (code) {
    // Default Supabase email link (PKCE flow)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      confirmed = true;
      role = data.user?.user_metadata?.role;
    }
  } else if (tokenHash && type) {
    // Custom template link (we'll use this later, once SMTP is set up)
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      confirmed = true;
      role = data.user?.user_metadata?.role;
    }
  }

  if (confirmed) {
    const destination = role === "scholar" ? "/scholars/profile" : "/";
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // Expired / already-used / invalid link
  return NextResponse.redirect(`${origin}/login`);
}