# 짭핑배틀 (Spring + MyBatis)

## 프로젝트 개요

본 프로젝트는 기존에 Firebase + Flask 기반으로 운영되던 점핑배틀 서비스를  
Spring Boot + MyBatis + RDBMS 환경으로 전환한다면 어떻게 설계할 것인가를 고민한 아키텍처 재설계 프로젝트입니다.

단순한 기술 스택 변경이 아니라,  
Document 기반(NoSQL) 구조를 관계형 데이터베이스 구조로 재해석하며 다음과 같은 설계적 질문을 중심으로 진행하였습니다.

- Firebase 기반 랭킹 시스템을 RDBMS로 설계한다면 어떤 테이블 구조가 적절한가?
- 실시간에 가까운 랭킹 갱신을 Spring 환경에서는 어떻게 처리할 수 있는가?
- 동시 업데이트가 발생할 경우 트랜잭션과 락 전략은 어떻게 구성해야 하는가?
- 정렬 및 조회 성능을 고려한 인덱스 전략은 어떻게 설계해야 하는가?

기존 서비스의 도메인 개념(예: 맵 구조 등)은 참고하였으나,  
DB 스키마 구조, 트랜잭션 처리 방식, 동시성 제어 전략은 Spring + SQL 환경에 맞추어 전면 재설계하였습니다.

본 프로젝트의 목적은 단순 구현이 아니라,  
실제 운영 경험이 있는 서비스를 다른 아키텍처 관점에서 재해석하며 설계 사고를 확장하는 데 있습니다.
## 구현 내용
# 🏪 FakeJumping Admin System

매장 및 관리자 계정을 효율적으로 관리하기 위한 **관리자 시스템(Admin Dashboard)** 입니다.  
SUPER_ADMIN을 중심으로 매장 생성, 관리자 관리, 통계 시각화를 제공합니다.

---

## 🚀 주요 기능

### 🏪 1. 매장 관리 (SUPER_ADMIN)
- 매장 생성 기능
- 전체 매장 목록 조회
- 지역(도/시/구) 기반 필터링
- 매장 상태 관리
    - 운영
    - 폐점

---

### 👤 2. 관리자 계정 관리
- 임시 관리자 계정 조회
- 관리자 상태 구분
    - ✅ 정상 계정
    - ⚠️ 임시 계정 (비밀번호 변경 필요)
- 관리자 비밀번호 강제 초기화 기능(디스코드 웹훅 활용 슈퍼 어드민에게 알림전송)

---

### 📊 3. 관리자 대시보드

#### 🔹 매장 현황
- 전체 매장 수 표시
- 운영 / 폐점 상태 시각화 (Chart.js)

#### 🔹 관리자 현황
- 전체 관리자 수
- 임시 관리자 수 (KPI 형태)

#### 🔹 지역 분포
- 지역별 매장 수 집계 (`GROUP BY`)
- 차트를 통한 시각화
- 특정 지역 클릭 시 해당 매장 목록 페이지로 이동

---
### 🧑‍💻 4. 기기 관리
#### 기기 등록
- 전체 관리자 측에서의 기기등록
---

## 🔐 인증 방식
- Access Token (JWT)
- Refresh Token (HttpOnly Cookie)
- 역할 기반 접근 제어 (RBAC)
    - SUPER_ADMIN
    - STORE_ADMIN

---

## 📌 특징

- 실시간 운영 환경을 고려한 관리자 시스템 설계
- 지역 기반 데이터 필터링 및 통계 제공
- 직관적인 KPI 및 차트 기반 대시보드 구성
- 실제 매장 운영을 고려한 관리자 계정 관리 기능

---

## 📈 향후 개선 계획

- 매장 상세 분석 기능 추가
- 관리자 활동 로그 추적
- SSE 기반 실시간 통계 업데이트

---

## 📷 화면 예시 (전체 관리)
<img width="1918" height="881" alt="image" src="https://github.com/user-attachments/assets/6b3330b6-02e7-44e2-87dd-25e4f10fa250" />
<img width="1917" height="892" alt="image" src="https://github.com/user-attachments/assets/1de23956-f25c-438b-8ede-76c34fddf1de" />


## 🛠 기술 스택

<img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white">
<img src="https://img.shields.io/badge/MyBatis-000000?style=for-the-badge&logo=MyBatis&logoColor=white">
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
<br>
<img src="https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript&logoColor=F7DF1E">
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<br>

<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Amazon AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white"/>
