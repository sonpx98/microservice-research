# 🚀 PROJECT PLAN: REALTIME CO-BROWSING APP
**Stack:** React (Next.js) + Supabase (Auth/DB/Realtime) + WebRTC (Native)
**Goal:** Ứng dụng chia sẻ màn hình 1-1, cho phép chuyển quyền Host linh hoạt.

---

## 🟢 PHASE 1: SUPABASE SETUP & INFRASTRUCTURE
*Mục tiêu: Thiết lập Database để quản lý phòng chat và trạng thái Host.*

### 1. Database Schema
Vào Supabase SQL Editor, chạy script này để tạo bảng:
- [ ] **Tạo bảng `rooms`**:
  ```sql
  create table rooms (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    host_id uuid, -- ID của người đang Share màn hình
    viewer_id uuid, -- ID của người xem (nếu giới hạn 1-1)
    status text default 'waiting' -- 'waiting', 'active'
  );
  ```

### 2. Row Level Security (RLS) & Realtime

* [ ] **Bật Realtime**: Vào Database -> Replication -> Tích chọn bảng `rooms`.
* [ ] **Thiết lập RLS**:
    * Enable RLS cho bảng `rooms`.
    * Policy "Public Access" (Để test nhanh): `CREATE POLICY "Enable all access" ON "public"."rooms" FOR ALL USING (true);`
    * *(Sau này production sẽ sửa lại Policy theo Auth UID)*.



### 3. Client Init

* [ ] Khởi tạo route Next.js: `packages/blog-shell/src/app/[locale]/tools/co-browsing/page.tsx`.
* [ ] Cài đặt SDK: `pnpm add @supabase/supabase-js` (tại packages/blog-shell).
* [ ] Tạo file `supabaseClient.ts` và config `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

---

## 🟡 PHASE 2: SIGNALING & WEBRTC CORE

*Mục tiêu: Hai máy A và B kết nối được với nhau (P2P).*

### 1. Signaling Mechanism (Dùng Supabase Broadcast)

*Dữ liệu SDP/ICE Candidate không cần lưu vào DB, dùng Broadcast cho nhanh.*

* [ ] Tạo hook/function `useWebRTC(roomId)`:
    * [ ] Khởi tạo `supabase.channel('room_x')`.
    * [ ] Lắng nghe event `broadcast`: `signal` (chứa SDP offer/answer/ice).



### 2. Logic WebRTC (Máy Host - Sender)

* [ ] Viết hàm `startCapture()`:
    * Dùng `navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })`.


* [ ] Tạo `RTCPeerConnection` (Config STUN server google: `stun:stun.l.google.com:19302`).
* [ ] Add Track từ stream vào PeerConnection.
* [ ] Tạo **Offer** -> `setLocalDescription` -> Gửi Offer qua Supabase Broadcast.

### 3. Logic WebRTC (Máy Viewer - Receiver)

* [ ] Lắng nghe Broadcast "Offer" từ Host.
* [ ] `setRemoteDescription` (Offer).
* [ ] Tạo **Answer** -> `setLocalDescription` -> Gửi Answer qua Supabase Broadcast.
* [ ] Lắng nghe event `ontrack` -> Gắn stream nhận được vào thẻ `<video autoplay />`.

### 4. ICE Candidate Handling (Cả 2 máy)

* [ ] Lắng nghe event `onicecandidate` của PeerConnection -> Gửi qua Supabase Broadcast.
* [ ] Khi nhận Broadcast "New ICE" -> Gọi `addIceCandidate()`.

---

## 🔴 PHASE 3: HOST SWITCHING & INTERACTION

*Mục tiêu: Chuyển quyền "cầm mic" giữa 2 người.*

### 1. Quản lý State "Ai là Host?"

* [ ] **Subscribe bảng `rooms`**:
    * Frontend lắng nghe thay đổi của cột `host_id`.


* [ ] **Logic UI**:
    * Nếu `my_id === host_id`: Hiển thị nút "Stop Share".
    * Nếu `my_id !== host_id`: Hiển thị nút "Request Host" (hoặc "Take Control").



### 2. Logic Chuyển Host (Switching)

* [ ] **Action: Người xem bấm "Take Control"**:
    * Gọi API update `rooms`: `UPDATE rooms SET host_id = 'my_uuid' WHERE id = 'room_id'`.


* [ ] **Phản ứng (Realtime)**:
    * **Người Host cũ (A)**: Nhận event DB change -> Gọi `stopCapture()` -> Đóng PeerConnection cũ -> Chuyển UI sang chế độ "Waiting for stream".
    * **Người Host mới (B)**: Nhận event DB change -> Trigger hàm `startCapture()` -> Khởi tạo quy trình WebRTC Offer lại từ đầu.



---

## ⚡ PRO TIPS & CHECKLIST

* [ ] **Audio Echo**: Khi test trên cùng 1 máy (2 tab), nhớ tắt tiếng (Mute) thẻ video người nhận, nếu không sẽ bị hú âm thanh.
* [ ] **Cleanup**: Cực kỳ quan trọng. Khi user thoát hoặc đổi host, phải gọi:
  ```js
  stream.getTracks().forEach(track => track.stop());
  peerConnection.close();
  supabase.removeChannel(channel);
  ```


* [ ] **STUN/TURN**: Nếu test giữa 2 mạng Wifi khác nhau mà không kết nối được, có thể do tường lửa. Lúc đó sẽ cần config thêm TURN server (nhưng để dev thì STUN google là đủ).
