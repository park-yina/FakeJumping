# SuperAdmin API 문서

---

## 1. 매장 생성

### POST /api/stores

권한: SUPER_ADMIN

설명:  
새로운 매장을 생성한다. 매장 생성은 SUPER_ADMIN만 가능하다.

---

### Request Headers

Authorization: Bearer {accessToken}  
Content-Type: application/json

---

### Request Body

```json
{
  "name": "강남점",
  "region": "서울",
  "address": "서울시 강남구 테헤란로 123"
}
```

---

### Response

#### 201 Created

```json
{
  "id": 1,
  "name": "강남점",
  "region": "서울",
  "address": "서울시 강남구 테헤란로 123",
  "createdAt": "2026-02-25T10:30:00"
}
```

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락
- 매장명 중복

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

---

## 2. 매장 조회

### GET /api/stores

권한: SUPER_ADMIN

설명:  
등록된 매장 목록을 조회한다.  
기본적으로 활성 매장(isActive = true)만 반환한다.  
includeInactive 옵션을 통해 폐업 매장을 포함하여 조회할 수 있다.

---

### Request Headers

Authorization: Bearer {accessToken}

---

### Query Parameters (선택)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| region | String | 특정 지역 필터 |
| includeInactive | Boolean | 폐업 매장 포함 여부 |

---

### Response

#### 200 OK

```json
{
  "content": [
    {
      "id": 1,
      "name": "강남점",
      "region": "서울",
      "address": "서울시 강남구 테헤란로 123",
      "createdAt": "2026-02-25T10:30:00",
      "isActive": false,
      "closedAt": "2026-01-10T15:00:00"
    }
  ]
}
```

---

### 예외 상황

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- 권한 없음

---

## 3. 매장 수정

### PUT /api/stores/{storeId}

권한: SUPER_ADMIN

설명:  
등록된 매장의 정보를 수정한다.  
storeId에 해당하는 매장이 존재해야 한다.

---

### Request Headers

Authorization: Bearer {accessToken}  
Content-Type: application/json

---

### Path Variable

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| storeId | Long | 수정할 매장 ID |

---

### Request Body

```json
{
  "name": "강남점2",
  "region": "서울",
  "address": "서울시 송파구 올림픽로 100"
}
```

---

### Response

#### 200 OK

```json
{
  "id": 1,
  "name": "강남점2",
  "region": "서울",
  "address": "서울시 송파구 올림픽로 100",
  "createdAt": "2026-02-25T10:30:00"
}
```

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

#### 404 Not Found
- 존재하지 않는 매장 ID

---

## 4. 매장 삭제 (Soft Delete)

### DELETE /api/stores/{storeId}

권한: SUPER_ADMIN

설명:  
해당 매장을 폐업 처리한다.  
실제 데이터는 삭제되지 않으며, isActive를 false로 변경하고 closedAt을 현재 시간으로 저장한다.

---

### Request Headers

Authorization: Bearer {accessToken}

---

### Path Variable

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| storeId | Long | 삭제할 매장 ID |

---

### Response

#### 204 No Content

---

### 예외 상황

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

#### 404 Not Found
- 존재하지 않는 매장 ID

---

## 5. 매장 운영자 생성

### POST /api/admins/store

권한: SUPER_ADMIN

설명:  
특정 매장에 소속된 운영자 계정을 생성한다.  
생성되는 계정의 role은 STORE_ADMIN으로 고정된다.

---

### Request Headers

Authorization: Bearer {accessToken}  
Content-Type: application/json

---

### Request Body

```json
{
  "storeId": 1,
  "username": "fake01",
  "password": "fake01"
}
```

---

### Response

#### 201 Created

```json
{
  "id": 10,
  "storeId": 1,
  "username": "fake01",
  "role": "STORE_ADMIN",
  "createdAt": "2026-02-25T11:30:00"
}
```

※ 비밀번호는 서버에서 단방향 해시(BCrypt 등) 처리 후 저장되며,
원문 비밀번호는 저장하지 않는다.

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락
- 존재하지 않는 storeId
- username 중복

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

---

## 6. 시즌 생성

### POST /api/seasons

권한: SUPER_ADMIN

설명:  
새로운 시즌을 생성한다.  
시즌 기간은 기존 시즌과 중복될 수 없다.

---

### Request Headers

Authorization: Bearer {accessToken}  
Content-Type: application/json

---

### Request Body

```json
{
  "name": "2026 Spring Season",
  "startDate": "2026-03-01T00:00:00",
  "endDate": "2026-05-31T23:59:59"
}
```

---

### Response

#### 201 Created

