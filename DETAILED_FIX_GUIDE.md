# 🔧 HƯỚNG DẪN KHẮC PHỤC BUG MULTI-USER (Chi Tiết)

## ⚠️ Tình Trạng Hiện Tại
✅ Code đã được fix
✅ Test route đã được tạo  
⏳ **Migration chưa apply** ← **CẦN LÀMLẤY!**

## 🎯 Vấn Đề
**"Chỉ tạo được một tài khoản"**
- Root cause: Trigger cũ bị RLS chặn khi insert profiles
- Giải pháp: Apply migration fix → trigger sẽ bypass RLS

## ✅ Cách Khắc Phục (2 bước)

### BƯỚC 1: Apply Migration (2-3 phút)

#### Vào Supabase Dashboard
1. Mở: https://supabase.com/dashboard
2. Đăng nhập nếu cần
3. Chọn project "dalat-coffee-mood" (hoặc project của bạn)

#### Vào SQL Editor
1. Left sidebar → **SQL Editor**
2. Hoặc click tên project → SQL Editor tab

#### Paste SQL Migration
1. Mở file: `supabase/migrations/20260531_fix_profile_sync_trigger.sql`
2. Copy **toàn bộ nội dung**
3. Paste vào Supabase SQL Editor

#### Chạy Migration
1. Click **▶️ Run** button (phía trên bên phải)
2. Chờ 2-3 giây
3. Nên thấy message: "Success"

### BƯỚC 2: Chạy Test (1 phút)

Sau khi migration success:

```bash
cd c:\Users\Maxsys\Downloads\2212368_Trần\ Minh\ Hiếu\dalat-coffee-mood

# Chạy test
$env:BASE_URL="http://localhost:3001" ; node scripts/auto-test-auth.js
```

#### Kết Quả Kỳ Vọng
```
✅ FIX SUCCESSFUL - BUG ĐÃ ĐƯỢC KHẮC PHỤC!
✅ Có thể tạo nhiều tài khoản
✅ Tất cả users đều có thể đăng nhập
```

---

## 📋 Chi Tiết Migration SQL

**File:** `supabase/migrations/20260531_fix_profile_sync_trigger.sql`

**Nội dung:**
- ✅ Drop trigger cũ (nguyên nhân lỗi)
- ✅ Drop function cũ
- ✅ Tạo function MỚI với `security definer` (bypass RLS)
- ✅ Tạo trigger mới
- ✅ Sync profiles cho users hiện tại
- ✅ Fix RLS policies

**Kết quả:**
- Trigger MỚI sẽ bypass RLS
- Mọi user mới sẽ có profile được tạo tự động
- Bug "chỉ 1 tài khoản" được khắc phục

---

## 🛠️ Code Fixes (Đã Được Apply)

### File 1: `src/actions/auth.ts`
✅ **signUpAction()** bây giờ:
- Tạo profile **ngay lập tức** (không chỉ phụ thuộc trigger)
- Có fallback nếu trigger fail

### File 2: `src/app/api/test/auth/multi-user-test/route.ts`
✅ **Test route** tạo 3 test users & verify:
- Signup thành công
- Profile được tạo
- Signin hoạt động

### File 3: `scripts/auto-test-auth.js`
✅ **Auto test script** chạy test & báo cáo kết quả

---

## 📊 Test Results Before & After

### ❌ TRƯỚC FIX (Hiện Tại)
```
User 1: ✓ Signup, ? Profile, ? Signin
User 2: ✗ Signup fail - "Database error saving new user"
User 3: ✗ Signup fail - "Database error saving new user"
→ Vấn đề: Trigger cũ bị RLS chặn
```

### ✅ SAU FIX (Dự Kiến)
```
User 1: ✓ Signup, ✓ Profile, ✓ Signin
User 2: ✓ Signup, ✓ Profile, ✓ Signin
User 3: ✓ Signup, ✓ Profile, ✓ Signin
→ Bug được khắc phục!
```

---

## 🔄 Toàn Bộ Quy Trình

