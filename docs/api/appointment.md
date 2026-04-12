# Store Appointment / Status Rule

## 📌 컬럼 정의

- open_at: 오픈 예정일
- closed_at: 폐점일
- is_active: 활성 여부 (1: 활성화 / 0: 비활성)
- ex. 오픈 예정중인 매장 확실(test매장 아님) 오픈 예정일 미등록 매장
  - open_at==null&&is_active=true;
---

## 📌 상태 정의

### 1. PENDING (오픈 미정)
- open_at IS NULL
- is_active = 1

---

### 2. OPEN_SCHEDULED (오픈 예정)
- open_at IS NOT NULL
- open_at > NOW()
- is_active = 1

---

### 3. OPEN (운영중)
- open_at <= NOW()
- closed_at IS NULL
- is_active = 1

---

### 4. CLOSED (폐점)
- closed_at IS NOT NULL
  OR is_active = 0

---

## 📌 API 규칙

### 오픈일 설정

PUT /api/store/{id}/open-date

Request:
{
"openAt": "2026-04-15T10:00:00"
}

Rule:
- 과거 날짜 불가
- 이미 open_at 존재 시 덮어쓰기 정책 필요

---

### 오픈 취소

PUT /api/store/{id}/cancel-open

- open_at → NULL
- 상태 → PENDING

---