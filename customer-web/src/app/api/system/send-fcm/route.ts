import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      body: messageBody,
      category = "GENERAL",
      targetRole = "ADMIN",
      bookingId,
      tokens = [],
      topic,
      data = {},
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Title and body are required for FCM notification" },
        { status: 400 }
      );
    }

    // 1. Log in Firestore 'notifications' collection for Real-Time Notification Inbox
    const notifDoc = await addDoc(collection(db, "notifications"), {
      title,
      body: messageBody,
      category,
      targetRole,
      bookingId: bookingId || null,
      isUnread: true,
      data,
      createdAt: serverTimestamp(),
      isoTimestamp: new Date().toISOString(),
    });

    // 2. Resolve target tokens if not explicitly passed
    let targetTokens: string[] = Array.isArray(tokens) ? [...tokens] : [];

    if (targetTokens.length === 0 && targetRole === "ADMIN") {
      try {
        const adminTokensSnap = await getDocs(collection(db, "admin_fcm_tokens"));
        adminTokensSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.token && typeof d.token === "string" && !targetTokens.includes(d.token)) {
            targetTokens.push(d.token);
          }
        });
      } catch (e) {
        console.warn("[FCM API] Error retrieving admin_fcm_tokens from Firestore:", e);
      }
    }

    // 3. Dispatch to Google FCM Gateway (Legacy/v1 HTTP) if server key configured
    const serverKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
    let pushDispatched = false;

    if (serverKey && (targetTokens.length > 0 || topic)) {
      try {
        const fcmPayload: Record<string, any> = {
          notification: {
            title,
            body: messageBody,
            sound: "default",
          },
          data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            bookingId: bookingId || "",
            category,
            ...data,
          },
        };

        if (targetTokens.length > 0) {
          fcmPayload.registration_ids = targetTokens;
        } else if (topic) {
          fcmPayload.to = `/topics/${topic}`;
        }

        const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${serverKey}`,
          },
          body: JSON.stringify(fcmPayload),
        });

        pushDispatched = fcmResponse.ok;
      } catch (pushErr) {
        console.warn("[FCM API] Gateway dispatch notice:", pushErr);
      }
    }

    return NextResponse.json({
      success: true,
      notificationId: notifDoc.id,
      recipientCount: targetTokens.length,
      pushDispatched,
      targetRole,
      title,
    });
  } catch (err: any) {
    console.error("[FCM API] send-fcm error:", err);
    return NextResponse.json(
      { error: "Failed to dispatch notification", details: err?.message },
      { status: 500 }
    );
  }
}
