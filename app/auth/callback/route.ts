import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const errorDescription = searchParams.get("error_description");

  // Kasus 1: Supabase/Google sudah mengirim error lewat query param
  // (misalnya redirect URL tidak terdaftar, user menolak consent, dll).
  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Kasus 2: exchangeCodeForSession gagal (code sudah dipakai/kedaluwarsa,
    // code_verifier cookie hilang/tidak cocok, dsb). Sebelumnya error ini
    // diabaikan sehingga user tetap "berhasil" diarahkan ke homepage padahal
    // sesi login TIDAK terbentuk — inilah yang menyebabkan Navbar/Profil
    // tetap menunjukkan status belum login.
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // Tidak ada code maupun error — request tidak valid, jangan anggap sukses.
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Kode otorisasi tidak ditemukan.")}`);
}