```json
{
  "id": 3,
  "name": "2026 Spring Season",
  "startDate": "2026-03-01T00:00:00",
  "endDate": "2026-05-31T23:59:59",
  "createdAt": "2026-02-25T12:30:00"
}
```

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락
- startDate가 endDate보다 이후일 경우
- 기존 시즌과 기간이 중복되는 경우
- 시즌명 중복 (정책에 따라)

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

---

## 7. 시즌 조회

### GET /api/seasons

권한: SUPER_ADMIN

설명:  
시즌 목록을 조회한다.  
기본적으로 현재 활성(ACTIVE) 시즌만 반환한다.  
status 파라미터를 통해 특정 상태의 시즌을 조회할 수 있다.

---

### Request Headers

Authorization: Bearer {accessToken}

---

### Query Parameters (선택)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| status | String | 조회할 시즌 상태 (UPCOMING, ACTIVE, ENDED) |

※ status 미지정 시 ACTIVE 시즌만 반환

---

### Response

#### 200 OK

```json
{
  "content": [
    {
      "id": 3,
      "name": "2026 Spring Season",
      "startDate": "2026-03-01T00:00:00",
      "endDate": "2026-05-31T23:59:59",
      "createdAt": "2026-02-25T12:30:00",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 예외 상황

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- 권한 없음

---

## 8. 맵 생성

### POST /api/maps

권한: SUPER_ADMIN

설명:  
새로운 맵을 생성한다.

---

### Request Headers

Authorization: Bearer {accessToken}  
Content-Type: application/json

---

### Request Body

```json
{
  "name": "Desert Jump",
  "description": "사막 테마의 점프 맵",
  "size": "MEDIUM",
  "orderNum": 1
}
```

※ isActive는 기본값 true로 설정된다.

---

### Response

#### 201 Created

```json
{
  "id": 1,
  "name": "Desert Jump",
  "description": "사막 테마의 점프 맵",
  "size": "MEDIUM",
  "orderNum": 1,
  "isActive": true,
  "createdAt": "2026-02-25T10:30:00"
}
```

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락
- 맵 이름 중복
- size 또는 difficulty 값이 유효하지 않음

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님
---
## 9. 맵 수정

### PUT /api/maps/{mapId}

권한: SUPER_ADMIN

설명:  
등록된 맵 정보를 수정한다.  
mapId에 해당하는 맵이 존재해야 한다.

---

### Request Headers

Authorization: Bearer {accessToken}  
Content-Type: application/json

---

### Path Variable

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| mapId | Long | 수정할 맵 ID |

---

### Request Body

```json
{
  "name": "Desert Jump Updated",
  "description": "사막 테마 점프 맵 (업데이트)",
  "size": "LARGE",
  "difficulty": "HARD",
  "orderNum": 2
}
```

---

### Response

#### 200 OK

```json
{
  "id": 1,
  "name": "Desert Jump Updated",
  "description": "사막 테마 점프 맵 (업데이트)",
  "size": "LARGE",
  "difficulty": "HARD",
  "orderNum": 2,
  "isActive": true,
  "createdAt": "2026-02-25T10:30:00"
}
```

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락
- size 또는 difficulty 값이 유효하지 않음

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

#### 404 Not Found
- 존재하지 않는 맵 ID

---

## 10. 맵 삭제 (Soft Delete)

### DELETE /api/maps/{mapId}

권한: SUPER_ADMIN

설명:  
해당 맵을 비활성화 처리한다.  
실제 데이터는 삭제되지 않으며, isDelete를 false로 변경한다.

---

### Request Headers

Authorization: Bearer {accessToken}

---

### Path Variable

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| mapId | Long | 삭제할 맵 ID |

---

### Response

#### 204 No Content

---

### 예외 상황

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- SUPER_ADMIN 권한이 아님

#### 404 Not Found
- 존재하지 않는 맵 ID

---

## 11. 맵 조회

### GET /api/maps

권한: SUPER_ADMIN, STORE_ADMIN

설명:  
등록된 맵 목록을 조회한다.  
기본적으로 활성 맵(isDelete = true)만 반환한다.  
SUPER_ADMIN은 includeInactive 옵션을 통해 비활성 맵을 포함하여 조회할 수 있다.

---

### Request Headers

Authorization: Bearer {accessToken}

---

### Query Parameters (선택)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| includeInactive | Boolean | 비활성 맵 포함 여부 (SUPER_ADMIN 전용) |

---

### Response

#### 200 OK

```json
{
  "content": [
    {
      "id": 1,
      "name": "Desert Jump",
      "description": "사막 테마의 점프 맵",
      "size": "MEDIUM",
      "difficulty": "NORMAL",
      "orderNum": 1,
      "isActive": true,
      "createdAt": "2026-02-25T10:30:00"
    }
  ]
}
```

---

### 예외 상황

#### 401 Unauthorized
- 토큰 없음
- 토큰 만료

#### 403 Forbidden
- 권한 없음