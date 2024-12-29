import liff from "@line/liff";

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้จาก LINE LIFF และจัดเก็บใน localStorage
 */
export const getUserProfile = async () => {
  try {
    // ตรวจสอบใน localStorage ว่ามีข้อมูลผู้ใช้หรือไม่
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      console.log("✅ User profile loaded from localStorage:", JSON.parse(storedProfile));
      return JSON.parse(storedProfile);
    }

    console.log("🔄 Initializing LINE LIFF...");
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

    // ตรวจสอบว่ายังไม่ได้ล็อกอิน
    if (!liff.isLoggedIn()) {
      console.log("🔑 User is not logged in. Redirecting to LINE login...");
      liff.login({ redirectUri: window.location.href }); // Redirect กลับมาที่หน้าเดิมหลังล็อกอิน
      return null;
    }

    // ถ้าล็อกอินแล้ว ให้ดึงข้อมูลโปรไฟล์
    console.log("✅ User is logged in. Fetching profile...");
    const profile = await liff.getProfile();

    console.log("✅ LINE Profile fetched:", profile);
    console.log("🆔 UserID:", profile.userId);
    console.log("👤 Display Name:", profile.displayName);
    console.log("🖼️ Picture URL:", profile.pictureUrl);

    // เก็บข้อมูลผู้ใช้ไว้ใน localStorage
    localStorage.setItem("userProfile", JSON.stringify(profile));

    return profile;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
};

/**
 * ตรวจสอบสถานะการล็อกอิน LINE LIFF
 */
export const isLoggedIn = () => {
  try {
    if (liff.isLoggedIn()) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Error checking login status:", error);
    return false;
  }
};

/**
 * ฟังก์ชันออกจากระบบ
 */
export const logout = () => {
  try {
    liff.logout();
    localStorage.removeItem("userProfile");
    console.log("🚪 User logged out successfully");
    window.location.reload();
  } catch (error) {
    console.error("❌ Error during logout:", error);
  }
};
