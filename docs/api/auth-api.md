# Auth api문서

---

## 1. 최초 로그인
### POST /auth/sign-in
권한: PUBLIC (인증 불필요)

설명:
관리자(admin)가 username과 password를 이용하여 로그인한다.
로그인 성공 시 Access Token을 Response Body로 반환하고, Refresh Token을 HttpOnly Cookie로 발급한다.

또한 계정이 최초 로그인 상태 (must_change_password=true) 인 경우
비밀번호 변경이 필요함을 응답으로 전달한다.

---
### Request Body
```json
{
  "username": "store_admin",
  "password": "password123"
}
```
---
### Response Body

```json
{"access-token": "어세스토큰",
  "mustChangePassword": true
}
```