```
1. Apply Migration via Supabase Dashboard SQL Editor
   ↓
   Trigger mới có security definer → bypass RLS
   
2. Server đã chạy (port 3001)
   ↓
   signUpAction code đã fix
   
3. Chạy test script
   ↓
   $env:BASE_URL="http://localhost:3001" ; node scripts/auto-test-auth.js
   
4. ✅ Kết quả: 3 users được tạo + đăng nhập thành công
```

---

## ❓ FAQ

**Q: Tôi không thấy "Success" message?**
- A: Kiểm tra lỗi SQL editor. Có thể do syntax error hoặc RLS policy.

**Q: Test vẫn fail sau migration?**
- A: Mất 10-20s để database sync. Chạy lại test sau 20 giây.

**Q: Có cách nào tự động?**
- A: Phải thủ công via Supabase Dashboard vì bảo mật.

**Q: User cũ sẽ bị ảnh hưởng?**
- A: Không, migration dùng `ON CONFLICT` nên không thay đổi existing users.

---

## 📞 Hướng Dẫn Từng Bước (Chi Tiết)

### Step 1: Mở Supabase Dashboard
```
1. Browser → https://supabase.com/dashboard
2. Đăng nhập (nếu chưa)
3. Nên thấy projects list
```

### Step 2: Chọn Project
```
Tìm project có URL: https://fqinphysrwzuopimqfia.supabase.co
Click vào nó
```

### Step 3: Vào SQL Editor
```
Left sidebar → Database → SQL Editor
Hoặc: Lên trên → Click "SQL Editor" tab
```

### Step 4: Tạo Query Mới
```
1. Click "+ New query" button
2. Hoặc paste trực tiếp vào blank query
```

### Step 5: Copy SQL
```
1. Mở file: supabase/migrations/20260531_fix_profile_sync_trigger.sql
2. Ctrl+A → Ctrl+C (copy all)
3. Supabase editor → Ctrl+A → Ctrl+V (paste)
```

### Step 6: Run
```
1. Click ▶️ Run button (trên cùng)
2. Chờ... 
3. Kỳ vọng: "Executed successfully" (✓ green checkmark)
```

### Step 7: Verify
```
1. Mở SQL Editor query mới
2. Paste:
   SELECT COUNT(*) FROM public.profiles;
3. Run
4. Nên thấy: count = 1 (hoặc số users hiện tại)
```

### Step 8: Test
```bash
# Mở PowerShell
cd c:\Users\Maxsys\Downloads\2212368_Trần\ Minh\ Hiếu\dalat-coffee-mood

# Set environment
$env:BASE_URL="http://localhost:3001"

# Run test
node scripts/auto-test-auth.js
```

### Step 9: Check Result
```
Nên thấy:
✅ FIX SUCCESSFUL!
✅ Profiles: 3+ (trước: 1)
✅ All users can signup & signin
```

---

## ✅ Checklist Hoàn Tất

- [ ] Mở https://supabase.com/dashboard
- [ ] Chọn project đúng
- [ ] SQL Editor
- [ ] Copy migration SQL
- [ ] Paste vào editor
- [ ] Run (▶️ button)
- [ ] Đợi "Success" message ✓
- [ ] Server đang chạy (port 3001)
- [ ] Chạy test: `node scripts/auto-test-auth.js`
- [ ] Kết quả: ✅ FIX SUCCESSFUL
- [ ] Done! 🎉

---

## 🎓 Giải Thích Chi Tiết

**Tại sao lỗi này xảy ra?**
```
User 1 signup:
  → auth.signUp() ✓
  → trigger tạo profile (may succeed by luck)
  → signInAction upsert profile (fix partial issue)

User 2+ signup:
  → auth.signUp() ✓
  → trigger cố insert profile
  → RLS policy: DENY ✗
  → Profile không tạo
  → Signup fail: "Database error"
```

**Migration fix cái gì?**
```
Bằng `security definer`, function trigger có thể bypass RLS
Nên insert profile luôn thành công
Dù có bao nhiêu users, profile vẫn được tạo
```

---

## 🚀 Next Steps Sau Fix

1. **Deploy** code lên production
2. **Users** có thể signup/login nhiều lần
3. **Admin** có thể xem tất cả users
4. **Features** khác (Mood-mate, shops, etc.) hoạt động cho all users

---

**Status:** ✅ Ready for Migration Apply

Hãy apply migration ngay! 🚀
