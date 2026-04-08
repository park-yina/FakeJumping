# Device API 문서

---

## 1. 매치 기록 저장

### POST /api/device/matches

권한: DEVICE (deviceKey 기반 인증)

설명:  
게임 디바이스가 매치 결과를 서버로 전송한다.  
서버는 X-Device-Key 헤더를 통해 디바이스를 식별한다.  
디바이스에 설정된 size 값을 기준으로 활성 맵을 자동 매핑한다.  
플레이어가 존재하지 않을 경우 자동 생성한다.  
현재 활성 시즌이 존재할 경우 자동으로 시즌을 매핑한다.

---

### Request Headers

Content-Type: application/json  
X-Device-Key: {deviceKey}

---

### Request Body

```json
{
  "playerNickname": "점프왕",
  "difficulty": "HARD",
  "score": 3200,
  "playedAt": "2026-02-25T14:30:00"
}
```

---

### 처리 로직

1. X-Device-Key로 디바이스 조회
2. 디바이스가 활성 상태인지 확인 (isActive = true)
3. 디바이스의 size 값 확인
4. 해당 size에 해당하는 활성 맵 조회 (isActive = true)
5. playerNickname으로 플레이어 조회 (없으면 생성)
6. 현재 ACTIVE 시즌 조회 (없으면 season_id는 NULL)
7. match_log 저장

---

### Response

#### 201 Created

```json
{
  "matchId": 100,
  "storeId": 1,
  "deviceId": 5,
  "playerId": 25,
  "mapId": 2,
  "difficulty": "HARD",
  "score": 3200,
  "seasonId": 3,
  "createdAt": "2026-02-25T14:30:00"
}
```

---

### 예외 상황

#### 400 Bad Request
- 필수 값 누락
- difficulty 값이 유효하지 않음

#### 401 Unauthorized
- X-Device-Key 없음
- 유효하지 않은 deviceKey
- 비활성화된 디바이스

#### 404 Not Found
- 해당 size에 활성 맵이 존재하지 않음