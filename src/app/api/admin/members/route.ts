```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function isAdminLoggedIn() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}

export async function GET() {
  try {
    if (!(await isAdminLoggedIn())) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase members load error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: data ?? [] });
  } catch (error) {
    console.error("Admin members GET error:", error);

    return NextResponse.json(
      { error: "Server error while loading members." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdminLoggedIn())) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status;

    if (
      !id ||
      (status !== "approved" && status !== "rejected")
    ) {
      return NextResponse.json(
        { error: "Invalid member ID or status." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("members")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase member update error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ member: data });
  } catch (error) {
    console.error("Admin members PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to process the request." },
      { status: 400 }
    );
  }
}
```
