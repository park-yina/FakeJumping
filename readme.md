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

## 🛠 기술 스택

<img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white">
<img src="https://img.shields.io/badge/MyBatis-000000?style=for-the-badge&logo=MyBatis&logoColor=white">
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
<br>
<img src="https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript&logoColor=F7DF1E">
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">