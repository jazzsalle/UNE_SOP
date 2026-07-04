# 06 — Seed Data

## 1. Seed Data 개요

1차 POC의 seed data는 특정 도메인 데이터가 아니라, 그래프 저작을 검증하기 위한 노드 템플릿과 샘플 SOPGraph로 구성한다.

## 2. Node Templates

### Trigger Nodes

| Node | 설명 |
|---|---|
| Sensor Event | 센서 이벤트 트리거 |
| Manual Report | 수동 신고/제보 트리거 |
| AI Detection | AI 이상탐지 결과 트리거 |

### Scope Nodes

| Node | 설명 |
|---|---|
| Facility | 시설 단위 범위 |
| Zone | 구역 단위 범위 |
| Evacuation Area | 대피구역 범위 |

### Object Nodes

| Node | 설명 |
|---|---|
| Sensor | 센서 객체 |
| Equipment | 설비 객체 |
| CCTV | 영상 객체 |
| Valve | 밸브 객체 |

### Logic Nodes

| Node | 설명 |
|---|---|
| Condition | 조건 판단 |
| AND / OR | 복합 조건 |
| Branch | 분기 처리 |

### SOP Nodes

| Node | 설명 |
|---|---|
| SOP Task | 단위 임무 |
| SOP Group | 복합 SOP 노드 |
| Checklist | 체크리스트 |

### People Nodes

| Node | 설명 |
|---|---|
| Role | 역할 |
| Contact Group | 담당자 그룹 |
| Agency | 유관기관 |

### Action Nodes

| Node | 설명 |
|---|---|
| SMS | 문자 전파 Mock |
| App Push | 앱푸시 Mock |
| Broadcast | 방송 전파 Mock |

### Runtime Nodes

| Node | 설명 |
|---|---|
| Situation Board | 전자상황판 기록 |
| Timer | 지연/시간 조건 |
| Escalation | 상향 전파 |

## 3. Sample Graph 1: 액화수소 플랜트

```text
가스누출 감지
→ 저장구역 범위 적용
→ 수소센서 객체 필터
→ 위험도 WARNING 이상 조건
→ 가스누출 초동대응 SOP Group
→ SMS/앱 전파
→ 응답 분기
→ 전자상황판 기록
→ 미응답 시 상향 전파
```

### EventContext

```json
{
  "eventId": "EVT-LH2-001",
  "eventType": "GAS_LEAK",
  "severity": "WARNING",
  "source": "simulation",
  "siteId": "SITE-LH2-PLANT",
  "spaceId": "SPACE-STORAGE-ZONE",
  "assetId": "ASSET-H2-SENSOR-001",
  "measuredValues": {
    "h2_ppm": 1200
  }
}
```

## 4. Sample Graph 2: 발전소 모니터링

```text
터빈 진동 이상
→ 터빈실 공간 범위
→ 터빈 설비 필터
→ 진동 임계치 조건
→ 터빈 점검/부하조정 SOP Group
→ 책임자 보고
→ 전자상황판 기록
```

## 5. Sample Graph 3: 안전한국훈련

```text
지진 발생 훈련상황
→ 건물/대피구역 범위
→ 대피유도 SOP Group
→ 교직원/담당자 전파
→ 인원확인 체크리스트
→ 상황판 기록
→ 종료보고
```

## 6. Sample Graph 4: 일반 사업장 안전

```text
작업자 쓰러짐 신고
→ 작업구역 범위
→ CCTV/현장담당자 확인
→ 응급조치 SOP Group
→ 119/관리자 전파
→ 상황판 기록
```
